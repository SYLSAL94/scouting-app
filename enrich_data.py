import os
import pandas as pd
import numpy as np
import json
import logging
from sqlalchemy import create_engine, text
from datetime import datetime
from dotenv import load_dotenv

# Chargement des variables d'environnement
load_dotenv()

# =================================================================
# CONFIGURATION GÉNÉRALE & LOGGING
# =================================================================
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

pwd = os.getenv('POSTGRES_PWD')
DB_URL = f"postgresql://analyst_admin:{pwd}@127.0.0.1:5432/datafoot_db"
SOURCE_TABLE = "wyscout_data.players_stats"
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
        'Indice_Volume_Offensive': { 'xg_shot_avg': 0.35, 'offensive_duels_avg': 0.25, 'shots_avg': 0.20, 'head_shots_avg': 0.13, 'penalties_taken': 0.07 },
        'Indice_Acc_Offensive': { 'decisive_goal_avg': 0.20, 'non_penalty_goal_avg': 0.15, 'goals_avg': 0.13, 'goal_conversion_percent': 0.12, 'successful_attacking_actions_avg': 0.10, 'offensive_duels_won': 0.08, 'first_goal_avg': 0.07, 'head_goals_avg': 0.06, 'shots_on_target_percent': 0.05, 'penalties_conversion_percent': 0.04 },
        'Indice_Move_Offensive': { 'cutback_avg': 0.40, 'touch_in_box_avg': 0.25, 'off_the_balls_avg': 0.20, 'linkup_plays_avg': 0.15 },
        'Indice_Dribble': { 'dribbles_avg': 0.40, 'successful_dribbles_percent': 0.25, 'dribbles_with_progress_avg': 0.20, 'foul_suffered_avg': 0.15 },
        'Indice_Progres_run': { 'ball_entry_in_final_third_avg': 0.35, 'accelerations_avg': 0.25, 'progressive_run_avg': 0.20, 'run_avg': 0.13, 'inside_run_avg': 0.07 },
        'Indice_Received_ball': { 'received_dangerous_pass_avg': 0.40, 'received_pass_in_final_third_avg': 0.25, 'received_long_pass_avg': 0.20, 'received_pass_avg': 0.15 },
        'Indice_Pass': { 'pass_to_penalty_area_avg': 0.30, 'passes_to_final_third_avg': 0.25, 'pass_to_zone_fourteen_avg': 0.15, 'progressive_pass_avg': 0.13, 'passes_avg': 0.10, 'buildup_pass_avg': 0.07 },
        'Indice_Acc_pass': { 'accurate_pass_to_penalty_area_percent': 0.35, 'accurate_passes_to_final_third_percent': 0.25, 'successful_progressive_pass_percent': 0.20, 'successful_forward_passes_percent': 0.13, 'accurate_passes_percent': 0.07 },
        'Indice_Creation': { 'assists_avg': 0.20, 'deep_completed_cross_avg': 0.15, 'deep_completed_pass_avg': 0.12, 'xg_assist_avg': 0.11, 'smart_passes_avg': 0.09, 'accurate_smart_passes_percent': 0.08, 'pre_assist_avg': 0.07, 'key_passes_avg': 0.06, 'shot_assists_avg': 0.05, 'pre_pre_assist_avg': 0.04, 'cross_to_goalie_box_avg': 0.03 },
        'Indice_Acc_type_pass': { 'successful_vertical_passes_percent': 0.35, 'successful_through_passes_percent': 0.25, 'accurate_crosses_percent': 0.20, 'successful_long_passes_percent': 0.13, 'accurate_short_medium_pass_percent': 0.07 },
        'Indice_Type_pass': { 'vertical_passes_avg': 0.20, 'through_passes_avg': 0.15, 'diagonal_to_flank_avg': 0.13, 'crosses_avg': 0.12, 'long_passes_avg': 0.10, 'short_medium_pass_avg': 0.08, 'average_pass_length': 0.07, 'average_long_pass_length': 0.06, 'corners_taken_avg': 0.05, 'free_kicks_taken_avg': 0.04 },
        'Indice_CPA': { 'direct_free_kicks_on_target_percent': 0.50, 'direct_free_kicks_taken_avg': 0.30, 'free_kicks_taken_avg': 0.20 },
        'Indice_Duel': { 'duels_won': 0.50, 'loose_ball_duels_avg': 0.30, 'duels_avg': 0.20 },
        'Indice_Aerial_duel': { 'aerial_duels_won': 0.70, 'aerial_duels_avg': 0.30 },
        'Indice_Tackle_Block': { 'defensive_duel_regain_avg': 0.25, 'possession_adjusted_tackle': 0.20, 'successful_defensive_actions_avg': 0.15, 'successful_tackle_percent': 0.11, 'defensive_duels_won': 0.09, 'defensive_duels_avg': 0.08, 'tackle_avg': 0.07, 'shot_block_avg': 0.05 },
        'Indice_Covering_Interception': { 'possession_adjusted_interceptions': 0.50, 'interceptions_avg': 0.30, 'covering_depth_avg': 0.20 },
        'Indice_Recoveries': { 'dangerous_opponent_half_recoveries_avg': 0.50, 'opponent_half_recoveries_avg': 0.30, 'recoveries_avg': 0.20 },
        'Indice_Pressing': { 'recovery_counterpressing_avg': 0.50, 'pressing_duels_avg': 0.30, 'counterattack_interception_avg': 0.20 },
        'Indice_Lost_balls': { 'dangerous_own_half_losses_avg': -0.30, 'own_half_losses_avg': -0.25, 'lost_balls_to_saa_percent': -0.15, 'losses_avg': -0.13, 'missed_balls_avg': -0.10, 'ball_losses_avg': -0.07 },
        'Indice_Discipline': { 'red_cards_avg': -0.40, 'dangerous_foul_avg': -0.25, 'yellow_cards_avg': -0.20, 'fouls_avg': -0.15 },
    },
    'goalkeeper': {
        'Indice_Arret': { 'save_percent': 0.40, 'conceded_goals_avg': -0.25, 'save_avg': 0.20, 'shots_against_avg': -0.15 },
        'Indice_Sortie_de_but': { 'gk_aerial_duels_avg': 0.70, 'goalkeeper_exits_avg': 0.30 },
        'Indice_xG_Subit_Différentiel': { 'prevented_goals_avg': 0.35, 'xg_save_avg': 0.25, 'clean_sheets': 0.20, 'save_with_reflex_percent': 0.13, 'easy_conceded_goal_avg': -0.07 },
        'Indice_Aerial_duel': { 'aerial_duels_won': 0.70, 'aerial_duels_avg': 0.30 },
        'Indice_Pass': { 'pass_to_penalty_area_avg': 0.30, 'passes_to_final_third_avg': 0.25, 'pass_to_zone_fourteen_avg': 0.15, 'progressive_pass_avg': 0.13, 'passes_avg': 0.10, 'buildup_pass_avg': 0.07 },
        'Indice_Acc_pass': { 'accurate_pass_to_penalty_area_percent': 0.35, 'accurate_passes_to_final_third_percent': 0.25, 'successful_progressive_pass_percent': 0.20, 'successful_forward_passes_percent': 0.13, 'accurate_passes_percent': 0.07 },
        'Indice_Covering_Interception': { 'possession_adjusted_interceptions': 0.50, 'interceptions_avg': 0.30, 'covering_depth_avg': 0.20 },
        'Indice_Discipline': { 'red_cards_avg': -0.40, 'dangerous_foul_avg': -0.25, 'yellow_cards_avg': -0.20, 'fouls_avg': -0.15 },
    }
}

