import time
import asyncio
from typing import Dict, Optional, Union
from fastapi import HTTPException, Request
from functools import wraps
import threading


class UserRateLimiter:
    """
    A thread-safe rate limiter that tracks requests per user ID.
    Supports different rate limits for different endpoints.
    """

    def __init__(self):
        self.user_requests: Dict[int, Dict[str, list]] = {}
        self.lock = threading.RLock()

    def is_allowed(
        self, user_id: int, endpoint: str, limit: int, window: int
    ) -> tuple[bool, dict]:
        """
        Check if a user is allowed to make a request to a specific endpoint.

        Args:
            user_id (int): The user's ID
            endpoint (str): The endpoint being accessed
            limit (int): Maximum number of requests allowed in the time window
            window (int): Time window in seconds

        Returns:
            tuple: (is_allowed: bool, info: dict with remaining requests and reset time)
        """
        current_time = time.time()

        with self.lock:
            # Initialize user tracking if not exists
            if user_id not in self.user_requests:
                self.user_requests[user_id] = {}

            # Initialize endpoint tracking for user if not exists
            if endpoint not in self.user_requests[user_id]:
                self.user_requests[user_id][endpoint] = []

            # Get user's requests for this endpoint
            requests = self.user_requests[user_id][endpoint]

            # Remove expired requests (outside the time window)
            self.user_requests[user_id][endpoint] = [
                req_time for req_time in requests if current_time - req_time < window
            ]

            # Update the reference after cleanup
            requests = self.user_requests[user_id][endpoint]

            # Check if limit is exceeded
            if len(requests) >= limit:
                # Find the oldest request to determine reset time
                oldest_request = min(requests) if requests else current_time
                reset_time = oldest_request + window
                remaining = 0
                allowed = False
            else:
                # Add current request timestamp
                requests.append(current_time)
                remaining = limit - len(requests)
                reset_time = current_time + window
                allowed = True

            info = {
                "remaining": remaining,
                "reset_time": reset_time,
                "limit": limit,
                "window": window,
            }

            return allowed, info

    def cleanup_expired_entries(self, max_age: int = 3600):
        """
        Clean up expired entries to prevent memory leaks.
        Should be called periodically.

        Args:
            max_age (int): Maximum age in seconds for keeping entries
        """
        current_time = time.time()

        with self.lock:
            users_to_remove = []
            for user_id, endpoints in self.user_requests.items():
                endpoints_to_remove = []
                for endpoint, requests in endpoints.items():
                    # Remove old requests
                    recent_requests = [
                        req_time
                        for req_time in requests
                        if current_time - req_time < max_age
                    ]

                    if recent_requests:
                        self.user_requests[user_id][endpoint] = recent_requests
                    else:
                        endpoints_to_remove.append(endpoint)

                # Remove empty endpoints
                for endpoint in endpoints_to_remove:
                    del self.user_requests[user_id][endpoint]

                # Mark user for removal if no endpoints left
                if not self.user_requests[user_id]:
                    users_to_remove.append(user_id)

            # Remove empty users
            for user_id in users_to_remove:
                del self.user_requests[user_id]


class IPRateLimiter:
    """
    A thread-safe rate limiter that tracks requests per IP address.
    Used for public endpoints without authentication.
    """

    def __init__(self):
        self.ip_requests: Dict[str, Dict[str, list]] = {}
        self.lock = threading.RLock()

    def is_allowed(
        self, ip_address: str, endpoint: str, limit: int, window: int
    ) -> tuple[bool, dict]:
        """
        Check if an IP is allowed to make a request to a specific endpoint.

        Args:
            ip_address (str): The client's IP address
            endpoint (str): The endpoint being accessed
            limit (int): Maximum number of requests allowed in the time window
            window (int): Time window in seconds

        Returns:
            tuple: (is_allowed: bool, info: dict with remaining requests and reset time)
        """
        current_time = time.time()

        with self.lock:
            # Initialize IP tracking if not exists
            if ip_address not in self.ip_requests:
                self.ip_requests[ip_address] = {}

            # Initialize endpoint tracking for IP if not exists
            if endpoint not in self.ip_requests[ip_address]:
                self.ip_requests[ip_address][endpoint] = []

            # Get IP's requests for this endpoint
            requests = self.ip_requests[ip_address][endpoint]

            # Remove expired requests (outside the time window)
            self.ip_requests[ip_address][endpoint] = [
                req_time for req_time in requests if current_time - req_time < window
            ]

            # Update the reference after cleanup
            requests = self.ip_requests[ip_address][endpoint]

            # Check if limit is exceeded
            if len(requests) >= limit:
                # Find the oldest request to determine reset time
                oldest_request = min(requests) if requests else current_time
                reset_time = oldest_request + window
                remaining = 0
                allowed = False
            else:
                # Add current request timestamp
                requests.append(current_time)
                remaining = limit - len(requests)
                reset_time = current_time + window
                allowed = True

            info = {
                "remaining": remaining,
                "reset_time": reset_time,
                "limit": limit,
                "window": window,
            }

            return allowed, info

    def cleanup_expired_entries(self, max_age: int = 3600):
        """
        Clean up expired IP entries to prevent memory leaks.
        Should be called periodically.

        Args:
            max_age (int): Maximum age in seconds for keeping entries
        """
        current_time = time.time()

        with self.lock:
            ips_to_remove = []
            for ip_address, endpoints in self.ip_requests.items():
                endpoints_to_remove = []
                for endpoint, requests in endpoints.items():
                    # Remove old requests
                    recent_requests = [
                        req_time
                        for req_time in requests
                        if current_time - req_time < max_age
                    ]

                    if recent_requests:
                        self.ip_requests[ip_address][endpoint] = recent_requests
                    else:
                        endpoints_to_remove.append(endpoint)

                # Remove empty endpoints
                for endpoint in endpoints_to_remove:
                    del self.ip_requests[ip_address][endpoint]

                # Mark IP for removal if no endpoints left
                if not self.ip_requests[ip_address]:
                    ips_to_remove.append(ip_address)

            # Remove empty IPs
            for ip_address in ips_to_remove:
                del self.ip_requests[ip_address]


