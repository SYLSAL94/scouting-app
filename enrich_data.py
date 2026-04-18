import pandas as pd
import numpy as np
import json
import logging
from sqlalchemy import create_engine, text
from datetime import datetime

# =================================================================
# CONFIGURATION GÉNÉRALE & LOGGING
# =================================================================
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Remplacez par vos vrais identifiants VPS / PostgreSQL
DB_URL = "postgresql://postgres:password@localhost:5432/scouting_db"
SOURCE_TABLE = "wyscout_data.players_raw"
TARGET_TABLE = "wyscout_data.players_enriched"

# =================================================================
# 1. MAPPING DES POSITIONS (Wyscout Shortcodes -> Catégories UI)
# =================================================================
POS_MAPPING = {
    'GK': 'Gardien',
    'CB': 'Defenseurs centraux', 'LCB': 'Defenseurs centraux', 'LCB3': 'Defenseurs centraux', 
    'RCB': 'Defenseurs centraux', 'RCB3': 'Defenseurs centraux',
    'LB': 'Latéraux', 'RB': 'Latéraux', 'LB5': 'Latéraux', 'RB5': 'Latéraux', 
    'RWB': 'Latéraux', 'LWB': 'Latéraux',
    'DMF': 'Milieux defensifs', 'LDMF': 'Milieux defensifs', 'RDMF': 'Milieux defensifs',
    'LCMF': 'Milieux centraux', 'LCMF3': 'Milieux centraux', 'RCMF': 'Milieux centraux', 'RCMF3': 'Milieux centraux',
    'AMF': 'Milieux offensifs',
    'RW': 'Ailiers', 'RWF': 'Ailiers', 'LW': 'Ailiers', 'LWF': 'Ailiers', 'LAMF': 'Ailiers', 'RAMF': 'Ailiers',
    'CF': 'Avant-centre'
}

# =================================================================
# 2. CONFIGURATION DES INDICES DE PERFORMANCE (Poids des percentiles)
# =================================================================
INDICES_CONFIG = {
    'field_player': {
        'Volume_Offensif': { 'xg_shot_avg': 0.35, 'offensive_duels_avg': 0.25, 'shots_avg': 0.20, 'head_shots_avg': 0.13, 'penalties_taken': 0.07 },
        'Acc_Offensive': { 'decisive_goal_avg': 0.20, 'non_penalty_goal_avg': 0.15, 'goals_avg': 0.13, 'goal_conversion_percent': 0.12, 'successful_attacking_actions_avg': 0.10 },
        'Creation': { 'assists_avg': 0.20, 'deep_completed_cross_avg': 0.15, 'xg_assist_avg': 0.11, 'key_passes_avg': 0.06, 'shot_assists_avg': 0.05 },
        'Passes': { 'pass_to_penalty_area_avg': 0.30, 'passes_to_final_third_avg': 0.25, 'progressive_pass_avg': 0.13, 'vertical_passes_avg': 0.12 },
        'Defensif': { 'possession_adjusted_interceptions': 0.50, 'interceptions_avg': 0.30, 'defensive_duels_won': 0.20 }
    },
    'goalkeeper': {
        'Arrets': { 'save_percent': 0.40, 'conceded_goals_avg': -0.25, 'save_avg': 0.20, 'shots_against_avg': -0.15 },
        'Sorties': { 'gk_aerial_duels_avg': 0.70, 'goalkeeper_exits_avg': 0.30 },
        'Distribution': { 'accurate_passes_percent': 0.50, 'successful_long_passes_percent': 0.30, 'passes_avg': 0.20 }
    }
}