# =================================================================
# 3. CONFIGURATION DES NOTES PONDÉRÉES (Poids des indices par poste)
# =================================================================
NOTES_PONDEREE_CONFIG = {
    'Gardien': { 'Indice_xG_Subit_Différentiel': 0.20, 'Indice_Arret': 0.15, 'Indice_Sortie_de_but': 0.13, 'Indice_Aerial_duel': 0.12, 'Indice_Covering_Interception': 0.10, 'Indice_Type_pass': 0.08, 'Indice_Acc_type_pass': 0.07, 'Indice_Discipline': 0.06, 'Indice_Acc_pass': 0.05, 'Indice_Pass': 0.04 },
    'Defenseurs centraux': { 'Indice_Tackle_Block': 0.20, 'Indice_Duel': 0.15, 'Indice_Aerial_duel': 0.13, 'Indice_Covering_Interception': 0.12, 'Indice_Type_pass': 0.10, 'Indice_Acc_type_pass': 0.08, 'Indice_Recoveries': 0.07, 'Indice_Pressing': 0.06, 'Indice_Acc_pass': 0.05, 'Indice_Pass': 0.04 },
    'Latéraux': { 'Indice_Tackle_Block': 0.20, 'Indice_Type_pass': 0.15, 'Indice_Acc_type_pass': 0.13, 'Indice_Creation': 0.12, 'Indice_Dribble': 0.10, 'Indice_Progres_run': 0.08, 'Indice_Move_Offensive': 0.07, 'Indice_Pressing': 0.06, 'Indice_Acc_pass': 0.05, 'Indice_Pass': 0.04 },
    'Milieux defensifs': { 'Indice_Duel': 0.20, 'Indice_Covering_Interception': 0.15, 'Indice_Tackle_Block': 0.13, 'Indice_Type_pass': 0.12, 'Indice_Acc_type_pass': 0.10, 'Indice_Recoveries': 0.08, 'Indice_Lost_balls': 0.07, 'Indice_Pressing': 0.06, 'Indice_Acc_pass': 0.05, 'Indice_Pass': 0.04 },
    'Milieux centraux': { 'Indice_Received_ball': 0.20, 'Indice_Acc_type_pass': 0.15, 'Indice_Type_pass': 0.13, 'Indice_Creation': 0.12, 'Indice_Dribble': 0.10, 'Indice_Progres_run': 0.08, 'Indice_Pressing': 0.07, 'Indice_Recoveries': 0.06, 'Indice_Acc_pass': 0.05, 'Indice_Pass': 0.04 },
    'Milieux offensifs': { 'Indice_Creation': 0.20, 'Indice_Acc_Offensive': 0.15, 'Indice_Volume_Offensive': 0.13, 'Indice_Move_Offensive': 0.12, 'Indice_Type_pass': 0.10, 'Indice_Acc_type_pass': 0.08, 'Indice_Received_ball': 0.07, 'Indice_Progres_run': 0.06, 'Indice_Acc_pass': 0.05, 'Indice_Pass': 0.04 },
    'Ailiers': { 'Indice_Creation': 0.20, 'Indice_Volume_Offensive': 0.15, 'Indice_Acc_Offensive': 0.13, 'Indice_Progres_run': 0.12, 'Indice_Dribble': 0.10, 'Indice_Move_Offensive': 0.08, 'Indice_Received_ball': 0.07, 'Indice_Pressing': 0.06, 'Indice_Acc_pass': 0.05, 'Indice_Pass': 0.04 },
    'Avant-centre': { 'Indice_Acc_Offensive': 0.20, 'Indice_Volume_Offensive': 0.15, 'Indice_Received_ball': 0.13, 'Indice_Move_Offensive': 0.12, 'Indice_Aerial_duel': 0.10, 'Indice_Duel': 0.08, 'Indice_Creation': 0.07, 'Indice_Pressing': 0.06, 'Indice_Acc_pass': 0.05, 'Indice_Pass': 0.04 }
}

