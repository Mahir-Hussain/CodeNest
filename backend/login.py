import psycopg2
from backend.database import Database
import hashlib


class LoginSystem(Database):
    def __init__(self):
        super().__init__()

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
        self.cursor.execute("SELECT id, password FROM users WHERE email = %s", (email,))
        result = self.cursor.fetchone()
        if result:
            userid, hashed_pw = result
            if hashed_pw == self.hash_password(password):
                return userid
            else:
                print("Incorrect login details-")  # Remove this in production
                return None
        else:
            print("User not found")  # Remove this in production
            return None

    def delete_user(self, email):
        try:
            self.cursor.execute("DELETE FROM users WHERE email = %s", (email,))
            self.connection.commit()
            print("User successfully deleted")
        except psycopg2.IntegrityError as e:
            self.connection.rollback()
            print(f"Error {e}")
