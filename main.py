# from database import Database
# from login import LoginSystem
# from snippets import Snippets
from fastapi import FastAPI


if __name__ == "__main__":
    app = FastAPI()

    app.get("/")

    async def root():
        return {"message": "Hello World"}
