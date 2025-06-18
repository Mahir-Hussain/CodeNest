import psycopg2

from backend.auth.secret import database_password


class Database:
    def __init__(self, host="aws-0-eu-west-2.pooler.supabase.com", port="5432"):
        """
        Sets up database connection parameters and calls the connect() method.
        """
        self.db_name = "postgres"
        self.db_user = "postgres.rgxatektsqhjpjgmfncu"
        self.db_password = database_password
        self.db_host = host
        self.db_port = port
        self.connect()

    def connect(self):
        """
        Establish a connection to the PostgreSQL database using the provided parameters.
        """
        try:
            self.connection = psycopg2.connect(
                dbname=self.db_name,
                user=self.db_user,
                password=self.db_password,
                host=self.db_host,
                port=self.db_port,
            )
            self.cursor = self.connection.cursor()
            print("Database connection established.")
        except Exception as error:
            print(f"Error connecting to database: {error}")

    def close(self):
        """
        Close the database connection if it is open.
        """
        if self.connection:
            self.connection.close()
            print("Database connection closed.")
