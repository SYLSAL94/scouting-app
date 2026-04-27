import os
import json
import math
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# 1. Configuration Environnement & Connexion
load_dotenv()
DB_PWD = os.getenv('POSTGRES_PWD')
DB_URL = f"postgresql://analyst_admin:{DB_PWD}@localhost:5432/datafoot_db"
engine = create_engine(DB_URL)

def clean_dict_nans(d):
    """Nettoyage récursif pour transformer les NaNs imbriqués en None (compatible JSONB)."""
    if isinstance(d, dict):
        return {k: clean_dict_nans(v) for k, v in d.items()}
    elif isinstance(d, list):
        return [clean_dict_nans(i) for i in d]
    elif isinstance(d, float) and math.isnan(d):
        return None
    return d

# Grille xT (Expected Threat) - 8x12
XT_GRID = np.array([
    [0.00638303, 0.00779616, 0.00844948, 0.00977659, 0.01126777, 0.01248344, 0.01473596, 0.0174506, 0.02122129, 0.02756312, 0.03485151, 0.0379262],
    [0.00750111, 0.0087858, 0.00942358, 0.01059717, 0.01214713, 0.0138454, 0.01611135, 0.01870347, 0.02401117, 0.02953272, 0.04069992, 0.04647721],
    [0.0088799, 0.00977995, 0.01001304, 0.01110546, 0.01269174, 0.01429128, 0.01685596, 0.01935132, 0.02412401, 0.02855202, 0.05491138, 0.06442595],
    [0.00941056, 0.01082722, 0.0101654, 0.01132446, 0.01262646, 0.01483118, 0.01689587, 0.01997075, 0.02385149, 0.03511326, 0.10805102, 0.25745462],
    [0.00941056, 0.01082722, 0.0101654, 0.01132446, 0.01262646, 0.01483118, 0.01689587, 0.01997075, 0.02385149, 0.03511326, 0.10805102, 0.25745462],
    [0.0088799, 0.00977995, 0.01001304, 0.01110546, 0.01269174, 0.01429128, 0.01685596, 0.01935132, 0.02412401, 0.02855202, 0.05491138, 0.06442595],
    [0.00750111, 0.0087858, 0.00942358, 0.01059717, 0.01214713, 0.0138454, 0.01611135, 0.01870347, 0.02401117, 0.02953272, 0.04069992, 0.04647721],
    [0.00638303, 0.00779616, 0.00844948, 0.00977659, 0.01126777, 0.01248344, 0.01473596, 0.0174506, 0.02122129, 0.02756312, 0.03485151, 0.0379262]
])

TYPE_MAPPING = {
    1: 'Pass', 2: 'OffsidePass', 3: 'TakeOn', 4: 'Foul', 5: 'Out', 6: 'CornerAwarded', 7: 'Tackle', 8: 'Interception',
    9: 'Turnover', 10: 'Save', 11: 'Claim', 12: 'Clearance', 13: 'MissedShots', 14: 'ShotOnPost', 15: 'SavedShot',
    16: 'Goal', 17: 'Card', 18: 'SubstitutionOff', 19: 'SubstitutionOn', 30: 'End', 32: 'Start', 34: 'FormationSet', 
    40: 'FormationChange', 44: 'Aerial', 49: 'BallRecovery', 50: 'Dispossessed', 51: 'Error', 61: 'BallTouch', 
    74: 'BlockedPass', 99: 'Carry'
}

def get_xt_score(x, y):
    """Calcule le score xT pour une coordonnée normalisée (0-100)."""
    if pd.isna(x) or pd.isna(y): return 0.0
    # Mapping 0-100 vers grille 12x8
    gx = min(11, max(0, int((x / 100.0) * 12)))
    gy = min(7, max(0, int((y / 100.0) * 8)))
    return XT_GRID[gy, gx]

def has_qualifier_with_value(event, qid):
    """Vérifie la présence d'un qualifier par son ID."""
    qualifiers = event.get('qualifiers')
    if not qualifiers: return False
    for q in qualifiers:
        if q.get('qualifierId') == qid:
            return True
    return False

def assign_receivers(events):
    """Niveau 2 : Identifie le receveur d'une passe réussie."""
    for i, event in enumerate(events):
        if event['type'] == 'Pass' and event['outcome'] == 1:
            for j in range(i + 1, min(i + 5, len(events))):
                next_event = events[j]
                if next_event['type'] == 'Carry': continue
                if next_event['team_id'] == event['team_id'] and next_event['player_id'] != event['player_id']:
                    event['advanced_metrics']['receiver'] = next_event['player_id']
                    break

