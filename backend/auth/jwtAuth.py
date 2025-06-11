import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from backend.auth.secret import jwt_secret


class jwtAuth:
    def __init__(self):
        self.secret_key = jwt_secret

    def generate_token(self, user_id, expires_in_hours=24):
        """Generate a JWT token for a user"""
        payload = {
            "user_id": user_id,
            "exp": datetime.now(timezone.utc)  # expiry
            + timedelta(hours=expires_in_hours),
            "iat": datetime.now(timezone.utc),  # Issue time
        }
        return jwt.encode(payload, self.secret_key, algorithm="HS256")

    def verify_token(self, token):
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"])
            return {"success": True, "user_id": payload["user_id"]}
        except jwt.ExpiredSignatureError:
            return {"success": False, "error": "Token has expired"}
        except jwt.InvalidTokenError:
            return {"success": False, "error": "Invalid token"}


def require_auth(func):
    """Decorator to require JWT authentication"""

    @wraps(func)  # Allows this logic to be put on any function
    def wrapper(
        self, *args, **kwargs
    ):  # Passes in any parameters the function may take
        if not self.user_id:
            raise Exception("Authentication required")
        return func(self, *args, **kwargs)

    return wrapper
