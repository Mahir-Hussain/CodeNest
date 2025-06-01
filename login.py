import psycopg2
from database import Database


class LoginSystem(Database):
    def __init__(self):
        super().__init__()

    def create_user(self, email="gmaaa", password="no email"):
        try:
            self.cursor.execute(
                "INSERT INTO users (email, password) VALUES (%s, %s)",
                (email, password),
            )
            self.connection.commit()
            print("User created successfully!")
        except psycopg2.IntegrityError as e:
            print(f"Error: {e}")
