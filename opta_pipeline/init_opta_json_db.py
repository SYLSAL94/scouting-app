import os
import json
import re
import glob
from sqlalchemy import create_engine, text
from sqlalchemy.dialects.postgresql import JSONB, insert as pg_insert
from dotenv import load_dotenv

def extract_pure_json(file_path):
    """
    Lit un fichier Opta JSONP (.txt) et extrait le JSON pur.
    Supprime la fonction enveloppante (ex: Wed6b8...(...)).
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            
        # Regex pour capturer tout ce qui est entre la première parenthèse ouvrante et la dernière fermante
        match = re.search(r'^[^(]*\((.*)\);?$', content, re.DOTALL)
        if match:
            json_str = match.group(1)
            return json.loads(json_str)
        else:
            # Si pas de wrapper, on tente le load direct
            return json.loads(content)
    except Exception as e:
        print(f"❌ Erreur lors de l'extraction JSON de {file_path} : {e}")
        return None

def create_tables(engine):
    """
    Initialise le schéma de données SQL hybride (Relationnel + JSONB).
    """
    queries = [
        """
        CREATE TABLE IF NOT EXISTS opta_matches (
            id VARCHAR PRIMARY KEY,
            description TEXT,
            date_time TIMESTAMP,
            competition_id VARCHAR,
            home_id VARCHAR,
            away_id VARCHAR,
            status VARCHAR,
            scores JSONB,
            season_name VARCHAR,
            week INT,
            winner VARCHAR,
            match_metadata JSONB
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS opta_players (
            id VARCHAR PRIMARY KEY,
            name TEXT
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS opta_events (
            opta_id BIGINT PRIMARY KEY,
            match_id VARCHAR REFERENCES opta_matches(id),
            event_id INTEGER,
            team_id VARCHAR,
            player_id VARCHAR,
            type_id INTEGER,
            period_id INTEGER,
            min INTEGER,
            sec INTEGER,
            x FLOAT,
            y FLOAT,
            outcome INTEGER,
            qualifiers JSONB
        );
        """
    ]
    
    with engine.begin() as conn:
        for query in queries:
            conn.execute(text(query))
    print("✅ Schéma de base de données initialisé.")

def run_json_ingestion():
    """
    Pipeline d'ingestion massive Opta JSON.
    """
    print("🚀 DÉMARRAGE DU PIPELINE D'INGESTION OPTA JSON")

    # 1. Sécurité et Environnement
    ENV_PATH = '/home/datafoot/.env'
    INGEST_DIR = '/home/datafoot/startOpta/'
    
    if not os.path.exists(ENV_PATH):
        ENV_PATH = '.env'
        INGEST_DIR = os.path.join('Oldprojet', 'Exemple') # Fallback local pour développement
        
    load_dotenv(ENV_PATH)
    DB_PWD = os.getenv('POSTGRES_PWD')
    
    if not DB_PWD:
        print(f"❌ ERREUR : POSTGRES_PWD non trouvée dans {ENV_PATH}")
        return

    # 2. Initialisation Connexion
    db_url = f"postgresql://analyst_admin:{DB_PWD}@localhost:5432/datafoot_db"
    engine = create_engine(db_url)
    
    # 3. Création des tables
    create_tables(engine)

    # 4. Scan des fichiers .txt (JSON Opta)
    search_pattern = os.path.join(INGEST_DIR, "eventing-*.txt")
    files = glob.glob(search_pattern)
    
    if not files:
        print(f"⚠️ Aucun fichier eventing-*.txt trouvé dans {INGEST_DIR}")
        return

    print(f"📂 {len(files)} fichiers détectés pour ingestion.")

    for file_path in files:
        file_name = os.path.basename(file_path)
        print(f"\n--- Ingestion de : {file_name} ---")

        data = extract_pure_json(file_path)
        if not data:
            continue

        match_info = data.get('matchInfo', {})
        live_data = data.get('liveData', {})
        match_id = match_info.get('id')
        
        if not match_id:
            print(f"⚠️ Aucun ID de match trouvé dans {file_name}")
            continue

        # 5. Insertion Match (Upsert)
        contestants = match_info.get('contestant', [])
        home_id = next((c['id'] for c in contestants if c.get('position') == 'home'), None)
        away_id = next((c['id'] for c in contestants if c.get('position') == 'away'), None)
        
        match_details = live_data.get('matchDetails', {})
        
        # Extraction "Zéro-Perte" : on garde tout liveData sauf les événements (déjà stockés ailleurs)
        live_data_meta = {k: v for k, v in live_data.items() if k != 'event'}
        
        match_record = {
            "id": match_id,
            "description": match_info.get('description'),
            "date_time": f"{match_info.get('date', '').replace('Z', '')} {match_info.get('time', '').replace('Z', '')}",
            "competition_id": match_info.get('competition', {}).get('id'),
            "home_id": home_id,
            "away_id": away_id,
            "status": match_details.get('matchStatus'),
            "scores": json.dumps(match_details.get('scores')),
            "season_name": match_info.get('tournamentCalendar', {}).get('name'),
            "week": int(match_info.get('week')) if match_info.get('week') else None,
            "winner": match_details.get('winner'),
            "match_metadata": json.dumps({
                "matchInfo": match_info,
                "liveData": live_data_meta
            })
        }

        with engine.begin() as conn:
            # Upsert Match
            upsert_match = text("""
                INSERT INTO opta_matches (id, description, date_time, competition_id, home_id, away_id, status, scores, season_name, week, winner, match_metadata)
                VALUES (:id, :description, :date_time, :competition_id, :home_id, :away_id, :status, :scores, :season_name, :week, :winner, :match_metadata)
                ON CONFLICT (id) DO UPDATE SET 
                    status = EXCLUDED.status,
                    scores = EXCLUDED.scores,
                    winner = EXCLUDED.winner,
                    match_metadata = EXCLUDED.match_metadata;
            """)
            conn.execute(upsert_match, match_record)

            # 6. Idempotence : Suppression des événements précédents pour ce match
            print(f"🧹 Nettoyage des événements pour le match {match_id}")
            conn.execute(text("DELETE FROM opta_events WHERE match_id = :m"), {"m": match_id})

            # 7. Préparation des Événements et Joueurs
            events = live_data.get('event', [])
            players_to_upsert = {} # id: name
            event_records = []

            for ev in events:
                p_id = ev.get('playerId')
                p_name = ev.get('playerName')
                if p_id and p_name:
                    players_to_upsert[p_id] = p_name

                event_records.append({
                    "opta_id": ev.get('id'),
                    "match_id": match_id,
                    "event_id": ev.get('eventId'),
                    "team_id": ev.get('contestantId'),
                    "player_id": p_id,
                    "type_id": ev.get('typeId'),
                    "period_id": ev.get('periodId'),
                    "min": ev.get('timeMin'),
                    "sec": ev.get('timeSec'),
                    "x": ev.get('x'),
                    "y": ev.get('y'),
                    "outcome": ev.get('outcome'),
                    "qualifiers": json.dumps(ev.get('qualifier', []))
                })

            # 8. Upsert Joueurs
            for player_id, player_name in players_to_upsert.items():
                conn.execute(text("""
                    INSERT INTO opta_players (id, name) VALUES (:id, :name)
                    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
                """), {"id": player_id, "name": player_name})

            # 9. Ingestion Batch des Événements
            if event_records:
                # Utilisation d'un insert batch classique (plus rapide)
                insert_event = text("""
                    INSERT INTO opta_events (opta_id, match_id, event_id, team_id, player_id, type_id, period_id, min, sec, x, y, outcome, qualifiers)
                    VALUES (:opta_id, :match_id, :event_id, :team_id, :player_id, :type_id, :period_id, :min, :sec, :x, :y, :outcome, :qualifiers)
                """)
                conn.execute(insert_event, event_records)
                print(f"✅ {len(event_records)} événements insérés.")

    print("\n🏁 PIPELINE JSON TERMINÉ.")

if __name__ == "__main__":
    run_json_ingestion()