# =================================================================
# 4. CONFIGURATION DES PROFILS FIXES (Normalisation Min-Max par poste)
# =================================================================
PROFILE_WEIGHTS = {
    'Gardien': {
        'Shot-stopper': { 'save_percent': 0.35, 'save_avg': 0.15, 'prevented_goals_avg': 0.20, 'xg_save_avg': 0.20, 'save_with_reflex_percent': 0.10 },
        'Sweeper-keeper': { 'goalkeeper_exits_avg': 0.45, 'gk_aerial_duels_avg': 0.25, 'long_passes_avg': 0.15, 'successful_long_passes_percent': 0.15 },
        'Lanceur': { 'long_passes_avg': 0.25, 'average_long_pass_length': 0.15, 'accurate_passes_percent': 0.20, 'successful_long_passes_percent': 0.20, 'passes_avg': 0.20 },
        'Gardien Aérien': { 'gk_aerial_duels_avg': 0.50, 'aerial_duels_won': 0.50 },
        'Stoppeur de pénalty': { 'penalties_taken': 0.50, 'penalties_conversion_percent': -0.50 },
        'Premier relanceur': { 'short_medium_pass_avg': 0.40, 'successful_short_medium_pass_percent': 0.40, 'back_pass_to_gk_avg': -0.20 }
    },
    'Defenseurs centraux': {
        'Stoppeur': { 'defensive_duels_won': 0.22, 'defensive_duels_avg': 0.12, 'aerial_duels_won': 0.20, 'aerial_duels_avg': 0.10, 'tackle_avg': 0.14, 'successful_tackle_percent': 0.12, 'shot_block_avg': 0.10 },
        'Relanceur': { 'passes_avg': 0.08, 'forward_passes_avg': 0.10, 'progressive_pass_avg': 0.18, 'vertical_passes_avg': 0.14, 'passes_to_final_third_avg': 0.14, 'pass_to_penalty_area_avg': 0.10, 'successful_progressive_pass_percent': 0.12, 'accurate_passes_percent': 0.14 },
        'Libéro porteur': { 'progressive_run_avg': 0.30, 'dribbles_with_progress_avg': 0.25, 'run_avg': 0.15, 'received_pass_avg': 0.10, 'ball_entry_in_final_third_avg': 0.10, 'successful_dribbles_percent': 0.10 },
        'Duelliste Aérien': { 'aerial_duels_avg': 0.40, 'aerial_duels_won': 0.60 },
        'Anticipateur': { 'interceptions_avg': 0.40, 'possession_adjusted_interceptions': 0.40, 'covering_depth_avg': 0.20 },
        'Tacleur agressif': { 'tackle_avg': 0.35, 'successful_tackle_percent': 0.25, 'pressing_duels_avg': 0.40 }
    },
    'Latéraux': {
        'Défenseur': { 'tackle_avg': 0.20, 'defensive_duels_won': 0.18, 'successful_tackle_percent': 0.14, 'successful_defensive_actions_avg': 0.18, 'interceptions_avg': 0.18, 'covering_depth_avg': 0.12 },
        'Centreur': { 'crosses_avg': 0.30, 'deep_completed_cross_avg': 0.25, 'cross_to_goalie_box_avg': 0.15, 'accurate_crosses_percent': 0.20, 'pass_to_penalty_area_avg': 0.10 },
        'Porteur': { 'progressive_run_avg': 0.30, 'dribbles_avg': 0.20, 'dribbles_with_progress_avg': 0.25, 'ball_entry_in_final_third_avg': 0.15, 'received_pass_in_final_third_avg': 0.10 },
        'Piston créateur': { 'key_passes_avg': 0.30, 'assists_avg': 0.30, 'xg_assist_avg': 0.25, 'smart_passes_avg': 0.15 },
        'Défenseur 1v1': { 'defensive_duels_won': 0.50, 'successful_dribbles_percent': -0.25, 'dribbles_avg': -0.25 },
        'Couloir offensif': { 'accelerations_avg': 0.40, 'off_the_balls_avg': 0.30, 'touch_in_box_avg': 0.30 }
    },
    'Milieux defensifs': {
        'Sentinelle': { 'interceptions_avg': 0.25, 'possession_adjusted_interceptions': 0.20, 'recoveries_avg': 0.20, 'covering_depth_avg': 0.15, 'defensive_duels_won': 0.10, 'tackle_avg': 0.10 },
        'Regista': { 'passes_avg': 0.08, 'progressive_pass_avg': 0.18, 'vertical_passes_avg': 0.14, 'pass_to_penalty_area_avg': 0.10, 'passes_to_final_third_avg': 0.18, 'through_passes_avg': 0.14, 'accurate_passes_percent': 0.10, 'successful_progressive_pass_percent': 0.08 },
        'Presseur récupérateur': { 'pressing_duels_avg': 0.30, 'recovery_counterpressing_avg': 0.25, 'counterattack_interception_avg': 0.20, 'defensive_duel_regain_avg': 0.15, 'opponent_half_recoveries_avg': 0.10 },
        'Tireur de loin': { 'shots_avg': 0.50, 'xg_shot_avg': 0.30, 'goal_conversion_percent': 0.20 },
        'Meneur reculé': { 'long_passes_avg': 0.40, 'successful_long_passes_percent': 0.30, 'diagonal_to_flank_avg': 0.30 },
        'Destructeur': { 'fouls_avg': 0.30, 'defensive_duels_avg': 0.40, 'defensive_duels_won': 0.30 }
    },
    'Milieux centraux': {
        'Box-to-box': { 'progressive_run_avg': 0.22, 'dribbles_with_progress_avg': 0.16, 'recoveries_avg': 0.16, 'run_avg': 0.16, 'passes_to_final_third_avg': 0.14, 'defensive_duels_won': 0.16 },
        'Créateur': { 'assists_avg': 0.20, 'key_passes_avg': 0.20, 'shot_assists_avg': 0.10, 'xg_assist_avg': 0.20, 'smart_passes_avg': 0.15, 'pass_to_penalty_area_avg': 0.15 },
        'Équilibreur': { 'accurate_passes_percent': 0.18, 'accurate_short_medium_pass_percent': 0.12, 'progressive_pass_avg': 0.18, 'vertical_passes_avg': 0.12, 'recoveries_avg': 0.18, 'interceptions_avg': 0.12, 'successful_defensive_actions_avg': 0.10 },
        'Perforateur': { 'dribbles_avg': 0.40, 'successful_dribbles_percent': 0.30, 'progressive_run_avg': 0.30 },
        'Milieu buteur': { 'goals_avg': 0.40, 'xg_shot_avg': 0.40, 'touch_in_box_avg': 0.20 },
        'Contrôleur de rythme': { 'passes_avg': 0.40, 'short_medium_pass_avg': 0.30, 'accurate_passes_percent': 0.30 }
    },
    'Milieux offensifs': {
        'Playmaker': { 'key_passes_avg': 0.20, 'xg_assist_avg': 0.20, 'smart_passes_avg': 0.15, 'pass_to_penalty_area_avg': 0.20, 'passes_to_final_third_avg': 0.15, 'received_pass_in_final_third_avg': 0.10 },
        'Second attaquant': { 'goals_avg': 0.25, 'xg_shot_avg': 0.25, 'shots_avg': 0.15, 'goal_conversion_percent': 0.15, 'touch_in_box_avg': 0.20 },
        'Porteur': { 'dribbles_avg': 0.30, 'dribbles_with_progress_avg': 0.25, 'progressive_run_avg': 0.25, 'foul_suffered_avg': 0.10, 'off_the_balls_avg': 0.10 },
        'Trequartista': { 'received_pass_avg': 0.40, 'linkup_plays_avg': 0.40, 'assists_avg': 0.20 },
        'Déclencheur de pressing': { 'pressing_duels_avg': 0.50, 'opponent_half_recoveries_avg': 0.50 },
        'Spécialiste CPA': { 'corners_taken_avg': 0.40, 'free_kicks_taken_avg': 0.30, 'direct_free_kicks_on_target_percent': 0.30 }
    },
    'Ailiers': {
        'Provocateur': { 'dribbles_avg': 0.30, 'successful_dribbles_percent': 0.20, 'dribbles_with_progress_avg': 0.20, 'progressive_run_avg': 0.20, 'foul_suffered_avg': 0.10 },
        'Centreur': { 'crosses_avg': 0.30, 'deep_completed_cross_avg': 0.25, 'accurate_crosses_percent': 0.20, 'pass_to_penalty_area_avg': 0.25 },
        'Finisseur côté': { 'goals_avg': 0.25, 'xg_shot_avg': 0.25, 'shots_on_target_percent': 0.15, 'touch_in_box_avg': 0.20, 'shot_assists_avg': 0.05, 'head_goals_avg': 0.10 },
        'Ailier inversé': { 'shots_avg': 0.40, 'goal_conversion_percent': 0.30, 'inside_run_avg': 0.30 },
        'Ailier passeur': { 'key_passes_avg': 0.40, 'assists_avg': 0.30, 'xg_assist_avg': 0.30 },
        'Sprinteur': { 'accelerations_avg': 0.50, 'run_avg': 0.50 }
    },
    'Avant-centre': {
        'Finisseur': { 'goals_avg': 0.30, 'xg_shot_avg': 0.30, 'goal_conversion_percent': 0.20, 'shots_on_target_percent': 0.10, 'touch_in_box_avg': 0.10 },
        'Point d’appui': { 'aerial_duels_won': 0.25, 'aerial_duels_avg': 0.10, 'linkup_plays_avg': 0.25, 'received_long_pass_avg': 0.15, 'duels_won': 0.15, 'assists_avg': 0.10 },
        'Presseur': { 'pressing_duels_avg': 0.35, 'recovery_counterpressing_avg': 0.25, 'defensive_duel_regain_avg': 0.20, 'opponent_half_recoveries_avg': 0.10, 'counterattack_interception_avg': 0.10 },
        'Renard des surfaces': { 'touch_in_box_avg': 0.40, 'goals_avg': 0.40, 'non_penalty_goal_avg': 0.20 },
        'Attaquant complet': { 'dribbles_avg': 0.20, 'assists_avg': 0.20, 'goals_avg': 0.20, 'successful_attacking_actions_avg': 0.20, 'duels_won': 0.20 },
        'Pivot': { 'aerial_duels_won': 0.50, 'head_goals_avg': 0.30, 'head_shots_avg': 0.20 }
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

def normalize_metrics(df, metrics_list, min_minutes=400):
    logger.info('Normalisation par compétition, saison et poste (min_minutes=400)...')
    valid_mask = df['minutes_on_field'] >= min_minutes
    for m in metrics_list:
        if m in df.columns:
            valid_df = df[valid_mask]
            group_stats = valid_df.groupby(['competition', 'season', 'position_category'])[m].agg(['min', 'max']).reset_index()
            df = df.merge(group_stats, on=['competition', 'season', 'position_category'], how='left')
            diff = df['max'] - df['min']
            df[f'{m}_norm'] = np.where(diff > 0, (df[m] - df['min']) / diff, 0)
            df[f'{m}_norm'] = df[f'{m}_norm'].clip(0, 1)
            df = df.drop(columns=['min', 'max'])
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

        # 2. Mapping Positions
        df['position_category'] = df['primary_position'].map(POS_MAPPING).fillna('Autres')

        # 3. Âge et Playtime
        df['season_age'] = df.apply(calculate_season_age, axis=1)
        df['season_age_years'] = np.floor(df['season_age'].astype(float).fillna(0)).astype(int)
        df['max_mins_comp'] = df.groupby(['season', 'competition'])['minutes_on_field'].transform('max')
        df['playtime_percent'] = (df['minutes_on_field'] / df['max_mins_comp'] * 100).fillna(0)

        # 4. Pré-calcul des Percentiles
        all_metric_keys = set()
        for idx_cat in INDICES_CONFIG.values():
            for idx_def in idx_cat.values():
                all_metric_keys.update(idx_def.keys())
        
        # Filtre de minutes pour le calcul des percentiles (Parité avec worker.js : > 30% du max minutes de la comp)
        df['percentile_eligible'] = df['minutes_on_field'] >= (df['max_mins_comp'] * 0.30)

        for m in all_metric_keys:
            if m in df.columns:
                # On calcule les percentiles sur les éligibles uniquement, groupé par poste
                # Mais on les applique à tout le monde
                eligible_mask = df['percentile_eligible']
                # rank(pct=True) sur le sous-ensemble éligible
                # Note: Pandas ne supporte pas directement groupby + transform avec un masque externe facilement
                # On va calculer le rank pour chaque groupe et l'appliquer
                df[f'{m}_pct'] = 0.0
                for cat in df['position_category'].unique():
                    cat_mask = (df['position_category'] == cat)
                    full_mask = cat_mask & eligible_mask
                    if full_mask.any():
                        subset_vals = df.loc[full_mask, m]
                        # Fonction de percentile basée sur le subset éligible
                        # On ré-applique à tout le groupe cat
                        # rank method 'average' pour parité avec workers.js
                        ranks = subset_vals.rank(pct=True, method='average') * 100
                        # Pour appliquer aux non-éligibles, on utilise la distribution
                        from scipy import stats
                        dist = subset_vals.values
                        df.loc[cat_mask, f'{m}_pct'] = df.loc[cat_mask, m].apply(lambda x: stats.percentileofscore(dist, x, kind='mean'))

        # 5. Calcul des INDICES
        for p_type, configs in INDICES_CONFIG.items():
            mask = (df['position_category'] == 'Gardien') if p_type == 'goalkeeper' else (df['position_category'] != 'Gardien')
            for idx_name, weights in configs.items():
                df.loc[mask, idx_name] = 0.0
                for m, w in weights.items():
                    pct_col = f'{m}_pct'
                    if pct_col in df.columns:
                        # Inversion pour pondérations négatives (Parité worker.js : (100-val)*|w| if w < 0)
                        if w < 0:
                            df.loc[mask, idx_name] += (100 - df.loc[mask, pct_col]) * abs(w)
                        else:
                            df.loc[mask, idx_name] += df.loc[mask, pct_col] * w
                # Normalisation par la somme des poids absolus pour rester sur 100
                total_weight = sum(abs(v) for v in weights.values())
                if total_weight > 0:
                    df.loc[mask, idx_name] /= total_weight

        # 6. Notes (Globale & Pondérée)
        indice_cols = [c for c in df.columns if c.startswith('Indice_')]
        df['note_globale'] = df[indice_cols].mean(axis=1).fillna(0)
        
        # Note pondérée via NOTES_PONDEREE_CONFIG
        df['note_ponderee'] = df['note_globale']
        for cat, weights in NOTES_PONDEREE_CONFIG.items():
            mask = df['position_category'] == cat
            if mask.any():
                w_sum = 0.0
                w_total = 0.0
                for idx_name, w in weights.items():
                    if idx_name in df.columns:
                        w_sum += df.loc[mask, idx_name] * w
                        w_total += w
                if w_total > 0:
                    df.loc[mask, 'note_ponderee'] = w_sum / w_total

        # 7. Calcul des PROFILS (Normalisation Min-Max)
        all_profile_metrics = set()
        for p_cat in PROFILE_WEIGHTS.values():
            for p_def in p_cat.values():
                all_profile_metrics.update(p_def.keys())
        
        df = normalize_metrics(df, list(all_profile_metrics))

        for cat, profiles in PROFILE_WEIGHTS.items():
            mask = df['position_category'] == cat
            if not mask.any(): continue
            for prof_name, weights in profiles.items():
                prof_col = f'profile_affinity_{prof_name.lower().replace(" ", "_").replace("-", "_")}'
                df.loc[mask, prof_col] = 0.0
                for m, w in weights.items():
                    norm_col = f'{m}_norm'
                    if norm_col in df.columns:
                        df.loc[mask, prof_col] += df.loc[mask, norm_col] * w
                # Ranking percentile au sein du profil pour le groupe
                if mask.any():
                    df.loc[mask, prof_col] = df.loc[mask, prof_col].rank(pct=True) * 100

        # 8 & 9. Nettoyage & Sauvegarde (Utilisation de None pour préserver les types numériques en NULL SQL)
        df = df.replace({np.nan: None})
        cols_to_drop = [c for c in df.columns if c == 'max_mins_comp' or c == 'percentile_eligible']
        df = df.drop(columns=cols_to_drop)
        df.to_sql('players_enriched', engine, schema='wyscout_data', if_exists='replace', index=False)
        logger.info(f"Terminé avec succès. Table {TARGET_TABLE} mise à jour.")

    except Exception as e:
        logger.error(f"Erreur durant l'enrichissement : {e}")
        import traceback
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    run_enrichment()
