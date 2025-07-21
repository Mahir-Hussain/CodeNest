import psycopg2
import asyncio
import json
import ast
from concurrent.futures import ThreadPoolExecutor

from auth.database import Database
from auth.jwtAuth import jwtAuth, require_auth
from code_data_ai import CodeDataAI
from auth.encryption import Encryption


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
        Converts a JSON string of tags to a Python list.
        Handles errors and ensures it returns a list.
        """
        try:
            if isinstance(tags, str):
                return ast.literal_eval(
                    tags
                )  # Use ast to safely parse Python-like strings
            elif isinstance(tags, list):
                return tags
        except Exception as e:
            print("Tag parsing failed:", e)  # Think it fires if empty
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
            data = await ai.get_all_data(content)
            title = data["title"]
            language = data["language"]
            tags = data["tags"]

        if title == "" or title == "Untitled Snippet":
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
            enriched = await self.run_ai_enrichment(content, title, language, tags)
            try:
                self.cursor.execute(
                    "UPDATE code_snippets SET title = %s, language = %s, tags = %s WHERE id = %s",
                    (
                        self.encryptor.encrypt(enriched["title"]),
                        self.encryptor.encrypt(enriched["language"]),
                        self.encryptor.encrypt(json.dumps(enriched["tags"])),
                        snippet_id,
                    ),
                )
                self.connection.commit()
            except psycopg2.Error as e:
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

            decrypted_tags = self.encryptor.decrypt(tags)
            parsed_tags = self.convert_tags(decrypted_tags)

            snippet = {
                "id": id,
                "title": self.encryptor.decrypt(title),
                "content": self.encryptor.decrypt(content),
                "language": self.encryptor.decrypt(language),
                "favourite": self.encryptor.decrypt(favourite) == "true",
                "created_at": created_at,
                "tags": parsed_tags,
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
            json_tags = json.dumps(tags or [])
            encrypted_tags = self.encryptor.encrypt(json_tags)

            self.cursor.execute(
                "INSERT INTO code_snippets (title, content, language, user_id, favourite, tags, is_public) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (
                    self.encryptor.encrypt(new_title),
                    self.encryptor.encrypt(content),
                    self.encryptor.encrypt(language),
                    self.user_id,
                    self.encryptor.encrypt(str(favourite).lower()),
                    encrypted_tags,
                    is_public,
                ),
            )
            snippet_id = self.cursor.fetchone()[0]
            self.connection.commit()

            if ai_usage:
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
                "SELECT id, title, content, language, favourite, created_at, tags, is_public FROM code_snippets WHERE user_id = %s",
                (self.user_id,),
            )
            data = self.cursor.fetchall()
            snippets = []
            for row in data:
                id, title, content, language, favourite, created_at, tags, is_public = (
                    row
                )

                try:
                    decrypted_tags = self.encryptor.decrypt(tags)
                    parsed_tags = self.convert_tags(decrypted_tags)
                except Exception as e:
                    print("Tag parsing failed:", e)
                    parsed_tags = []

                snippet = {
                    "id": id,
                    "title": self.encryptor.decrypt(title),
                    "content": self.encryptor.decrypt(content),
                    "language": self.encryptor.decrypt(language),
                    "favourite": favourite,  # favourite is already a boolean, no need to decrypt
                    "created_at": created_at,
                    "tags": parsed_tags,
                    "is_public": is_public if is_public is not None else False,
                }
                snippets.append(snippet)
            return {"success": True, "snippets": snippets}
        except psycopg2.Error as error:
            self.connection.rollback()
            print("Error fetching snippets:", error)
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

    @require_auth
    def edit_snippet(
        self,
        snippet_id,
        title,
        content,
        language,
        tags=None,
        is_public=False,
        favourite=False,
    ):
        try:
            self.cursor.execute(
                "SELECT id FROM code_snippets WHERE id = %s AND user_id = %s",
                (snippet_id, self.user_id),
            )
            if not self.cursor.fetchone():
                return {
                    "success": False,
                    "error": "Snippet not found or not owned by user",
                }

            new_title = title if title else "Untitled Snippet"

            json_tags = json.dumps(tags or [])
            encrypted_tags = self.encryptor.encrypt(json_tags)

            self.cursor.execute(
                "UPDATE code_snippets SET title = %s, content = %s, language = %s, tags = %s, is_public = %s, favourite = %s "
                "WHERE id = %s AND user_id = %s",
                (
                    self.encryptor.encrypt(new_title),
                    self.encryptor.encrypt(content),
                    self.encryptor.encrypt(language),
                    encrypted_tags,
                    is_public,
                    favourite,
                    snippet_id,
                    self.user_id,
                ),
            )

            self.connection.commit()
            return {"success": True, "message": "Snippet updated successfully!"}

        except psycopg2.Error as error:
            self.connection.rollback()
            return {"success": False, "error": str(error)}
