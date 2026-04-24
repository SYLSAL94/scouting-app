import requests
import json

# 1. On récupère un joueur au hasard via l'API pour avoir un ID valide
base_url = "https://api-scouting.theanalyst.cloud/api"

try:
    print(f"Étape 1 : Récupération d'un joueur via {base_url}/players")
    list_res = requests.get(f"{base_url}/players?limit=1")
    if list_res.status_code != 200:
        print(f"Erreur lors de la récupération de la liste : {list_res.text}")
        exit()
        
    players = list_res.json().get('items', [])
    if not players:
        print("Aucun joueur trouvé dans la base.")
        exit()
        
    target_player = players[0]
    player_id = target_player['id']
    player_name = target_player.get('name', 'Inconnu')
    
    print(f"Joueur trouvé : {player_name} (ID: {player_id})")

    # 2. Appel de l'endpoint Trends
    trends_url = f"{base_url}/players/{player_id}/trends"
    print(f"Étape 2 : Test de l'endpoint Trends -> {trends_url}")
    
    trends_res = requests.get(trends_url)
    print(f"Status : {trends_res.status_code}")
    
    if trends_res.status_code == 200:
        data = trends_res.json()
        print(f"✅ SUCCÈS ! {len(data)} saisons récupérées.")
        if data:
            print("Structure du premier enregistrement :")
            # On affiche les colonnes clés
            keys_to_show = ['season', 'minutes_on_field', 'goals', 'note_ponderee']
            sample = {k: data[0][k] for k in keys_to_show if k in data[0]}
            print(json.dumps(sample, indent=2))
    else:
        print(f"❌ ÉCHEC : {trends_res.text}")

except Exception as e:
    print(f"Erreur lors du test : {str(e)}")
