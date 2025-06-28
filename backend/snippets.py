import psycopg2
import asyncio
from concurrent.futures import ThreadPoolExecutor

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
        self.ai_usage = True  # Enable this based on user preference

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

    @require_auth
    def create_snippet(
        self, title=None, content=None, language=None, favourite=False, tags=None
    ):
        new_title = title if title else "Untitled Snippet"
        print("create_snippet called with title:", new_title)
        try:
            self.cursor.execute(
                "INSERT INTO code_snippets (title, content, language, user_id, favourite, tags) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
                (
                    self.encryptor.encrypt(new_title),
                    self.encryptor.encrypt(content),
                    self.encryptor.encrypt(language),
                    self.user_id,
                    self.encryptor.encrypt_boolean(favourite),
                    tags,
                ),
            )
            snippet_id = self.cursor.fetchone()[0]
            self.connection.commit()

            if self.ai_usage:
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
                decrypted = (
                    id,
                    self.encryptor.decrypt(title),
                    self.encryptor.decrypt(content),
                    self.encryptor.decrypt(language),
                    self.encryptor.decrypt_boolean(favourite),
                    created_at,
                    tags,
                )
                snippets.append(decrypted)
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
