from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
pwd = os.getenv('POSTGRES_PWD')
engine = create_engine(f'postgresql://analyst_admin:{pwd}@127.0.0.1:5432/datafoot_db')

with engine.connect() as conn:
    res = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'players_enriched'"))
    cols = [r[0] for r in res]
    print("COLONNES DISPONIBLES :")
    print(cols)
