import requests
import json

# Test avec un filtre de matchs minimum
url = "https://api-scouting.theanalyst.cloud/api/players?limit=5&min_matches=5"

try:
    print(f"Test de l'URL : {url}")
    response = requests.get(url)
    print(f"Status Code : {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Total trouvé : {data.get('total', 0)}")
        if data.get('items'):
            print("Premier joueur trouvé :", data['items'][0]['name'])
    else:
        print("ERREUR API DÉTECTÉE :")
        print(response.text)
except Exception as e:
    print("Erreur de connexion :", str(e))
