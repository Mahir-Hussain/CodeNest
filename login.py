import psycopg2
from database import Database


class LoginSystem(Database):
    def __init__(self, email, password):
        super().__init__()
        self.email = email
        self.password = password

    def create_user(self):
        try:
            self.cursor.execute(
                "INSERT INTO users (email, password) VALUES (%s, %s)",
                (self.email, self.password),
            )
            self.connection.commit()
            print("User created successfully!")
        except psycopg2.IntegrityError as e:
            print(f"Error: {e}")
