from backend.database import Database
from backend.login import LoginSystem
from backend.snippets import Snippets
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

d = Database()
l = LoginSystem("GeorgeJoseph@gmail.com", "arjun")

@app.get("/")
async def root():
    return {"Hello World"}


@app.get("/login")
async def login():
    return l.authenticate()


# @app.get("")
