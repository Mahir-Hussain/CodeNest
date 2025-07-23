from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from snippets import Snippets
from auth.login import LoginSystem
from auth.jwtAuth import jwtAuth
from auth.ratelimit import rate_limit, cleanup_rate_limiter, rate_limiter, ip_rate_limit
import asyncio
from contextlib import asynccontextmanager
from dotenv import load_dotenv


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
    favourite: bool


class ChangePasswordData(BaseModel):
    current_password: str
    new_password: str


class ChangeEmailData(BaseModel):
    new_email: str


class ChangeDarkModeData(BaseModel):
    dark_mode: bool


class ChangeAIUseData(BaseModel):
    ai_use: bool


@asynccontextmanager
async def lifespan(app: FastAPI):
    Snippets.event_loop = asyncio.get_running_loop()
    # Start the rate limiter cleanup task
    cleanup_task = asyncio.create_task(cleanup_rate_limiter())
    yield
    Snippets.executor.shutdown(wait=False)
    # Cancel the cleanup task
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass


load_dotenv()
app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://codenest-rho.vercel.app"],  # React dev server
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
@ip_rate_limit(requests_per_minute=10)  # Strict limit to prevent brute force attacks
async def login(request: Request, credentials: LoginData):
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
@ip_rate_limit(requests_per_minute=5)  # Very strict limit for account creation
async def create_user(request: Request, credentials: LoginData):
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


@app.get("/get_public_snippet/{snippet_id}")
@ip_rate_limit(requests_per_minute=30)  # Moderate limit for public snippet access
async def read_public_snippet(request: Request, snippet_id: int):
    snippets = Snippets(user_id=0)
    try:
        result = snippets.get_public_snippet_by_id(snippet_id)
        if not result["success"]:
            raise HTTPException(
                status_code=404, detail=result.get("error", "Snippet not found")
            )
        return {"snippet": result["snippet"]}
    finally:
        snippets.close()  # Ensure connection is closed

@app.get("/get_user_snippet/{snippet_id}")
@rate_limit(requests_per_minute=50) # Higher limit for user-specific snippet access
async def read_user_snippet(snippet_id: int, user_id: int = Depends(get_current_user_id)):
    snippets = Snippets(user_id)
    try:
        result = snippets.get_user_snippet_by_id(snippet_id)
        if not result["success"]:
            raise HTTPException(
                status_code=404, detail=result.get("error", "Snippet not found")
            )
        return {"snippet": result["snippet"]}
    finally:
        snippets.close()  # Ensure connection is closed 

# Protected endpoints - require token
@app.get("/dark_mode")
@rate_limit(requests_per_minute=20)  # Allow 20 requests per minute for settings
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
@rate_limit(requests_per_minute=30)  # Allow 30 requests per minute for settings
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
@rate_limit(requests_per_minute=5)  # Strict limit for account deletion
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


@app.put("/change_password")
@rate_limit(requests_per_minute=10)  # Moderate limit for password changes
async def change_password(
    data: ChangePasswordData, user_id: int = Depends(get_current_user_id)
):
    """
    Change the password for the authenticated user.

    Requires:
        data (ChangePasswordData): Current password and new password.
        user_id (int): Obtained from the JWT token.

    Returns:
        dict: Success message if password is changed, otherwise raises HTTPException.
    """
    result = login_system.change_password(
        user_id, data.current_password, data.new_password
    )
    if result.get("success"):
        return {"message": "Password changed successfully"}
    else:
        raise HTTPException(
            status_code=400, detail=result.get("error", "Failed to change password")
        )


