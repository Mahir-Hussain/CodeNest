from google import genai
import asyncio
import time
import os


class CodeDataAI:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("ai_key"))
        self.model = "gemini-2.0-flash"

    async def get_all_data(self, user_code: str):
        title_task = asyncio.create_task(self.get_title(user_code))
        tags_task = asyncio.create_task(self.get_tags(user_code))
        lang_task = asyncio.create_task(self.get_language(user_code))

        title = await title_task
        tags = await tags_task
        language = await lang_task

        # Check for errors in any of the results
        for value in [title, tags, language]:
            if isinstance(value, dict) and value.get("success") is False:
                return {
                    "success": False,
                    "error": value.get("error", "Unknown error"),
                    "response": {
                        "title": title if isinstance(title, str) else "",
                        "tags": tags if isinstance(tags, str) else "",
                        "language": language if isinstance(language, str) else "",
                    },
                }

        return {"title": title, "tags": tags, "language": language}

    async def get_title(self, user_code: str):
        prompt = "Give me a short title for this code. Do not deviate."
        return await asyncio.to_thread(self.run_prompt, prompt, user_code)

    async def get_language(self, user_code: str):
        prompt = "In one word, tell me what programming language the user is using. Do not deviate. The available languages are: python, javascript, html, css, java."
        return await asyncio.to_thread(self.run_prompt, prompt, user_code)

    async def get_tags(self, user_code: str):
        prompt = """Generate up to 3 tags for this code. Do not deviate. Must be one word each.
                    In the style of a comma-separated list. E.g ["tag1", "tag2", "tag3"].
                    You do not need 3 tags, you can return 1 or 2 if you want."""
        return await asyncio.to_thread(self.run_prompt, prompt, user_code)

    def run_prompt(self, prompt: str, user_code: str, retries=3):
        for attempt in range(1, retries + 1):
            try:
                response = self.client.models.generate_content(
                    model=self.model, contents=f"{prompt}, [{user_code}]"
                )
                output = response.text.strip()

                if not output:
                    raise Exception("Gemini returned an empty response.")

                return output

            except Exception as e:
                print(f"[Gemini Error] Attempt {attempt}/{retries} failed: {e}")

                if attempt == retries:
                    return {"success": False, "error": str(e), "response": ""}
                time.sleep(2 ** (attempt - 1))
