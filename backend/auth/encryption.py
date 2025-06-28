from cryptography.fernet import Fernet
from backend.auth.secret import fernet_key

"""
First install -> pip install cryptography

In secret.py create a variable called fernet_key and set it to the key I sent.
"""

class Encryption:
    def __init__(self):
        self.fernet = Fernet(fernet_key)

    def encrypt(self, data):
        if data is not None:
            return self.fernet.encrypt(data.encode()).decode()
        return None

    def decrypt(self, token):
        if token is not None:
            return self.fernet.decrypt(token.encode()).decode()
        return None

