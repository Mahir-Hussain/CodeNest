from database import Database
from login import LoginSystem
import hashlib


if __name__ == "__main__":
    db = Database()

    def test_login(email, password):
        db.cursor.execute("SELECT email, password FROM users WHERE email = %s AND password = %s", (email, hashlib.sha256(password.encode()).hexdigest()))
        if db.cursor.fetchone():
            print("Login successful")
        else:
            print("Incorrect details")
    
    p = LoginSystem("outlook", "asdwadw")
    #p.create_user()
    test_login("outlook", "asdwadw")
    db.close()



    