# =================================================================
# 3. CONFIGURATION DES PROFILS FIXES (Normalisation Min-Max par poste)
# =================================================================
PROFILE_WEIGHTS = {
    'Gardien': {
        'Shot-stopper': { 'save_percent': 0.35, 'save_avg': 0.15, 'prevented_goals_avg': 0.20, 'xg_save_avg': 0.20, 'save_with_reflex_percent': 0.10 },
        'Sweeper-keeper': { 'goalkeeper_exits_avg': 0.45, 'gk_aerial_duels_avg': 0.25, 'long_passes_avg': 0.15, 'successful_long_passes_percent': 0.15 },
        'Lanceur': { 'long_passes_avg': 0.25, 'average_long_pass_length': 0.15, 'accurate_passes_percent': 0.20, 'successful_long_passes_percent': 0.20 },
        'Gardien Aérien': { 'gk_aerial_duels_avg': 0.50, 'aerial_duels_won': 0.50 }
    },
    'Defenseurs centraux': {
        'Stoppeur': { 'defensive_duels_won': 0.22, 'defensive_duels_avg': 0.12, 'aerial_duels_won': 0.20, 'aerial_duels_avg': 0.10, 'tackle_avg': 0.14, 'successful_tackle_percent': 0.12 },
        'Relanceur': { 'passes_avg': 0.08, 'progressive_pass_avg': 0.18, 'vertical_passes_avg': 0.14, 'passes_to_final_third_avg': 0.14, 'accurate_passes_percent': 0.14 },
        'Libéro porteur': { 'progressive_run_avg': 0.30, 'dribbles_with_progress_avg': 0.25, 'run_avg': 0.15, 'ball_entry_in_final_third_avg': 0.10 },
        'Anticipateur': { 'interceptions_avg': 0.40, 'possession_adjusted_interceptions': 0.40, 'covering_depth_avg': 0.20 }
    },
    'Latéraux': {
        'Défenseur': { 'tackle_avg': 0.20, 'defensive_duels_won': 0.18, 'successful_tackle_percent': 0.14, 'interceptions_avg': 0.18, 'covering_depth_avg': 0.12 },
        'Centreur': { 'crosses_avg': 0.30, 'deep_completed_cross_avg': 0.25, 'accurate_crosses_percent': 0.20, 'pass_to_penalty_area_avg': 0.10 },
        'Porteur': { 'progressive_run_avg': 0.30, 'dribbles_avg': 0.20, 'dribbles_with_progress_avg': 0.25, 'ball_entry_in_final_third_avg': 0.15 }
    },
    'Milieux defensifs': {
        'Sentinelle': { 'interceptions_avg': 0.25, 'possession_adjusted_interceptions': 0.20, 'recoveries_avg': 0.20, 'covering_depth_avg': 0.15, 'defensive_duels_won': 0.10 },
        'Regista': { 'passes_avg': 0.08, 'progressive_pass_avg': 0.18, 'vertical_passes_avg': 0.14, 'passes_to_final_third_avg': 0.18, 'accurate_passes_percent': 0.10 },
        'Presseur récupérateur': { 'pressing_duels_avg': 0.30, 'recovery_counterpressing_avg': 0.25, 'counterattack_interception_avg': 0.20 }
    },
    'Milieux centraux': {
        'Box-to-box': { 'progressive_run_avg': 0.22, 'dribbles_with_progress_avg': 0.16, 'recoveries_avg': 0.16, 'run_avg': 0.16, 'defensive_duels_won': 0.16 },
        'Créateur': { 'assists_avg': 0.20, 'key_passes_avg': 0.20, 'shot_assists_avg': 0.10, 'xg_assist_avg': 0.20, 'smart_passes_avg': 0.15 },
        'Équilibreur': { 'accurate_passes_percent': 0.18, 'progressive_pass_avg': 0.18, 'vertical_passes_avg': 0.12, 'recoveries_avg': 0.18 }
    },
    'Milieux offensifs': {
        'Playmaker': { 'key_passes_avg': 0.20, 'xg_assist_avg': 0.20, 'smart_passes_avg': 0.15, 'pass_to_penalty_area_avg': 0.20, 'passes_to_final_third_avg': 0.15 },
        'Second attaquant': { 'goals_avg': 0.25, 'xg_shot_avg': 0.25, 'shots_avg': 0.15, 'goal_conversion_percent': 0.15, 'touch_in_box_avg': 0.20 },
        'Trequartista': { 'received_pass_avg': 0.40, 'linkup_plays_avg': 0.40, 'assists_avg': 0.20 }
    },
    'Ailiers': {
        'Provocateur': { 'dribbles_avg': 0.30, 'successful_dribbles_percent': 0.20, 'progressive_run_avg': 0.20, 'foul_suffered_avg': 0.10 },
        'Finisseur côté': { 'goals_avg': 0.25, 'xg_shot_avg': 0.25, 'shots_on_target_percent': 0.15, 'touch_in_box_avg': 0.20 },
        'Ailier inversé': { 'shots_avg': 0.40, 'goal_conversion_percent': 0.30, 'inside_run_avg': 0.30 }
    },
    'Avant-centre': {
        'Finisseur': { 'goals_avg': 0.30, 'xg_shot_avg': 0.30, 'goal_conversion_percent': 0.20, 'shots_on_target_percent': 0.10, 'touch_in_box_avg': 0.10 },
        'Point d’appui': { 'aerial_duels_won': 0.25, 'linkup_plays_avg': 0.25, 'received_long_pass_avg': 0.15, 'duels_won': 0.15 },
        'Renard des surfaces': { 'touch_in_box_avg': 0.40, 'goals_avg': 0.40, 'non_penalty_goal_avg': 0.20 }
    }
}

# =================================================================
# UTILS & CALCULS
# =================================================================

def calculate_season_age(row):
    try:
        if pd.isna(row['birth_day']): return None
        birth = pd.to_datetime(row['birth_day'])
        season_str = str(row['season'])
        year = int(season_str.split('/')[0]) if '/' in season_str else int(season_str)
        ref_date = datetime(year, 1, 1) if '/' in season_str else datetime(year, 6, 1)
        return round((ref_date - birth).days / 365.25, 1)
    except:
        return None

