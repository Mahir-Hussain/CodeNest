from database import Database
import psycopg2
from login import LoginSystem

p = LoginSystem("emailtoday", "password123")


class Snippets(Database):
    def __init__(self):
        super().__init__()
        self.user_id = p.authenticate()

    def create_snippet(self):
        title = ""
        content = ""
        language = "python"

        try:
            self.cursor.execute(
                "INSERT INTO code_snippets (title, content, language, user_id) VALUES (%s, %s, %s, %s)",
                (title, content, language, self.user_id),
            )
            self.connection.commit()
            print("Snippet created successfully!")
        except psycopg2.IntegrityError as e:
            print(f"Error: {e}")
