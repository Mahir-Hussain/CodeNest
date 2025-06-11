from backend.database import Database
from backend.jwtAuth import jwtAuth, require_auth
import psycopg2


class Snippets(Database):
    def __init__(self, userid):
        super().__init__()
        self.user_id = userid
        self.jwtAuth = jwtAuth()

    def authenticate(self, token):
        """Authenticate user with JWT token and set user_id"""
        token_result = self.jwtAuth.verify_token(token)
        if token_result["success"]:
            self.user_id = token_result["user_id"]
            return {"success": True, "user_id": self.user_id}
        else:
            return token_result

    @require_auth
    def create_snippet(
        self, title=None, content=None, language=None
    ):  # Detect later w/ ai
        try:
            self.cursor.execute(
                "INSERT INTO code_snippets (title, content, language, user_id) VALUES (%s, %s, %s, %s)",
                (title, content, language, self.user_id),
            )
            self.connection.commit()
            return {"success": True, "message": "Snippet created successfully!"}
        except psycopg2.IntegrityError as e:
            self.connection.rollback()
            return {"success": False, "error": str(e)}

    @require_auth
    def get_snippets(self):
        try:
            self.cursor.execute(
                "SELECT id, title, content, language, favourite FROM code_snippets WHERE user_id = %s",
                (self.user_id,),
            )
            snippets = self.cursor.fetchall()
            return {"success": True, "snippets": snippets}
        except psycopg2.Error as e:
            self.connection.rollback()
            return {"success": False, "error": f"Error fetching snippets: {str(e)}"}

    @require_auth
    def delete_snippet(self, snippet_id):
        try:
            self.cursor.execute(
                "DELETE FROM code_snippets WHERE id = %s AND user_id = %s",
                (snippet_id, self.user_id),
            )

            if self.cursor.rowcount > 0:
                self.connection.commit()
                return {"success": True, "message": "Snippet deleted successfully!"}
            else:
                return {
                    "success": False,
                    "error": "Snippet not found or not owned by user",
                }

        except psycopg2.Error as e:
            self.connection.rollback()
            return {"success": False, "error": str(e)}
