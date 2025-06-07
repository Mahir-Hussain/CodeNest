from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from backend.snippets import Snippets
from backend.login import LoginSystem


class LoginData(BaseModel):
    email: str
    password: str


class SnippetData(BaseModel):
    title: str = None
    content: str
    language: str = None


app = FastAPI()
loginSystem = LoginSystem()
print("Running CodeNest API")


@app.get("/")
async def root():
    return {"message": "Welcome to the CodeNest API"}


@app.post("/login")
async def login(credentials: LoginData):
    user_id = loginSystem.authenticate(credentials.email, credentials.password)
    if user_id:
        return {"message": "Login successful", "user_id": user_id}
    else:
        raise HTTPException(status_code=401, detail="Invalid login details")


@app.post("/create_user")
async def create_user(credentials: LoginData):
    result = loginSystem.create_user(credentials.email, credentials.password)
    if result.get("success"):
        return {"message": "User created successfully"}
    else:
        raise HTTPException(
            status_code=400, detail=result.get("error", "Failed to create user")
        )

@app.delete("/delete_user")
async def delete_user(email: str):
    result = loginSystem.delete_user(email)
    if result.get("success"):
        return {"message": "User deleted successfully"}
    else:
        raise HTTPException(
            status_code=400, detail=result.get("error", "Failed to delete user")
        )

@app.get("/get_snippets/{user_id}")
async def get_snippets(user_id: int):
    snippets = Snippets(user_id)
    try:
        user_snippets = snippets.get_snippets()
        return {"snippets": user_snippets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/create_snippet/{user_id}")
async def create_snippet(user_id: int, data: SnippetData):
    snippets = Snippets(user_id)
    result = snippets.create_snippet(data.title, data.content, data.language)
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=400, detail=result["error"])


@app.delete("/delete_snippet/{user_id}/{snippet_id}")
async def delete_snippet(user_id: int, snippet_id: int):
    snippets = Snippets(user_id)
    result = snippets.delete_snippet(snippet_id)
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=400, detail=result["error"])
    

