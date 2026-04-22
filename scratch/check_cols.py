import pandas as pd
from sqlalchemy import create_engine, text

engine = create_engine("postgresql://postgres:postgres@localhost:5432/scouting_db")

with engine.connect() as conn:
    res = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_schema = 'wyscout_data' AND table_name = 'players_enriched'"))
    cols = [r[0] for r in res]
    print("\n".join(sorted(cols)))
