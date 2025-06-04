from fastapi import FastAPI
from pydantic import BaseModel
from login import LoginSystem
from snippets import Snippets


class LoginData(BaseModel):
    email: str
    password: str


app = FastAPI()


# Route for login
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
async def get_snippets(user_id=12):
    snippets = Snippets(user_id)
    try:
        user_snippets = snippets.get_snippets()
        return {"snippets": user_snippets}
    except Exception as e:
        return {"error": str(e)}

@app.post("/create_snippet")
async def create_snippet(user_id: int, title: str, content: str, language: str = "python"):
    snippets = Snippets(user_id)
    try:
        snippets.create_snippet(title, content, language)
        return {"message": "Snippet created successfully"}
    except Exception as e:
        return {"error": str(e)}