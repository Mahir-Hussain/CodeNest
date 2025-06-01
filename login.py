import psycopg2
from database import Database


class LoginSystem(Database):
    def __init__(self):
        super().__init__()

    def create_user(self, username=1, password="pass", email="no email"):
        try:
            self.cursor.execute(
                """
                INSERT INTO users (username, password, email)
                VALUES (?, ?, ?)
            """,
                (username, password, email),
            )
            self.connection.commit()
            print("User created successfully!")
        except psycopg2.IntegrityError as e:
            print(f"Error: {e}")
