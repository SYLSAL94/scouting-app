import sys
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import pandas as pd

load_dotenv()

pwd = os.getenv('POSTGRES_PWD')
DB_URL = f"postgresql://analyst_admin:{pwd}@127.0.0.1:5432/datafoot_db"
engine = create_engine(DB_URL)

def check_positions():
    try:
        with engine.connect() as conn:
            query = text("SELECT DISTINCT position_category FROM wyscout_data.players_enriched")
            df = pd.read_sql(query, conn)
            for _, row in df.iterrows():
                print(f"Pos: {repr(row['position_category'])}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_positions()
