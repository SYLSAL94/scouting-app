import sys
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import pandas as pd

load_dotenv()

pwd = os.getenv('POSTGRES_PWD')
DB_URL = f"postgresql://analyst_admin:{pwd}@127.0.0.1:5432/datafoot_db"
engine = create_engine(DB_URL)

def check_columns():
    try:
        with engine.connect() as conn:
            df = pd.read_sql(text("SELECT * FROM wyscout_data.players_enriched LIMIT 0"), conn)
            print(f"Columns: {df.columns.tolist()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_columns()
