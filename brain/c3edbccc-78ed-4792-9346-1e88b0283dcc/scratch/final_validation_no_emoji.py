import requests
import json

base_url = "https://api-scouting.theanalyst.cloud/api"

try:
    # On récupère le joueur Rushworth identifié précédemment
    player_id = -111371
    trends_url = f"{base_url}/players/{player_id}/trends"
    
    response = requests.get(trends_url)
    if response.status_code == 200:
        data = response.json()
        print(f"SUCCESS: {len(data)} seasons found for ID {player_id}")
        if data:
            # On affiche les 2 premières saisons pour voir l'évolution
            print(json.dumps(data[:2], indent=2))
    else:
        print(f"ERROR {response.status_code}: {response.text}")

except Exception as e:
    print(f"Error: {str(e)}")
