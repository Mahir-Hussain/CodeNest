from fastapi import Request
from fastapi.responses import JSONResponse
from time import time
from backend.auth.jwtAuth import jwtAuth  # Adjust path to match your project


class RateLimit:
    def __init__(self, app, rate_limit=5, time_window=60):
        self.app = app
        self.auth = jwtAuth()
        self.rate_limit = rate_limit
        self.time_window = time_window
        self.request_counts = {}

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request = Request(scope, receive=receive)

        # Public routes
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
        if request.url.path in public_paths:
            await self.app(scope, receive, send)
            return

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            response = JSONResponse(
                status_code=401, content={"detail": "Missing or invalid token"}
            )
            await response(scope, receive, send)
            return

        token = auth_header.split(" ")[1]
        auth_result = self.auth.verify_token(token)
        if not auth_result["success"]:
            response = JSONResponse(
                status_code=401, content={"detail": auth_result["error"]}
            )
            await response(scope, receive, send)
            return

        user_id = str(auth_result["user_id"])
        current_time = time()
        self.request_counts.setdefault(user_id, [])
        self.request_counts[user_id] = [
            t
            for t in self.request_counts[user_id]
            if current_time - t < self.time_window
        ]

        if len(self.request_counts[user_id]) >= self.rate_limit:
            response = JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded"},
                headers={"Retry-After": str(self.time_window)},
            )
            await response(scope, receive, send)
            return

        self.request_counts[user_id].append(current_time)

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = dict(message.get("headers", []))
                headers[b"x-ratelimit-remaining"] = str(
                    self.rate_limit - len(self.request_counts[user_id])
                ).encode("utf-8")
                message["headers"] = list(headers.items())
            await send(message)

        await self.app(scope, receive, send_wrapper)
