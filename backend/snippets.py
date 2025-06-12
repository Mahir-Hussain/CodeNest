from backend.auth.database import Database
from backend.auth.jwtAuth import jwtAuth, require_auth
import psycopg2


class Snippets(Database):
    def __init__(self, user_id):
        """
        Initialize the Snippets class for a specific user.

        Requires:
            user_id (int): The ID of the user for whom snippets are managed.
        """
        super().__init__()
        self.user_id = user_id
        self.jwt_auth = jwtAuth()

    def authenticate(self, token):
        """
        Authenticate a user using a JWT token and set the user_id.

        Requires:
            token (str): The JWT token to verify.

        Returns:
            dict: Result of authentication with success status and user_id if successful.
        """
        token_result = self.jwt_auth.verify_token(token)
        if token_result["success"]:
            self.user_id = token_result["user_id"]
            return {"success": True, "user_id": self.user_id}
        else:
            return token_result

    @require_auth
    def create_snippet(self, title=None, content=None, language=None):
        """
        Create a new code snippet for the authenticated user.

        Requires:
            title (str, optional): The title of the snippet.
            content (str, optional): The code/content of the snippet.
            language (str, optional): The programming language of the snippet.

        Returns:
            dict: Success status and message or error.
        """
        try:
            self.cursor.execute(
                "INSERT INTO code_snippets (title, content, language, user_id) VALUES (%s, %s, %s, %s)",
                (title, content, language, self.user_id),
            )
            self.connection.commit()
            return {"success": True, "message": "Snippet created successfully!"}
        except psycopg2.IntegrityError as error:
            self.connection.rollback()
            return {"success": False, "error": str(error)}

    @require_auth
    def get_snippets(self):
        """
        Retrieve all code snippets for the authenticated user.

        Requires:
            None (uses self.user_id)

        Returns:
            dict: Success status and list of snippets or error.
        """
        try:
            self.cursor.execute(
                "SELECT id, title, content, language, favourite, created_at FROM code_snippets WHERE user_id = %s",
                (self.user_id,),
            )
            snippets = self.cursor.fetchall()
            return {"success": True, "snippets": snippets}
        except psycopg2.Error as error:
            self.connection.rollback()
            return {"success": False, "error": f"Error fetching snippets: {str(error)}"}

    @require_auth
    def delete_snippet(self, snippet_id):
        """
        Delete a code snippet by its ID for the authenticated user.

        Requires:
            snippet_id (int): The ID of the snippet to delete.

        Returns:
            dict: Success status and message or error.
        """
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

        except psycopg2.Error as error:
            self.connection.rollback()
            return {"success": False, "error": str(error)}
