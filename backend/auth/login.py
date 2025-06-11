import psycopg2
from backend.auth.database import Database
import hashlib
from backend.auth.jwtAuth import jwtAuth


class LoginSystem(Database):
    def __init__(self):
        super().__init__()
        self.jwtAuth = jwtAuth()

    def hash_password(self, password):
        return hashlib.sha256(password.encode()).hexdigest()

    def create_user(self, email, password):
        try:
            self.cursor.execute(
                "INSERT INTO users (email, password) VALUES (%s, %s)",
                (email, self.hash_password(password)),
            ),

            self.connection.commit()
            return {"success": True, "message": "User created successfully!"}
        except psycopg2.IntegrityError as e:
            self.connection.rollback()
            return {"success": False, "error": str(e)}

    def authenticate(self, email, password):
        try:
            self.cursor.execute(
                "SELECT id, password FROM users WHERE email = %s", (email,)
            )
            result = self.cursor.fetchone()
            if result:
                userid, hashed_pw = result
                if hashed_pw == self.hash_password(password):
                    token = self.jwtAuth.generate_token(userid)
                    return {
                        "success": True,
                        "message": "Login Successful",
                        "token": token,
                        "userid": userid,
                    }
                else:
                    print("Incorrect login details-")  # Remove this in production
                    return {"success": False}
            else:
                print("User not found")  # Remove this in production
                return {"success": False}
        except psycopg2.Error as e:
            return {"success": False, "error": f"database error {e}"}

        except psycopg2.IntegrityError as e:
            self.connection.rollback()
            return {"success": False, "error": str(e)}
        except psycopg2.Error as e:
            self.connection.rollback()
            return {"success": False, "error": str(e)}

    def get_user_from_token(self, token):
        """Get user information from JWT token"""
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
            except psycopg2.Error as e:
                return {"success": False, "error": f"Database error: {str(e)}"}
        else:
            return token_result