# Global rate limiter instances
rate_limiter = UserRateLimiter()
ip_rate_limiter = IPRateLimiter()


def rate_limit(requests_per_minute: int = 60, endpoint_name: Optional[str] = None):
    """
    Decorator for rate limiting FastAPI endpoints by user ID.

    Args:
        requests_per_minute (int): Maximum requests per minute per user
        endpoint_name (str): Custom endpoint name for rate limiting (optional)

    Usage:
        @rate_limit(requests_per_minute=30)
        async def my_endpoint(user_id: int = Depends(get_current_user_id)):
            ...
    """

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract user_id from kwargs (assuming it's passed as a dependency)
            user_id = kwargs.get("user_id")
            if user_id is None:
                # Try to find user_id in args (fallback)
                for arg in args:
                    if (
                        isinstance(arg, int) and arg > 0
                    ):  # Assume positive int is user_id
                        user_id = arg
                        break

            if user_id is None:
                raise HTTPException(
                    status_code=500, detail="User ID not found for rate limiting"
                )

            # Use custom endpoint name or function name
            endpoint = endpoint_name or func.__name__

            # Check rate limit (60 seconds window)
            allowed, info = rate_limiter.is_allowed(
                user_id=user_id, endpoint=endpoint, limit=requests_per_minute, window=60
            )

            if not allowed:
                # Calculate retry after seconds
                retry_after = int(info["reset_time"] - time.time())
                raise HTTPException(
                    status_code=429,
                    detail={
                        "message": f"Rate limit exceeded. Try again in {retry_after} seconds.",
                        "retry_after": retry_after,
                        "limit": info["limit"],
                        "window": info["window"],
                    },
                    headers={
                        "Retry-After": str(retry_after),
                        "X-RateLimit-Limit": str(info["limit"]),
                        "X-RateLimit-Remaining": str(info["remaining"]),
                        "X-RateLimit-Reset": str(int(info["reset_time"])),
                    },
                )

            # Call the original function
            return await func(*args, **kwargs)

        return wrapper

    return decorator


def ip_rate_limit(requests_per_minute: int = 10, endpoint_name: Optional[str] = None):
    """
    Decorator for rate limiting FastAPI endpoints by IP address.
    Used for public endpoints without authentication.

    Args:
        requests_per_minute (int): Maximum requests per minute per IP
        endpoint_name (str): Custom endpoint name for rate limiting (optional)

    Usage:
        @ip_rate_limit(requests_per_minute=5)
        async def login(request: Request, credentials: LoginData):
            ...
    """

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract request object to get IP address
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break

            # Also check in kwargs
            if request is None:
                request = kwargs.get("request")

            if request is None:
                # If no request object found, try to continue without rate limiting
                # This shouldn't happen in normal FastAPI usage
                return await func(*args, **kwargs)

            # Get client IP address
            client_ip = request.client.host if request.client else "unknown"

            # Use custom endpoint name or function name
            endpoint = endpoint_name or func.__name__

            # Check rate limit (60 seconds window)
            allowed, info = ip_rate_limiter.is_allowed(
                ip_address=client_ip,
                endpoint=endpoint,
                limit=requests_per_minute,
                window=60,
            )

            if not allowed:
                # Calculate retry after seconds
                retry_after = int(info["reset_time"] - time.time())
                raise HTTPException(
                    status_code=429,
                    detail={
                        "message": f"Rate limit exceeded. Try again in {retry_after} seconds.",
                        "retry_after": retry_after,
                        "limit": info["limit"],
                        "window": info["window"],
                    },
                    headers={
                        "Retry-After": str(retry_after),
                        "X-RateLimit-Limit": str(info["limit"]),
                        "X-RateLimit-Remaining": str(info["remaining"]),
                        "X-RateLimit-Reset": str(int(info["reset_time"])),
                    },
                )

            # Call the original function
            return await func(*args, **kwargs)

        return wrapper

    return decorator


class RateLimitMiddleware:
    """
    Middleware for adding rate limiting headers to all responses.
    """

    def __init__(self, app, default_limit: int = 60):
        self.app = app
        self.default_limit = default_limit

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            # You can add global rate limiting logic here if needed
            pass

        await self.app(scope, receive, send)


# Background task to cleanup expired entries
async def cleanup_rate_limiter():
    """
    Background task to periodically clean up expired rate limiter entries.
    Should be called in your FastAPI lifespan manager.
    """
    while True:
        await asyncio.sleep(300)  # Clean up every 5 minutes
        rate_limiter.cleanup_expired_entries(3600)  # Keep entries for 1 hour max
        ip_rate_limiter.cleanup_expired_entries(3600)  # Clean up IP entries too
