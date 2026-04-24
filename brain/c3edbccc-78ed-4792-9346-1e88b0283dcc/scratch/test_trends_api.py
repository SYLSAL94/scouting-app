import os
import requests
import json
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

# Connexion DB pour trouver un ID
pwd = os.getenv('POSTGRES_PWD')
DB_URL = f"postgresql://analyst_admin:{pwd}@127.0.0.1:5432/datafoot_db"
engine = create_engine(DB_URL)

try:
    with engine.connect() as conn:
        query = text('SELECT id, name, COUNT(*) as seasons_count FROM wyscout_data.players_enriched GROUP BY id, name HAVING COUNT(*) > 1 LIMIT 1')
        res = conn.execute(query).fetchone()
        
        if not res:
            print("Aucun joueur avec historique trouvé.")
            exit()
            
        player_id, player_name, seasons = res
        print(f"Test sur : {player_name} (ID: {player_id}) - {seasons} saisons")

        # Appel API Trends
        url = f"https://api-scouting.theanalyst.cloud/api/players/{player_id}/trends"
        print(f"Appel : {url}")
        
        response = requests.get(url)
        print(f"Status : {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Nombre de saisons agrégées : {len(data)}")
            if len(data) > 0:
                print("Données de la première saison :")
                # On affiche seulement les clés importantes pour vérifier
                sample = {k: v for k, v in data[0].items() if k in ['season', 'minutes_on_field', 'goals', 'Indice_note_ponderee']}
                print(json.dumps(sample, indent=2))
        else:
            print(f"Erreur API : {response.text}")

except Exception as e:
    print(f"Erreur technique : {str(e)}")
