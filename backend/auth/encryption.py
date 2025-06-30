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

    # def encrypt_boolean(self, boolean_value):
    #     if boolean_value is not None:
    #         boolean_bytes = str(boolean_value).encode("utf-8")

    #         # Encrypt the byte string
    #         cipher_text = self.fernet.encrypt(boolean_bytes)
    #         return cipher_text
    #     return None

    # def decrypt_boolean(self, encrypted_value):
    #     if encrypted_value is not None:
    #         plain_text_bytes = self.fernet.decrypt(encrypted_value)

    #         decrypted_boolean = plain_text_bytes.decode("utf-8") == "True"
    #         return decrypted_boolean
    #     return None
