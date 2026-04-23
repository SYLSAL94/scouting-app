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
    # Check positions for Goalkeepers
    res = conn.execute(text("SELECT DISTINCT primary_position FROM wyscout_data.players_enriched WHERE position_category = 'Gardien'"))
    print("Positions found for 'Gardien' category:")
    for row in res:
        print(f"- {row[0]}")

    # Check some positions for Field players too to see the format
    res = conn.execute(text("SELECT DISTINCT primary_position, position_category FROM wyscout_data.players_enriched LIMIT 20"))
    print("\nSample of primary_position vs position_category:")
    for row in res:
        print(f"- {row[0]} ({row[1]})")
