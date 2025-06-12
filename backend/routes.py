from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from backend.snippets import Snippets
from backend.auth.login import LoginSystem


class LoginData(BaseModel):
    email: str
    password: str


class SnippetData(BaseModel):
    title: str = None
    content: str
    language: str = None


app = FastAPI()
login_system = LoginSystem()
print("Running CodeNest API")


@app.get("/")
async def root():
    """
    Root endpoint for the API.
    """
    return {"message": "Welcome to the CodeNest API"}


@app.post("/login")
async def login(credentials: LoginData):
    """
    Authenticate a user and return a JWT token if successful.

    Requires:
        credentials (LoginData): The user's email and password.

    Returns:
        dict: Authentication result, JWT token, and user ID if successful.
    """
    result = login_system.authenticate(credentials.email, credentials.password)
    if result.get("success"):
        return result
    else:
        raise HTTPException(
            status_code=401, detail=result.get("error", "Invalid login details")
        )


@app.post("/create_user")
async def create_user(credentials: LoginData):
    """
    Create a new user account.

    Requires:
        credentials (LoginData): The user's email and password.

    Returns:
        dict: Success message if user is created, otherwise raises HTTPException.
    """
    result = login_system.create_user(credentials.email, credentials.password)
    if result.get("success"):
        return {"message": "User created successfully"}
    else:
        raise HTTPException(
            status_code=400, detail=result.get("error", "Failed to create user")
        )


@app.delete("/delete_user")
async def delete_user(email: str):
    """
    Delete a user account by email.

    Requires:
        email (str): The email address of the user to delete.

    Returns:
        dict: Success message if user is deleted, otherwise raises HTTPException.
    """
    result = login_system.delete_user(email)
    if result.get("success"):
        return {"message": "User deleted successfully"}
    else:
        raise HTTPException(
            status_code=400, detail=result.get("error", "Failed to delete user")
        )


@app.get("/get_snippets/{user_id}")
async def get_snippets(user_id: int):
    """
    Retrieve all code snippets for a specific user.

    Requires:
        user_id (int): The ID of the user whose snippets are to be retrieved.

    Returns:
        dict: List of snippets for the user, or raises HTTPException on error.
    """
    snippets = Snippets(user_id)
    try:
        user_snippets = snippets.get_snippets()
        return {"snippets": user_snippets}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/create_snippet/{user_id}")
async def create_snippet(user_id: int, data: SnippetData):
    """
    Create a new code snippet for a specific user.

    Requires:
        user_id (int): The ID of the user creating the snippet.
        data (SnippetData): The snippet's title, content, and language.

    Returns:
        dict: Success message if snippet is created, otherwise raises HTTPException.
    """
    snippets = Snippets(user_id)
    result = snippets.create_snippet(data.title, data.content, data.language)
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=400, detail=result["error"])


@app.delete("/delete_snippet/{user_id}/{snippet_id}")
async def delete_snippet(user_id: int, snippet_id: int):
    """
    Delete a code snippet by its ID for a specific user.

    Requires:
        user_id (int): The ID of the user.
        snippet_id (int): The ID of the snippet to delete.

    Returns:
        dict: Success message if snippet is deleted, otherwise raises HTTPException.
    """
    snippets = Snippets(user_id)
    result = snippets.delete_snippet(snippet_id)
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=400, detail=result["error"])
