import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

db_password = os.getenv('POSTGRES_PWD')
db_user = os.getenv('POSTGRES_USER', 'analyst_admin')
db_host = os.getenv('POSTGRES_HOST', '127.0.0.1')
db_port = os.getenv('POSTGRES_PORT', '5432')
db_name = os.getenv('POSTGRES_DB', 'datafoot_db')

DATABASE_URL = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
engine = create_engine(DATABASE_URL)

def enable_unaccent():
    try:
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS unaccent"))
            # conn.commit() # Not needed in connection.execute if not in transaction, but depends on driver
            # Let's use a transaction to be sure
            print("Successfully enabled unaccent extension (if you had permissions)")
    except Exception as e:
        print(f"Failed to enable unaccent: {e}")

if __name__ == "__main__":
    enable_unaccent()
