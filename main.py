from database import Database
from login import LoginSystem
import hashlib


if __name__ == "__main__":
    # db = Database()

    p = LoginSystem("emailtoday", "password123")
    # p.create_user()
    p.test_login()
    # db.close()
