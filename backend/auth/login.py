import psycopg2
from backend.auth.database import Database
import hashlib
from backend.auth.jwtAuth import jwtAuth


class LoginSystem(Database):
    def __init__(self):
        """
        Sets up the database connection and initializes JWT authentication.
        """
        super().__init__()
        self.jwtAuth = jwtAuth()

    def hash_password(self, password):
        """
        Hash a password using SHA-256.

        Requires:
            password (str): The plain text password to hash.

        Returns:
            str: The hashed password as a hexadecimal string.
        """
        return hashlib.sha256(password.encode()).hexdigest()

    def create_user(self, email, password):
        """
        Create a new user in the database.

        Requires:
            email (str): The user's email address.
            password (str): The user's plain text password.

        Returns:
            dict: Success status and message or error.
        """
        try:
            self.cursor.execute(
                "INSERT INTO users (email, password) VALUES (%s, %s)",
                (email, self.hash_password(password)),
            )
            self.connection.commit()
            return {"success": True, "message": "User created successfully!"}
        except psycopg2.IntegrityError as error:
            self.connection.rollback()
            return {"success": False, "error": str(error)}

    def authenticate(self, email, password):
        """
        Authenticate a user by email and password.

        Requires:
            email (str): The user's email address.
            password (str): The user's plain text password.

        Returns:
            dict: Success status, message, JWT token, and user ID if successful; otherwise, error.
        """
        try:
            self.cursor.execute(
                "SELECT id, password FROM users WHERE email = %s", (email,)
            )
            result = self.cursor.fetchone()
            if result:
                user_id, hashed_pw = result
                if hashed_pw == self.hash_password(password):
                    token = self.jwtAuth.generate_token(user_id)
                    return {
                        "success": True,
                        "message": "Login Successful",
                        "token": token,
                        "userid": user_id,
                    }
                else:
                    # Incorrect password
                    return {"success": False}
            else:
                # User not found
                return {"success": False}
        except psycopg2.Error as error:
            return {"success": False, "error": f"Database error: {error}"}
        except psycopg2.IntegrityError as error:
            self.connection.rollback()
            return {"success": False, "error": str(error)}
        except psycopg2.Error as error:
            self.connection.rollback()
            return {"success": False, "error": str(error)}

    def get_user_from_token(self, token):
        """
        Get user information from a JWT token.

        Requires:
            token (str): The JWT token to verify and extract user information.

        Returns:
            dict: Success status and user info if successful; otherwise, error.
        """
        token_result = self.jwtAuth.verify_token(token)
        if token_result["success"]:
            try:
                self.cursor.execute(
                    "SELECT id, email FROM users WHERE id = %s",
                    (token_result["user_id"],),
                )
                user_data = self.cursor.fetchone()
                if user_data:
                    return {
                        "success": True,
                        "user": {"id": user_data[0], "email": user_data[1]},
                    }
                else:
                    return {"success": False, "error": "User not found"}
            except psycopg2.Error as error:
                return {"success": False, "error": f"Database error: {str(error)}"}
        else:
            return token_result
