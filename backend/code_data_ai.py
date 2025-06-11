from google import genai
from backend.auth.secret import ai_key

client = genai.Client(
    api_key=ai_key
)  # Get your key from https://ai.google.dev/gemini-api/docs

"""
PLAN:
When the user puts their code into the database it should call these functions
Either:
- Push code into database then call functions. When they return a response then update in database
OR:
- Wait for the ai to respond, then push to database (can take some time)
"""


def get_title(userCode: str):
    default = "Give me a short title for this code. Do not deviate."
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=f"{default}, [{userCode}]",
    )
    return response


def get_language(userCode: str):
    default = "In one word, tell me what programming language the user is using. Do not deviate."
    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=f"{default}, [{userCode}]"
    )
    return response
