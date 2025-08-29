import psycopg2
import hashlib

from auth.database import Database
from auth.jwtAuth import jwtAuth


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

    def create_user(self, username, password):
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
                (username, self.hash_password(password)),
            )
            self.connection.commit()
            return {"success": True, "message": "User created successfully!"}
        except psycopg2.IntegrityError as error:
            self.connection.rollback()
            return {"success": False, "error": str(error)}

    def delete_user(self, user_id):
        """
        Delete a user from the database.

        Requires:
            user_id (int): The user's ID.

        Returns:
            dict: Success status and message or error.
        """
        try:
            # First, delete all code snippets belonging to the user
            self.cursor.execute("DELETE FROM code_snippets WHERE user_id = %s", (user_id,))
            
            # Then delete the user
            self.cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
            if self.cursor.rowcount > 0:
                self.connection.commit()
                return {"success": True, "message": "User deleted successfully!"}
            else:
                self.connection.rollback()
                return {"success": False, "error": "User not found"}
        except psycopg2.Error as error:
            self.connection.rollback()
            return {"success": False, "error": str(error)}

    def get_dark_mode(self, user_id):
        """
        Get the dark mode preference for a user.

        Requires:
            user_id (int): The user's ID.

        Returns:
            dict: Success status and dark mode preference if found; otherwise, error.
        """
        try:
            self.cursor.execute("SELECT dark_mode FROM users WHERE id = %s", (user_id,))
            result = self.cursor.fetchone()
            if result is not None:
                return {"success": True, "dark_mode": result[0]}
            else:
                return {"success": False, "error": "User not found"}
        except psycopg2.Error as error:
            return {"success": False, "error": f"Database error: {str(error)}"}

    def get_ai_use(self, user_id):
        """
        Get the AI usage status for a user.

        Requires:
            user_id (int): The user's ID.

        Returns:
            bool: Success status and AI usage status if found; otherwise, error.
        """
        try:
            self.cursor.execute("SELECT use_ai FROM users WHERE id = %s", (user_id,))
            result = self.cursor.fetchone()
            if result is not None:
                return {"success": True, "ai_use": result[0]}
            else:
                return {"success": False, "error": "User not found"}
        except psycopg2.Error as error:
            return {"success": False, "error": f"Database error: {str(error)}"}

    def authenticate(self, username, password):
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
                "SELECT id, password FROM users WHERE email = %s", (username,)
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

    def update_user(
        self, user_id, email=None, password=None, dark_mode=None, use_ai=None
    ):
        """
        Update user information in the database using a single SQL statement.

        Requires:
            user_id (int): The user's ID.
            email (str, optional): The new email address.
            password (str, optional): The new plain text password (will be hashed).
            dark_mode (bool, optional): The dark mode preference.
            use_ai (bool, optional): The AI usage status.

        Returns:
            dict: Success status and message or error.
        """
        try:
            updates = []
            values = []

            if email is not None:
                updates.append("email = %s")
                values.append(email)
            if password is not None:
                updates.append("password = %s")
                values.append(self.hash_password(password))
            if dark_mode is not None:
                updates.append("dark_mode = %s")
                values.append(dark_mode)
            if use_ai is not None:
                updates.append("use_ai = %s")
                values.append(use_ai)

            if not updates:
                return {"success": False, "error": "No fields to update"}

            values.append(user_id)
            query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s"
            self.cursor.execute(query, tuple(values))

            if self.cursor.rowcount > 0:
                self.connection.commit()
                return {"success": True, "message": "User updated successfully!"}
            else:
                return {"success": False, "error": "User not found"}
        except psycopg2.IntegrityError as error:
            self.connection.rollback()
            return {
                "success": False,
                "error": f"Database constraint error: {str(error)}",
            }
        except psycopg2.Error as error:
            self.connection.rollback()
            return {"success": False, "error": f"Database error: {str(error)}"}

    def change_password(self, user_id, current_password, new_password):
        """
        Change user password after verifying the current password.

        Requires:
            user_id (int): The user's ID.
            current_password (str): The user's current password.
            new_password (str): The new password.

        Returns:
            dict: Success status and message or error.
        """
        try:
            # First get the user's email to verify current password
            self.cursor.execute(
                "SELECT email, password FROM users WHERE id = %s", (user_id,)
            )
            result = self.cursor.fetchone()

            if not result:
                return {"success": False, "error": "User not found"}

            user_email, stored_password = result

            # Verify current password
            if stored_password != self.hash_password(current_password):
                return {"success": False, "error": "Current password is incorrect"}

            # Update to new password using the update_user method
            return self.update_user(user_id, password=new_password)

        except psycopg2.Error as error:
            return {"success": False, "error": f"Database error: {str(error)}"}