def detect_special_events(events):
    """Niveau 2 : Détecte les One-Two et les Big Chances Created."""
    for i, event1 in enumerate(events):
        # 1. One-Two
        if event1['type'] == 'Pass' and event1['outcome'] == 1 and event1['advanced_metrics'].get('receiver'):
            for j in range(i + 1, min(i + 10, len(events))):
                event2 = events[j]
                if event2['type'] == 'Pass' and event2['outcome'] == 1:
                    if event1['player_id'] == event2['advanced_metrics'].get('receiver') and \
                       event1['advanced_metrics'].get('receiver') == event2['player_id']:
                        event1['advanced_metrics']['one_two_status'] = 'initiator'
                        event2['advanced_metrics']['one_two_status'] = 'return'
                        break
        
        # 2. Big Chance Created
        is_shot = event1['type'] in ['Shot', 'MissedShots', 'Goal', 'SavedShot']
        if is_shot and has_qualifier_with_value(event1, 214): # 214 = Big Chance
            for k in range(i - 1, -1, -1):
                prev = events[k]
                if event1['cumulative_mins'] - prev['cumulative_mins'] > 0.2: break
                if prev['type'] == 'Pass' and prev['outcome'] == 1 and prev['team_id'] == event1['team_id']:
                    prev['advanced_metrics']['is_big_chance_created'] = True
                    break

def analyze_possession_sequences(events):
    """Niveau 3 : Analyse des séquences de possession et score de dangerosité."""
    if not events: return
    
    # Attribution possession_id basique
    current_pos_id = 1
    current_team = events[0]['team_id']
    for e in events:
        if e['team_id'] != current_team:
            current_pos_id += 1
            current_team = e['team_id']
        e['advanced_metrics']['possession_id'] = current_pos_id

    # Analyse des sous-séquences (breaks sur arrêts de jeu ou longs gaps)
    sub_seq_counter = 0
    sub_sequences = []
    current_sub = []
    
    for i, e in enumerate(events):
        if i > 0:
            prev = events[i-1]
            gap = (e['cumulative_mins'] - prev['cumulative_mins']) * 60
            if gap > 8.0 or e['type'] in ['Foul', 'Out', 'Start']:
                if current_sub: sub_sequences.append(current_sub)
                current_sub = []
        current_sub.append(e)
    if current_sub: sub_sequences.append(current_sub)

    for sub in sub_sequences:
        sub_seq_counter += 1
        has_shot = any(e['type'] in ['Shot', 'Goal', 'SavedShot', 'MissedShots'] for e in sub)
        has_goal = any(e['type'] == 'Goal' for e in sub)
        total_xt = sum(e['advanced_metrics'].get('xT', 0) for e in sub)
        
        # Calcul du score de dangerosité (simplifié)
        score = total_xt * 10
        if has_goal: score += 2.0
        elif has_shot: score += 0.5
        
        for e in sub:
            e['advanced_metrics']['sub_sequence_id'] = sub_seq_counter
            e['advanced_metrics']['seq_score'] = round(score, 2)
            e['advanced_metrics']['seq_has_shot'] = has_shot

def extract_matches_to_enrich():
    """Récupère les IDs de matchs présents dans opta_events mais pas encore dans opta_events_enriched."""
    query = """
        SELECT DISTINCT match_id 
        FROM opta_events 
        WHERE match_id NOT IN (
            SELECT DISTINCT match_id FROM opta_events_enriched
        )
    """
    with engine.connect() as conn:
        result = conn.execute(text(query))
        return [row[0] for row in result]

