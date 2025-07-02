from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.snippets import Snippets
from backend.auth.login import LoginSystem
from backend.auth.jwtAuth import jwtAuth
from backend.ratelimit import RateLimit
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
# app.add_middleware(RateLimit)

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
        dict: Dark mode preference if found, otherwise raises HTTPException.
    """
    result = login_system.get_dark_mode(user_id)
    if result.get("success"):
        return {"dark_mode": result["dark_mode"]}
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
    result = snippets.create_snippet(
        data.title, data.content, data.language, data.favourite, data.tags
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
