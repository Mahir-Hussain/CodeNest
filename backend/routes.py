from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from snippets import Snippets
from auth.login import LoginSystem
from auth.jwtAuth import jwtAuth
import asyncio
from contextlib import asynccontextmanager


# Models for request bodies
class LoginData(BaseModel):
    email: str
    password: str


class SnippetData(BaseModel):
    title: str = None
    content: str
    language: str = None
    favourite: bool = False
    tags: list[str] = []
    is_public: bool = False


class EditSnippetData(BaseModel):
    title: str = None
    content: str
    language: str
    tags: list[str] = []
    is_public: bool = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    Snippets.event_loop = asyncio.get_running_loop()
    yield
    Snippets.executor.shutdown(wait=False)


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize FastAPI app and login system
login_system = LoginSystem()
jwt_auth = jwtAuth()
auth_scheme = HTTPBearer()  # For extracting token from Authorization header

print("Running CodeNest API")


# Dependency to get user_id from JWT token
async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(auth_scheme),
):
    token = credentials.credentials
    result = jwt_auth.verify_token(token)
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result["error"])
    return result["user_id"]


# Public endpoints
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


# Protected endpoints - require token
@app.get("/dark_mode")
async def get_dark_mode(user_id: int = Depends(get_current_user_id)):
    """
    Retrieve the dark mode preference for the authenticated user.

    Requires:
        user_id (int): Obtained from the JWT token.

    Returns:
        bool: Dark mode preference if found.
    """
    result = login_system.get_dark_mode(user_id)
    if result.get("success"):
        return {"dark_mode": result["dark_mode"]}
    else:
        raise HTTPException(
            status_code=404, detail=result.get("error", "User not found")
        )


@app.get("/get_ai_use")
async def get_ai_use(user_id: int = Depends(get_current_user_id)):
    """
    Retrieve if the user has AI usage enabled.

    Requires:
        user_id (int): Obtained from the JWT token.

    Returns:
        bool: AI usage status if true or false.
    """
    result = login_system.get_ai_use(user_id)
    if result.get("success"):
        return {"ai_use": result["ai_use"]}
    else:
        raise HTTPException(
            status_code=404, detail=result.get("error", "User not found")
        )


@app.delete("/delete_user")
async def delete_user(user_id: int = Depends(get_current_user_id)):
    """
    Delete a user account by email.

    Requires:
        email (str): The email address of the user to delete.
        user_id (int): Authenticated user ID.

    Returns:
        dict: Success message if user is deleted, otherwise raises HTTPException.
    """
    result = login_system.delete_user(user_id)
    if result.get("success"):
        return {"message": "User deleted successfully"}
    else:
        raise HTTPException(
            status_code=400, detail=result.get("error", "Failed to delete user")
        )


@app.get("/get_snippets")
async def get_snippets(user_id: int = Depends(get_current_user_id)):
    """
    Retrieve all code snippets for the authenticated user.

    Requires:
        user_id (int): Obtained from the JWT token.

    Returns:
        dict: List of snippets for the user, or raises HTTPException on error.
    """
    snippets = Snippets(user_id)
    try:
        return snippets.get_snippets()
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.get("/get_public_snippet/{snippet_id}")
async def read_public_snippet(snippet_id: int):
    result = Snippets(user_id=0).get_public_snippet_by_id(snippet_id)
    if not result["success"]:
        raise HTTPException(
            status_code=404, detail=result.get("error", "Snippet not found")
        )
    return {"snippet": result["snippet"]}


@app.post("/create_snippet")
async def create_snippet(
    data: SnippetData, user_id: int = Depends(get_current_user_id)
):
    """
    Create a new code snippet for the authenticated user.

    Requires:
        data (SnippetData): The snippet's title, content, language, favourite flag, and tags.
        user_id (int): Obtained from the JWT token.

    Returns:
        dict: Success message if snippet is created, otherwise raises HTTPException.
    """
    snippets = Snippets(user_id)
    ai_usage = (await get_ai_use(user_id))["ai_use"]

    print("AI usage status:", ai_usage)
    result = snippets.create_snippet(
        data.title,
        data.content,
        data.language,
        data.favourite,
        data.tags,
        ai_usage,
        data.is_public,
    )
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=400, detail=result["error"])


@app.put("/edit_snippet/{snippet_id}")
async def edit_snippet(
    snippet_id: int,
    data: EditSnippetData,
    user_id: int = Depends(get_current_user_id)
):
    """
    Edit an existing code snippet for the authenticated user.

    Requires:
        snippet_id (int): The ID of the snippet to edit.
        data (EditSnippetData): The updated snippet data (title, content, language, tags, is_public).
        user_id (int): Obtained from the JWT token.

    Returns:
        dict: Success message if snippet is updated, otherwise raises HTTPException.
    """
    snippets = Snippets(user_id)
    result = snippets.edit_snippet(
        snippet_id,
        data.title,
        data.content,
        data.language,
        data.tags,
        data.is_public,
    )
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=400, detail=result["error"])


@app.delete("/delete_snippet/{snippet_id}")
async def delete_snippet(snippet_id: int, user_id: int = Depends(get_current_user_id)):
    """
    Delete a code snippet by its ID for the authenticated user.

    Requires:
        snippet_id (int): The ID of the snippet to delete.
        user_id (int): Obtained from the JWT token.

    Returns:
        dict: Success message if snippet is deleted, otherwise raises HTTPException.
    """
    snippets = Snippets(user_id)
    result = snippets.delete_snippet(snippet_id)
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=400, detail=result["error"])