@app.put("/change_email")
@rate_limit(requests_per_minute=10)  # Moderate limit for email changes
async def change_email(
    data: ChangeEmailData, user_id: int = Depends(get_current_user_id)
):
    """
    Change the email for the authenticated user.

    Requires:
        data (ChangeEmailData): New email address.
        user_id (int): Obtained from the JWT token.

    Returns:
        dict: Success message if email is changed, otherwise raises HTTPException.
    """
    result = login_system.update_user(user_id, email=data.new_email)
    if result.get("success"):
        return {"message": "Email changed successfully"}
    else:
        raise HTTPException(
            status_code=400, detail=result.get("error", "Failed to change email")
        )


@app.put("/change_dark_mode")
@rate_limit(requests_per_minute=30)  # Higher limit for UI preference changes
async def change_dark_mode(
    data: ChangeDarkModeData, user_id: int = Depends(get_current_user_id)
):
    """
    Change the dark mode preference for the authenticated user.

    Requires:
        data (ChangeDarkModeData): Dark mode preference (true/false).
        user_id (int): Obtained from the JWT token.

    Returns:
        dict: Success message if dark mode preference is changed, otherwise raises HTTPException.
    """
    result = login_system.update_user(user_id, dark_mode=data.dark_mode)
    if result.get("success"):
        return {"message": "Dark mode preference changed successfully"}
    else:
        raise HTTPException(
            status_code=400,
            detail=result.get("error", "Failed to change dark mode preference"),
        )


@app.put("/change_ai_use")
@rate_limit(requests_per_minute=30)  # Higher limit for settings changes
async def change_ai_use(
    data: ChangeAIUseData, user_id: int = Depends(get_current_user_id)
):
    """
    Change the AI usage preference for the authenticated user.

    Requires:
        data (ChangeAIUseData): AI usage preference (true/false).
        user_id (int): Obtained from the JWT token.

    Returns:
        dict: Success message if AI usage preference is changed, otherwise raises HTTPException.
    """
    result = login_system.update_user(user_id, use_ai=data.ai_use)
    if result.get("success"):
        return {"message": "AI usage preference changed successfully"}
    else:
        raise HTTPException(
            status_code=400,
            detail=result.get("error", "Failed to change AI usage preference"),
        )


@app.get("/get_snippets")
@rate_limit(requests_per_minute=80)  # Higher limit for frequently accessed endpoint
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
        result = snippets.get_snippets()
        return result
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
    finally:
        snippets.close()  # Ensure connection is closed


@app.post("/create_snippet")
@rate_limit(requests_per_minute=20)  # Moderate limit for create operations
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
    try:
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
    finally:
        snippets.close()  # Ensure connection is closed


@app.put("/edit_snippet/{snippet_id}")
@rate_limit(requests_per_minute=30)  # Moderate limit for edit operations
async def edit_snippet(
    snippet_id: int, data: EditSnippetData, user_id: int = Depends(get_current_user_id)
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
    try:
        result = snippets.edit_snippet(
            snippet_id,
            data.title,
            data.content,
            data.language,
            data.tags,
            data.is_public,
            data.favourite,
        )
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    finally:
        snippets.close()  # Ensure connection is closed


@app.put("/toggle_favorite/{snippet_id}")
@rate_limit(requests_per_minute=40)  # Higher limit for quick favorite toggles
async def toggle_favorite(snippet_id: int, user_id: int = Depends(get_current_user_id)):
    """
    Toggle the favorite status of a code snippet for the authenticated user.
    This endpoint only updates the favorite field without affecting other snippet data.

    Requires:
        snippet_id (int): The ID of the snippet to toggle favorite status.
        user_id (int): Obtained from the JWT token.

    Returns:
        dict: Success message and new favorite status, otherwise raises HTTPException.
    """
    snippets = Snippets(user_id)
    try:
        result = snippets.toggle_favorite(snippet_id)
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    finally:
        snippets.close()  # Ensure connection is closed


@app.delete("/delete_snippet/{snippet_id}")
@rate_limit(requests_per_minute=15)  # Moderate limit for delete operations
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
    try:
        result = snippets.delete_snippet(snippet_id)
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    finally:
        snippets.close()  # Ensure connection is closed
