from fastapi import FastAPI
from pydantic import BaseModel
from backend.login import LoginSystem
from backend.snippets import Snippets


class LoginData(BaseModel):
    email: str
    password: str

class SnippetData(BaseModel):
    title: str = None
    content: str
    language: str = None


app = FastAPI()

print("Running CodeNest API")

@app.get("/")
async def root():
    return {"message": "Welcome to the CodeNest API"}

@app.post("/login")
async def login(credentials: LoginData):
    l = LoginSystem(credentials.email, credentials.password)
    user_id = l.authenticate()
    if user_id:
        return {"message": "Login successful", "user_id": user_id}
    else:
        return {"error": "Invalid login details"}


@app.post("/create_user")
async def create_user(credentials: LoginData):
    login = LoginSystem(credentials.email, credentials.password)
    try:
        login.create_user()
        return {"message": "User created successfully"} # Need to go to /login after user be create
    except Exception as e:
        return {"error": str(e)}


@app.get("/get_snippets")
async def get_snippets(user_id):
    snippets = Snippets(user_id)
    try:
        user_snippets = snippets.get_snippets()
        return {"snippets": user_snippets}
    except Exception as e:
        return {"error": str(e)}

@app.post("/create_snippet")
async def create_snippet(data: SnippetData, user_id): 
    snippets = Snippets(user_id)
    try:
        snippets.create_snippet(data.title, data.content, data.language)
        return {"message": "Snippet created successfully"}
    except Exception as e:
        return {"error": str(e)}