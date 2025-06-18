import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps

from backend.auth.secret import jwt_secret


class jwtAuth:
    def __init__(self):
        """
        Sets up the secret key for JWT operations.
        """
        self.secret_key = jwt_secret

    def generate_token(self, user_id, expires_in_hours=24):
        """
        Generate a JWT token for a user.

        Requires:
            user_id (int): The ID of the user for whom the token is generated.
            expires_in_hours (int, optional): Number of hours until the token expires (default is 24).

        Returns:
            str: The encoded JWT token as a string.
        """
        payload = {
            "user_id": user_id,
            "exp": datetime.now(timezone.utc)
            + timedelta(hours=expires_in_hours),  # Expiry time
            "iat": datetime.now(timezone.utc),  # Issue time
        }
        return jwt.encode(payload, self.secret_key, algorithm="HS256")

    def verify_token(self, token):
        """
        Verify a JWT token and extract the user ID.

        Requires:
            token (str): The JWT token to verify.

        Returns:
            dict: Success status and user_id if valid, or error message if invalid or expired.
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"])
            return {"success": True, "user_id": payload["user_id"]}
        except jwt.ExpiredSignatureError:
            return {"success": False, "error": "Token has expired"}
        except jwt.InvalidTokenError:
            return {"success": False, "error": "Invalid token"}


def require_auth(func):
    """
    Decorator to require JWT authentication for a method.

    Requires:
        func (callable): The function to wrap. The class instance must have a 'user_id' attribute.

    Returns:
        callable: The wrapped function that raises an Exception if 'user_id' is not set.
    """

    @wraps(func)
    def wrapper(self, *args, **kwargs):
        if not self.user_id:
            raise Exception("Authentication required")
        return func(self, *args, **kwargs)

    return wrapper
