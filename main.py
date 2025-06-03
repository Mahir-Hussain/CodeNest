from database import Database
from login import LoginSystem
from snippets import Snippets


if __name__ == "__main__":
    # db = Database()

    # p = LoginSystem("emailtoday", "password123")
    # p.create_user()
    # p.authenticate()
    # db.close()

    a = Snippets()
    a.create_snippet()
    # a.delete_snippet(1)
    for title, content, language, favourite in a.get_snippets():
        print(
            f"Title: {title}, Content: {content}, Language: {language}, Favourite: {favourite}"
        )