def run_enrichment():
    print("🚀 DÉMARRAGE DU PIPELINE D'ENRICHISSEMENT ELT (NIVEAUX 1, 2 & 3)")
    
    match_ids = extract_matches_to_enrich()
    if not match_ids:
        print("✅ Tous les matchs sont déjà enrichis.")
        return

    print(f"📂 {len(match_ids)} matchs à traiter.")

    for m_id in match_ids:
        print(f"\n--- Enrichissement du match : {m_id} ---")
        
        # 1. Extraction SQL
        query = text("SELECT * FROM opta_events WHERE match_id = :m ORDER BY period_id, min, sec")
        df = pd.read_sql(query, engine, params={"m": m_id})
        
        if df.empty: continue

        # 2. Transformation Niveau 1 (RAM)
        df['type'] = df['type_id'].map(TYPE_MAPPING).fillna(df['type_id'].astype(str))
        df['outcomeType'] = df['outcome'].apply(lambda x: 'Successful' if x == 1 else 'Unsuccessful')
        df['cumulative_mins'] = df['min'] + df['sec']/60.0 + df['period_id'].apply(lambda x: 45.0 if x == 2 else 0.0)
        
        def get_q_val(q, qid):
            if not q: return None
            for item in q:
                if item.get('qualifierId') == qid:
                    return item.get('value', True)
            return None

        df['endX'] = df['qualifiers'].apply(lambda q: get_q_val(q, 140))
        df['endY'] = df['qualifiers'].apply(lambda q: get_q_val(q, 141))
        
        events_list = []
        carry_index = 0
        
        # Premier passage : xT et Carries
        for i in range(len(df)):
            row = df.iloc[i].to_dict()
            sx, sy = row['x'], row['y']
            xt_s = get_xt_score(sx, sy)
            ex = float(row['endX']) if row['endX'] is not None and str(row['endX']).replace('.','').replace('-','').isdigit() else sx
            ey = float(row['endY']) if row['endY'] is not None and str(row['endY']).replace('.','').replace('-','').isdigit() else sy
            xt_e = get_xt_score(ex, ey)
            
            row['advanced_metrics'] = {
                "start_zone_value_xT": round(xt_s, 6),
                "end_zone_value_xT": round(xt_e, 6),
                "xT": round(xt_e - xt_s, 6),
                "prog_pass": round(ex - sx, 2) if row['type'] == 'Pass' else 0.0,
                "angle": round(math.degrees(math.atan2(ey - sy, ex - sx)), 2) if ex != sx or ey != sy else 0.0
            }
            events_list.append(row)
            
            # Carries
            if row['outcome'] == 1 and row['type'] in ['Pass', 'BallRecovery', 'Interception', 'BallTouch']:
                target_pid = row['player_id']
                if target_pid:
                    for k in range(i + 1, min(i + 10, len(df))):
                        next_ev = df.iloc[k]
                        if next_ev['player_id'] == target_pid:
                            nx, ny = next_ev['x'], next_ev['y']
                            dist = math.sqrt((nx - ex)**2 + (ny - ey)**2)
                            if dist > 5.0:
                                carry_index += 1
                                c_xt_s, c_xt_e = get_xt_score(ex, ey), get_xt_score(nx, ny)
                                events_list.append({
                                    "opta_id": f"{m_id}_carry_{carry_index}",
                                    "match_id": m_id, "event_id": row['event_id'], "team_id": row['team_id'],
                                    "player_id": target_pid, "type_id": 99, "type": "Carry",
                                    "period_id": row['period_id'], "min": row['min'], "sec": row['sec'],
                                    "cumulative_mins": row['cumulative_mins'] + 0.001,
                                    "x": ex, "y": ey, "outcome": 1, "qualifiers": None,
                                    "advanced_metrics": {
                                        "xT": round(c_xt_e - c_xt_s, 6),
                                        "prog_carry": round(nx - ex, 2),
                                        "angle": round(math.degrees(math.atan2(ny - ey, nx - ex)), 2)
                                    }
                                })
                                break
                            break

        # Tri par temps cumulé
        events_list.sort(key=lambda x: x['cumulative_mins'])

        # 3. Transformations Tactiques et Séquences (Niveaux 2 & 3)
        assign_receivers(events_list)
        detect_special_events(events_list)
        analyze_possession_sequences(events_list)

        # 4. Chargement (Load)
        enriched_df = pd.DataFrame(events_list)
        
        # Blindage Absolu Anti-NaN : Empêche Pandas de reconvertir les None en float
        enriched_df = enriched_df.astype(object).where(pd.notnull(enriched_df), None)
        
        enriched_df['advanced_metrics'] = enriched_df['advanced_metrics'].apply(lambda x: json.dumps(clean_dict_nans(x)) if x else None)
        enriched_df['qualifiers'] = enriched_df['qualifiers'].apply(lambda x: json.dumps(clean_dict_nans(x)) if x else None)

        final_cols = ['opta_id', 'match_id', 'event_id', 'team_id', 'player_id', 'type_id', 
                      'period_id', 'min', 'sec', 'x', 'y', 'outcome', 'qualifiers', 'advanced_metrics']
        
        enriched_df = enriched_df[final_cols]
        
        try:
            print(f"📥 Injection de {len(enriched_df)} événements enrichis...")
            enriched_df.to_sql('opta_events_enriched', engine, if_exists='append', index=False, method='multi')
        except Exception as e:
            print(f"\n❌ ERREUR NATIVE POSTGRESQL : {getattr(e, 'orig', e)}\n")
            raise e
        
    print("\n🏁 PIPELINE D'ENRICHISSEMENT TERMINÉ.")

if __name__ == "__main__":
    # Création de la table si elle n'existe pas
    with engine.begin() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS opta_events_enriched (
                opta_id VARCHAR PRIMARY KEY,
                match_id VARCHAR,
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
                qualifiers JSONB,
                advanced_metrics JSONB
            );
        """))
    run_enrichment()