def normalize_metrics(df, metrics_list):
    """Normalise min-max par groupe de position_category."""
    for m in metrics_list:
        if m in df.columns:
            group_min = df.groupby('position_category')[m].transform('min')
            group_max = df.groupby('position_category')[m].transform('max')
            diff = group_max - group_min
            df[f'{m}_norm'] = np.where(diff > 0, (df[m] - group_min) / diff, 0)
    return df

# =================================================================
# MAIN ENRICHMENT PROCESS
# =================================================================

def run_enrichment():
    logger.info("Connexion à la base de données...")
    engine = create_engine(DB_URL)
    
    try:
        # 1. Chargement
        df = pd.read_sql(f"SELECT * FROM {SOURCE_TABLE}", engine)
        logger.info(f"Chargé {len(df)} joueurs.")

        # 2. Mapping Positions (Correction : Utilisation de primary_position pour éviter le KeyError)
        if 'primary_position' in df.columns:
            df['position_category'] = df['primary_position'].map(POS_MAPPING).fillna('Autres')
        else:
            # Fallback direct si la colonne est nommée différemment dans certaines versions
            df['position_category'] = df['primary_position'].map(POS_MAPPING).fillna('Autres')

        # 3. Âge et Playtime
        df['season_age'] = df.apply(calculate_season_age, axis=1)
        df['max_mins_comp'] = df.groupby(['season', 'competition'])['minutes_on_field'].transform('max')
        df['playtime_percent'] = (df['minutes_on_field'] / df['max_mins_comp'] * 100).fillna(0)

        # 4. Pré-calcul des Percentiles (utilisés pour les indices)
        # On calcule les percentiles par rapport aux autres joueurs de la même CATÉGORIE
        all_metric_keys = set()
        for idx_cat in INDICES_CONFIG.values():
            for idx_def in idx_cat.values():
                all_metric_keys.update(idx_def.keys())

        for m in all_metric_keys:
            if m in df.columns:
                df[f'{m}_pct'] = df.groupby('position_category')[m].rank(pct=True) * 100

        # 5. Calcul des INDICES (Volume, Précision, etc.)
        for p_type, configs in INDICES_CONFIG.items():
            # Filtre simple car field_player/goalkeeper est global
            mask = (df['position_category'] == 'Gardien') if p_type == 'goalkeeper' else (df['position_category'] != 'Gardien')
            for idx_name, weights in configs.items():
                col_name = f'indice_{idx_name.lower()}'
                df.loc[mask, col_name] = 0
                for m, w in weights.items():
                    pct_col = f'{m}_pct'
                    if pct_col in df.columns:
                        df.loc[mask, col_name] += df.loc[mask, pct_col] * w

        # 6. Notes (Globale & Pondérée)
        indice_cols = [c for c in df.columns if c.startswith('indice_')]
        df['note_globale'] = df[indice_cols].mean(axis=1).fillna(0)
        # Note pondérée simplifiée : ici par exemple on favorise les indices offensifs pour les attaquants
        df['note_ponderee'] = df['note_globale'] # À affiner selon vos préférences métiers

        # 7. Calcul des PROFILS (Normalisation Min-Max)
        all_profile_metrics = set()
        for p_cat in PROFILE_WEIGHTS.values():
            for p_def in p_cat.values():
                all_profile_metrics.update(p_def.keys())
        
        df = normalize_metrics(df, list(all_profile_metrics))

        for cat, profiles in PROFILE_WEIGHTS.items():
            mask = df['position_category'] == cat
            for prof_name, weights in profiles.items():
                prof_col = f'profile_affinity_{prof_name.lower().replace(" ", "_").replace("-", "_")}'
                df.loc[mask, prof_col] = 0
                for m, w in weights.items():
                    norm_col = f'{m}_norm'
                    if norm_col in df.columns:
                        df.loc[mask, prof_col] += df.loc[mask, norm_col] * w
                # Ranking percentile au sein du profil
                if mask.any():
                    df.loc[mask, prof_col] = df.loc[mask, prof_col].rank(pct=True) * 100

        # 8. Nettoyage Final (NaN au bulldozer)
        df = df.fillna("")
        
        # Supprimer les colonnes temporaires de calcul
        cols_to_drop = [c for c in df.columns if c.endswith('_norm') or c.endswith('_pct') or c == 'max_mins_comp']
        df = df.drop(columns=cols_to_drop)

        # 9. Sauvegarde
        df.to_sql('players_enriched', engine, schema='wyscout_data', if_exists='replace', index=False)
        logger.info(f"Terminé avec succès. Table {TARGET_TABLE} mise à jour.")

    except Exception as e:
        logger.error(f"Erreur durant l'enrichissement : {e}")

if __name__ == "__main__":
    run_enrichment()
