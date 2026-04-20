import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
u = os.getenv('POSTGRES_USER')
p = os.getenv('POSTGRES_PWD')
h = os.getenv('POSTGRES_HOST')
port = os.getenv('POSTGRES_PORT', '5432')
db = os.getenv('POSTGRES_DB')

url = f"postgresql://{u}:{p}@{h}:{port}/{db}"
engine = create_engine(url)

with engine.connect() as conn:
    res = conn.execute(text("SELECT * FROM wyscout_data.players_enriched LIMIT 1"))
    print(list(res.keys()))
