import sys
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import pandas as pd

load_dotenv()

pwd = os.getenv('POSTGRES_PWD')
DB_URL = f"postgresql://analyst_admin:{pwd}@127.0.0.1:5432/datafoot_db"
engine = create_engine(DB_URL)

def diag_pedri():
    try:
        with engine.connect() as conn:
            # Pedri ID? Je vais le chercher par son nom
            query = text("SELECT id, name, full_name, position_category, season, competition, note_ponderee FROM wyscout_data.players_enriched WHERE name ILIKE '%Pedri%'")
            df = pd.read_sql(query, conn)
            for _, row in df.iterrows():
                print(f"ID: {row['id']} | Name: {row['name']} | Pos: {row['position_category']} | Season: {row['season']} | Comp: {row['competition']} | Score: {row['note_ponderee']}")
            
            if not df.empty:
                pedri_id = df.iloc[0]['id']
                # Check ALL records for this ID
                query2 = text("SELECT id, position_category, season, competition, note_ponderee FROM wyscout_data.players_enriched WHERE id = :pid")
                df2 = pd.read_sql(query2, conn, params={"pid": int(pedri_id)})
                print("\nAll records for Pedri:")
                for _, row in df2.iterrows():
                    print(f"ID: {row['id']} | Pos: {row['position_category']} | Season: {row['season']} | Comp: {row['competition']} | Score: {row['note_ponderee']}")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    diag_pedri()
