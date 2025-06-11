import psycopg2
from backend.auth.secret import database_password


class Database:
    def __init__(self, host="aws-0-eu-west-2.pooler.supabase.com", port="5432"):
        # Database connection parameters
        self.DB_name = "postgres"
        self.DB_user = "postgres.rgxatektsqhjpjgmfncu"
        self.DB_password = database_password
        self.DB_host = host
        self.DB_port = port
        self.connect()

    def connect(self):
        try:
            self.connection = psycopg2.connect(
                dbname=self.DB_name,
                user=self.DB_user,
                password=self.DB_password,
                host=self.DB_host,
                port=self.DB_port,
            )
            self.cursor = self.connection.cursor()
            print("Database connection established.")
        except Exception as e:
            print(f"Error connecting to database: {e}")

    def close(self):
        if self.connection:
            self.connection.close()
            print("Database connection closed.")
