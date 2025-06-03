from database import Database
from login import LoginSystem
from snippets import Snippets


if __name__ == "__main__":
    # db = Database()

    # p = LoginSystem("emailtoday", "password123")
    # p.create_user()
    # p.authenticate()
    # db.close()

    Snippets().create_snippet()
