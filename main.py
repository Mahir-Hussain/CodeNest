import os
from database import Database


if __name__ == "__main__":
    os.system("cls")
    db = Database()
    # db.connect()
    # result = db.execute_query("SELECT * FROM users;")
    # print(result)
    db.close()