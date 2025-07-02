from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from time import time
from fastapi.responses import JSONResponse


# Using fastapi-limiter with redis is better but this is fine for now


# Returns a json of
# {
#  "detail": "Too Many Requests"
# }
class RateLimit(BaseHTTPMiddleware):
    def __init__(self, app, rate_limit=5, time_window=60):
        super().__init__(app)
        self.request_counts = {}
        self.rate_limit = rate_limit
        self.time_window = time_window

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        current_time = time()

        # Initialize IP entry if not present
        if client_ip not in self.request_counts:
            self.request_counts[client_ip] = []

        # Remove old timestamps
        self.request_counts[client_ip] = [
            t
            for t in self.request_counts[client_ip]
            if current_time - t < self.time_window
        ]

        # Check if limit is exceeded
        if len(self.request_counts[client_ip]) >= self.rate_limit:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too Many Requests"},
                headers={"Retry-After": str(self.time_window)},
            )
        # Add current request time
        self.request_counts[client_ip].append(current_time)

        # Optionally, set rate-limit headers
        response = await call_next(request)
        response.headers["X-RateLimit-Remaining"] = str(
            self.rate_limit - len(self.request_counts[client_ip])
        )
        return response
