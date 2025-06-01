import psycopg2
from database import Database


class LoginSystem(Database):
    def __init__(self):
        super().__init__()

    def create_user(self, id=3, password="passwo", email="no email"):
        try:
            self.cursor.execute(
                "INSERT INTO users (id, email, password) VALUES (%s, %s, %s)",
                (id, password, email),
            )
            self.connection.commit()
            print("User created successfully!")
        except psycopg2.IntegrityError as e:
            print(f"Error: {e}")
