import os
import pandas as pd
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
    print("--- AFFINITY COLUMNS ---")
    res = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_schema = 'wyscout_data' AND table_name = 'players_enriched' AND column_name LIKE 'profile_affinity_%%'"))
    for r in res:
        print(f"'{r[0]}'")
