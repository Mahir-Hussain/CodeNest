from database import Database
from login import LoginSystem
from snippets import Snippets
from fastapi import FastAPI



app = FastAPI()
d = Database()
l = LoginSystem("gm", "arjun")
#l.create_user()



@app.get("/")
async def root():
    return {"Hello World"}

@app.get("/login")
async def login():
    return l.authenticate()
    
#@app.get("")
