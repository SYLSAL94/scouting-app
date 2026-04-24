import requests
import json

# Test de la route des joueurs avec un filtre simple (GK)
url = "https://api-scouting.theanalyst.cloud/api/players?limit=5&positions=GK"

try:
    print(f"Test de l'URL : {url}")
    response = requests.get(url)
    print(f"Status Code : {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Nombre de joueurs trouvés : {data.get('total', 0)}")
        if data.get('items'):
            print("Premier joueur trouvé :", data['items'][0]['name'])
    else:
        print("Erreur API :", response.text)
except Exception as e:
    print("Erreur de connexion :", str(e))
