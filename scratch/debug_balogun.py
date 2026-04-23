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
    print("--- DIAGNOSTIC BALOGUN (ID 540608) ---")
    # Balogun est l'ID 540608 dans vos captures
    res = conn.execute(text("SELECT name, season, competition, profile_affinity_finisseur FROM wyscout_data.players_enriched WHERE id = 540608"))
    for r in res:
        print(f"Joueur: {r[0]}")
        print(f"Saison: {r[1]}")
        print(f"Comp: {r[2]}")
        print(f"Affinité Finisseur: '{r[3]}' (Type: {type(r[3])})")
