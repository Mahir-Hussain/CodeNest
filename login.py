import psycopg2
from database import Database
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
            print(f"Error: {e}")

    def authenticate(self):
        self.cursor.execute(
            "SELECT email, password FROM users WHERE email = %s AND password = %s",
            (self.email, self.password),
        )
        if self.cursor.fetchone():
            print("Login successful")
        else:
            print("Incorrect details")
