from backend.database import Database
from backend.login import LoginSystem
from backend.snippets import Snippets
from fastapi import FastAPI


app = FastAPI()
d = Database()
l = LoginSystem("GeorgeJoseph@gmail.com", "arjun")



@app.get("/")
async def root():
    return {"Hello World"}


@app.get("/login")
async def login():
    return l.authenticate()


# @app.get("")
