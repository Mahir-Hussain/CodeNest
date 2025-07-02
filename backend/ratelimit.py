from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from time import time
from backend.auth.jwtAuth import jwtAuth  # Adjust path to match your project


class RateLimit(BaseHTTPMiddleware):
    def __init__(self, app, rate_limit=5, time_window=60):
        super().__init__(app)
        self.auth = jwtAuth()
        self.rate_limit = rate_limit
        self.time_window = time_window
        self.request_counts = {}

    async def dispatch(self, request: Request, call_next):
        public_paths = [
            "/",
            "/login",
            "/create_user",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/favicon.ico",
            "/static/",
        ]

        # Skip middleware for public routes
        if request.url.path in public_paths:
            return await call_next(request)

        # Extract JWT from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing or invalid token"},
            )

        token = auth_header.split(" ")[1]
        auth_result = self.auth.verify_token(token)

        if not auth_result["success"]:
            return JSONResponse(
                status_code=401,
                content={"detail": auth_result["error"]},
            )

        user_id = str(auth_result["user_id"])
        current_time = time()

        # Clean up expired timestamps
        self.request_counts.setdefault(user_id, [])
        self.request_counts[user_id] = [
            t
            for t in self.request_counts[user_id]
            if current_time - t < self.time_window
        ]

        # Enforce rate limit
        if len(self.request_counts[user_id]) >= self.rate_limit:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded"},
                headers={"Retry-After": str(self.time_window)},
            )

        # Log the current request
        self.request_counts[user_id].append(current_time)

        # Forward request and add rate limit header
        response = await call_next(request)
        response.headers["X-RateLimit-Remaining"] = str(
            self.rate_limit - len(self.request_counts[user_id])
        )
        return response
