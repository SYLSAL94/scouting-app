import pandas as pd
from sqlalchemy import create_engine, text

engine = create_engine("postgresql://postgres:postgres@localhost:5432/scouting_db")

with engine.connect() as conn:
    print("--- UNIQUE POSITION CATEGORIES ---")
    res = conn.execute(text("SELECT DISTINCT position_category FROM wyscout_data.players_enriched WHERE position_category IS NOT NULL ORDER BY position_category"))
    for r in res:
        print(f"'{r[0]}'")
