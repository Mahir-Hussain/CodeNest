import psycopg2
from backend.database import Database
import hashlib


class LoginSystem(Database):
    def __init__(self, email, password):
        super().__init__()
        self.email = email
        self.password = self.hash_password(password)

    def hash_password(self, password):
        return hashlib.sha256(password.encode()).hexdigest()

    def create_user(self):
        try:
            self.cursor.execute(
                "INSERT INTO users (email, password) VALUES (%s, %s)",
                (self.email, self.password),
            ),

            self.connection.commit()
            print("User created successfully!")
        except psycopg2.IntegrityError as e:
            self.connection.rollback()
            print(f"Error: {e}")

    def authenticate(self):
        self.cursor.execute(
            "SELECT id, password FROM users WHERE email = %s", (self.email,)
        )
        result = self.cursor.fetchone()
        if result:
            userid, hashed_pw = result
            if hashed_pw == self.password:
                return userid
            else:
                print("Incorrect login details-")
        else:
            print("User not found")

    def delete_user(self):
        try:
            self.cursor.execute(
                "DELETE FROM users WHERE email = %s", (self.email,)
            )
            self.connection.commit()
            print("User successfully deleted")
        except psycopg2.IntegrityError as e:
            self.connection.rollback()
            print(f"Error {e}")

