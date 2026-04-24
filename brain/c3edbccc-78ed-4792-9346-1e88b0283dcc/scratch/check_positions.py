import pandas as pd
from sqlalchemy import create_engine, text

engine = create_engine('postgresql://analyst_admin:Analyst2024!@api-scouting.theanalyst.cloud/scouting_db')
sql = """
    SELECT id, full_name, primary_position, "note_ponderee", "note_globale"
    FROM wyscout_data.players_enriched 
    WHERE primary_position ILIKE '%GK%' 
       OR primary_position ILIKE '%Gardien%' 
       OR primary_position ILIKE '%Goalkeeper%'
    LIMIT 20
"""
df = pd.read_sql(text(sql), engine)
print("--- SPECIMENS GARDIENS ---")
print(df.to_string())

sql_all_pos = "SELECT DISTINCT primary_position FROM wyscout_data.players_enriched"
df_pos = pd.read_sql(text(sql_all_pos), engine)
print("\n--- TOUTES LES POSITIONS ---")
print(df_pos['primary_position'].tolist())
