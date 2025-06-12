from google import genai
from auth.secret import ai_key
import asyncio

"""
PLAN:
When the user puts their code into the database it should call these functions
Either:
- Push code into database then call functions. When they return a response then update in database
OR:
- Wait for the ai to respond, then push to database (can take some time)
"""


class CodeDataAI:
    def __init__(self):
        """
        Initializes the CodeDataAI class with a Gemini AI client.
        """
        self.client = genai.Client(api_key=ai_key)
        self.model = "gemini-2.0-flash"

    async def get_all_data(self, user_code: str):
        """
        Generate a comprehensive analysis of the provided code using Gemini AI.

        Requires:
            user_code (str): The code snippet to be analyzed.

        Returns:
            response: The AI-generated response containing a detailed analysis of the code.
        """
        title_task = asyncio.create_task(self.get_title(user_code))
        tags_task = asyncio.create_task(self.get_tags(user_code))
        lang_task = asyncio.create_task(self.get_language(user_code))

        title = await title_task
        tags = await tags_task
        language = await lang_task
        return {"title": title, "tags": tags, "language": language}

    async def get_title(self, user_code: str):
        """
        Generate a short title for the provided code using Gemini AI.

        Requires:
            user_code (str): The code snippet for which a title is to be generated.

        Returns:
            response: The AI-generated response containing a short title for the code.
        """
        prompt = "Give me a short title for this code. Do not deviate."

        return await asyncio.to_thread(self.run_prompt, prompt, user_code)

    async def get_language(self, user_code: str):
        """
        Identify the programming language of the provided code using Gemini AI.

        Requires:
            user_code (str): The code snippet whose programming language is to be identified.

        Returns:
            response: The AI-generated response containing the programming language in one word.
        """
        prompt = "In one word, tell me what programming language the user is using. Do not deviate."

        return await asyncio.to_thread(self.run_prompt, prompt, user_code)

    async def get_tags(self, user_code: str):
        """
        Generate tags for the provided code using Gemini AI.

        Requires:
            user_code (str): The code snippet for which tags are to be generated.

        Returns:
            response: The AI-generated response containing tags for the code.
        """
        prompt = """Generate up to 3 tags for this code. Do not deviate. 
                    In the style of a comma-separated list. E.g #tag1, #tag2, #tag3.
                    You do not need 3 tags, you can return 1 or 2 if you want."""

        return await asyncio.to_thread(self.run_prompt, prompt, user_code)

    def run_prompt(self, prompt: str, user_code: str):
        try:
            response = self.client.models.generate_content(
                model=self.model, contents=f"{prompt}, [{user_code}]"
            )
            return response.text.strip()
        except Exception as e:
            return {
                "error": f"An error occurred while processing the request: {str(e)}"
            }


async def main():
    ai = CodeDataAI()
    code = "def hello_world():\n    print('Hello, world!')"
    data = await ai.get_all_data(code)
    print(data["title"], data["tags"], data["language"])


asyncio.run(main())
