import psycopg2
import asyncio
from concurrent.futures import ThreadPoolExecutor
import ast

from backend.auth.database import Database
from backend.auth.jwtAuth import jwtAuth, require_auth
from backend.code_data_ai import CodeDataAI
from backend.auth.encryption import Encryption


class Snippets(Database):
    executor = ThreadPoolExecutor()  # Shared across instances
    event_loop = None  # Set from FastAPI at app startup

    def __init__(self, user_id):
        super().__init__()
        self.user_id = user_id
        self.jwt_auth = jwtAuth()
        self.encryptor = Encryption()  # Set up the encryptor

    def convert_tags(self, tags: str):
        """
        Safely parse tags from a string representation of a list.
        Returns an empty list if parsing fails.
        """
        try:
            return ast.literal_eval(tags) if isinstance(tags, str) else tags
        except:
            return []

    def authenticate(self, token):
        token_result = self.jwt_auth.verify_token(token)
        if token_result["success"]:
            self.user_id = token_result["user_id"]
            return {"success": True, "user_id": self.user_id}
        return token_result

    async def run_ai_enrichment(self, content, title=None, language=None, tags=None):
        ai = CodeDataAI()
        if title == "Untitled Snippet" and language == "" and tags == []:
            print("running uheiufhne")
            data = await ai.get_all_data(content)
            title = data["title"]
            language = data["language"]
            tags = data["tags"]

        if title == "" or title == "Untitled Snippet":
            print("title is None, running AI for title")
            title = await ai.get_title(content)

        if language == "":
            language = await ai.get_language(content)

        if tags == []:
            tags = await ai.get_tags(content)

        return {
            "title": title or "Untitled Snippet",
            "language": language,
            "tags": tags,
        }

    def run_ai_enrichment_and_update(self, snippet_id, content, title, language, tags):
        async def inner():
            print("inner() called for AI enrichment")
            enriched = await self.run_ai_enrichment(content, title, language, tags)
            try:
                self.cursor.execute(
                    "UPDATE code_snippets SET title = %s, language = %s, tags = %s WHERE id = %s",
                    (
                        self.encryptor.encrypt(enriched["title"]),
                        self.encryptor.encrypt(enriched["language"]),
                        enriched["tags"],
                        snippet_id,
                    ),
                )
                print(enriched["title"], enriched["language"], enriched["tags"])
                self.connection.commit()
            except Exception as e:
                self.connection.rollback()
                print(f"AI enrichment DB update failed: {e}")

        if Snippets.event_loop:
            asyncio.run_coroutine_threadsafe(inner(), Snippets.event_loop)
        else:
            print("⚠️ No event loop available for background enrichment")

    def get_public_snippet_by_id(self, snippet_id: int):
        """
        Fetch a single public snippet by ID and decrypt its fields.

        Args:
            snippet_id (int): The ID of the snippet to fetch.

        Returns:
            dict: Success status and snippet data or error message.
        """
        try:
            self.cursor.execute(
                "SELECT id, title, content, language, favourite, created_at, tags "
                "FROM code_snippets WHERE id = %s AND is_public = TRUE",
                (snippet_id,),
            )
            row = self.cursor.fetchone()
            if row is None:
                return {"success": False, "error": "Snippet not found or not public"}

            id, title, content, language, favourite, created_at, tags = row
            snippet = {
                "id": id,
                "title": self.encryptor.decrypt(title),
                "content": self.encryptor.decrypt(content),
                "language": self.encryptor.decrypt(language),
                "favourite": favourite,
                "created_at": created_at,
                "tags": self.convert_tags(tags),
            }
            return {"success": True, "snippet": snippet}

        except psycopg2.Error as error:
            return {
                "success": False,
                "error": f"Error fetching snippet: {str(error)}",
            }

    @require_auth
    def create_snippet(
        self,
        title=None,
        content=None,
        language=None,
        favourite=False,
        tags=None,
        ai_usage=False,
        is_public=False,
    ):
        new_title = title if title else "Untitled Snippet"
        try:
            self.cursor.execute(
                "INSERT INTO code_snippets (title, content, language, user_id, favourite, tags, is_public) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (
                    self.encryptor.encrypt(new_title),
                    self.encryptor.encrypt(content),
                    self.encryptor.encrypt(language),
                    self.user_id,
                    favourite,
                    tags,  # Comes in as a list already
                    is_public,
                ),
            )
            snippet_id = self.cursor.fetchone()[0]
            self.connection.commit()

            if ai_usage:
                print("if self.ai_usage:")
                Snippets.executor.submit(
                    self.run_ai_enrichment_and_update,
                    snippet_id,
                    content,
                    title,
                    language,
                    tags,
                )

            return {"success": True, "message": "Snippet created successfully!"}
        except psycopg2.IntegrityError as error:
            self.connection.rollback()
            return {"success": False, "error": str(error)}

    @require_auth
    def get_snippets(self):
        try:
            self.cursor.execute(
                "SELECT id, title, content, language, favourite, created_at, tags FROM code_snippets WHERE user_id = %s",
                (self.user_id,),
            )
            data = self.cursor.fetchall()
            snippets = []
            for row in data:
                id, title, content, language, favourite, created_at, tags = row
                snippet = {
                    "id": id,
                    "title": self.encryptor.decrypt(title),
                    "content": self.encryptor.decrypt(content),
                    "language": self.encryptor.decrypt(language),
                    "favourite": favourite,
                    "created_at": created_at,
                    "tags": self.convert_tags(tags),
                }
                snippets.append(snippet)
            return {"success": True, "snippets": snippets}
        except psycopg2.Error as error:
            self.connection.rollback()
            return {"success": False, "error": f"Error fetching snippets: {str(error)}"}

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

        except psycopg2.Error as error:
            self.connection.rollback()
            return {"success": False, "error": str(error)}
