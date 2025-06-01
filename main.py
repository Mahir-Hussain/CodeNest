import os
from database import Database
from login import LoginSystem


if __name__ == "__main__":
    os.system("cls")
    db = Database()
    db.create_user()
    db.close()
