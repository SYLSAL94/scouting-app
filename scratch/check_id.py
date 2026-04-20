import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
db_password = os.getenv('POSTGRES_PWD')
db_user = os.getenv('POSTGRES_USER', 'analyst_admin')
db_host = os.getenv('POSTGRES_HOST', '127.0.0.1')
db_port = os.getenv('POSTGRES_PORT', '5432')
db_name = os.getenv('POSTGRES_DB', 'datafoot_db')

DATABASE_URL = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    row = conn.execute(text("SELECT id FROM wyscout_data.players_enriched LIMIT 1")).fetchone()
    print(f"ID: {row[0]} | Type: {type(row[0])}")
