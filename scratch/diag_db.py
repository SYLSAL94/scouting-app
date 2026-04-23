import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

params = {
    "user": os.getenv('POSTGRES_USER', 'analyst_admin'),
    "password": os.getenv('POSTGRES_PWD'),
    "host": os.getenv('POSTGRES_HOST', '127.0.0.1'),
    "port": os.getenv('POSTGRES_PORT', '5432'),
    "database": os.getenv('POSTGRES_DB', 'datafoot_db')
}

print(f"Tentative de connexion vers {params['host']} avec l'utilisateur {params['user']}...")

try:
    conn = psycopg2.connect(**params)
    print("✅ CONNEXION RÉUSSIE !")
    conn.close()
except Exception as e:
    print(f"❌ ÉCHEC DE LA CONNEXION")
    print(f"Type d'erreur: {type(e).__name__}")
    try:
        # On tente de récupérer le message d'erreur même s'il est mal encodé
        raw_msg = str(e).encode('utf-8', errors='replace').decode('utf-8')
        print(f"Message d'erreur (nettoyé): {raw_msg}")
    except:
        print("Impossible d'afficher le message d'erreur (problème d'encodage critique).")
