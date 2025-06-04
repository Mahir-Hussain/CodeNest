from database import Database
import psycopg2
from login import LoginSystem


class Snippets(Database):
    def __init__(self, userid):
        super().__init__()
        self.user_id = userid

    def create_snippet(self, title=None, content=None, language="python"):

        try:
            self.cursor.execute(
                "INSERT INTO code_snippets (title, content, language, user_id) VALUES (%s, %s, %s, %s)",
                (title, content, language, self.user_id),
            )
            self.connection.commit()
            print("Snippet created successfully!")
        except psycopg2.IntegrityError as e:
            self.connection.rollback()
            print(f"Error: {e}")

    def get_snippets(self):
        try:
            self.cursor.execute(
                "SELECT title, content, language, favourite FROM code_snippets WHERE user_id = %s",
                (self.user_id,),
            )
            snippets = self.cursor.fetchall()
            return snippets
        except psycopg2.Error as e:
            self.connection.rollback()
            print(f"Error fetching snippets: {e}")
            return []

    def delete_snippet(self, snippet_id):
        try:
            self.cursor.execute(
                "DELETE FROM code_snippets WHERE id = %s AND user_id = %s",
                (snippet_id, self.user_id),
            )
            self.connection.commit()
            print("Snippet deleted successfully!")
        except psycopg2.IntegrityError as e:
            self.connection.rollback()
            print(f"Error: {e}")
