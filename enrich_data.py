import os
import pandas as pd
import numpy as np
import json
import logging
import argparse
from sqlalchemy import create_engine, text
from sqlalchemy.types import Text
from datetime import datetime
from dotenv import load_dotenv

# Chargement des variables d'environnement
load_dotenv()

# =================================================================
# CONFIGURATION GÉNÉRALE & LOGGING
# =================================================================
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("enrichment_errors.log"),
        logging.StreamHandler()
    ]
)
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
        'Indice_Type_pass': { 'vertical_passes_avg': 0.20, 'through_passes_avg': 0.15, 'diagonal_to_flank_avg': 0.13, 'crosses_avg': 0.12, 'long_passes_avg': 0.10, 'short_medium_pass_avg': 0.08, 'average_pass_length': 0.07, 'average_long_pass_length': 0.06, 'corners_taken_avg': 0.05, 'free_kicks_taken_avg': 0.04 },
        'Indice_Acc_type_pass': { 'successful_vertical_passes_percent': 0.35, 'successful_through_passes_percent': 0.25, 'accurate_crosses_percent': 0.20, 'successful_long_passes_percent': 0.13, 'accurate_short_medium_pass_percent': 0.07 },
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
# 4. CONFIGURATION DES PROFILS FIXES (Poids des métriques par poste)
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
# 4. UTILITAIRES
# =================================================================

# Calcul de l'âge vectorisé supprimé (déplacé dans process_batch)

def normalize_metrics(df_calc, metrics_list, min_minutes=400):
    """Calcule les séries de normalisation sans modifier le DF original."""
    valid_mask = df_calc['minutes_on_field'] >= min_minutes
    new_norm_series = {}
    
    for m in metrics_list:
        if m in df_calc.columns:
            valid_df = df_calc[valid_mask]
            if valid_df.empty: continue
            group_stats = valid_df.groupby(['competition', 'season', 'position_category'])[m].agg(['min', 'max']).reset_index()
            temp_df = df_calc[['competition', 'season', 'position_category', m]].merge(group_stats, on=['competition', 'season', 'position_category'], how='left')
            diff = temp_df['max'] - temp_df['min']
            norm_series = np.where(diff > 0, (temp_df[m] - temp_df['min']) / diff, 0)
            new_norm_series[f'{m}_norm'] = np.clip(norm_series, 0, 1)
    return new_norm_series

# =================================================================
# 5. FONCTION DE CALCUL D'UN BATCH
# =================================================================

def process_batch(df, all_metric_keys, all_profile_metrics):
    """Applique tous les calculs analytiques (Optimisation: Concat Unique)."""
    if df.empty:
        return df

    # 1. Bouclier typologique & Nettoyage
    text_cols = [
        'birth_country_code', 'birth_country_name', 'birth_date', 'birth_day', 
        'contract_expires', 'current_team_color', 'current_team_logo', 'current_team_name', 
        'domestic_competition_name', 'foot', 'full_name', 'image', 'last_club_name', 
        'name', 'passport_country_codes', 'passport_country_names', 'positions', 
        'primary_position', 'secondary_position', 'third_position', 'competition', 'season',
        'position_category'
    ]
    
    # On opère sur une copie pour éviter les SettingWithCopy
    df_main = df.copy()
    for col in df_main.columns:
        if col in text_cols:
            if col in ['secondary_position', 'third_position', 'positions']:
                df_main[col] = df_main[col].replace({0: np.nan, '0': np.nan, 0.0: np.nan})
        else:
            if df_main[col].dtype == object:
                df_main[col] = df_main[col].astype(str).str.replace(',', '.', regex=False)
            df_main[col] = pd.to_numeric(df_main[col], errors='coerce')

    # Dictionnaire temporaire pour TOUTES les nouvelles colonnes
    new_results = {}

    # 2. Mapping Positions
    pos_cat = df_main['primary_position'].map(POS_MAPPING).fillna('Autres')
    new_results['position_category'] = pos_cat

    # 3. Âge et Playtime
    birth_dates = pd.to_datetime(df_main['birth_day'], errors='coerce')
    season_strs = df_main['season'].astype(str)
    season_years = season_strs.str.extract(r'(\d{4})')[0].astype(float).fillna(0).astype(int)
    is_split = season_strs.str.contains('/')
    ref_dates = pd.to_datetime(season_years.astype(str) + '-01-01')
    ref_dates.loc[~is_split] = pd.to_datetime(season_years.astype(str) + '-06-01')
    
    new_results['season_age'] = ((ref_dates - birth_dates).dt.days / 365.25).round(1)
    new_results['season_age_years'] = np.floor(new_results['season_age'].fillna(0)).astype(int)
    
    max_mins = df_main.groupby(['season', 'competition'])['minutes_on_field'].transform('max')
    new_results['playtime_percent'] = (df_main['minutes_on_field'] / max_mins * 100).fillna(0)

    # 4. Percentiles
    from scipy import stats
    eligible_mask = df_main['minutes_on_field'] >= (max_mins * 0.30)
    
    for m in all_metric_keys:
        if m in df_main.columns:
            pct_series = pd.Series(0.0, index=df_main.index)
            for cat in pos_cat.unique():
                cat_mask = (pos_cat == cat)
                full_mask = cat_mask & eligible_mask
                if full_mask.any():
                    dist = df_main.loc[full_mask, m].values
                    pct_series.loc[cat_mask] = df_main.loc[cat_mask, m].apply(
                        lambda x: stats.percentileofscore(dist, x, kind='mean')
                    )
            new_results[f'{m}_pct'] = pct_series

    # 5. Calcul des INDICES (en utilisant new_results pour les _pct)
    indices_data = {}
    for p_type, configs in INDICES_CONFIG.items():
        mask = (pos_cat == 'Gardien') if p_type == 'goalkeeper' else (pos_cat != 'Gardien')
        for idx_name, weights in configs.items():
            idx_series = pd.Series(0.0, index=df_main.index)
            for m, w in weights.items():
                pct_key = f'{m}_pct'
                if pct_key in new_results:
                    val = new_results[pct_key]
                    idx_series += (100 - val) * abs(w) if w < 0 else val * w
            
            total_weight = sum(abs(v) for v in weights.values())
            if total_weight > 0:
                idx_series /= total_weight
            indices_data[idx_name] = idx_series.where(mask, 0.0)
    
    # On ajoute les indices au dictionnaire final
    new_results.update(indices_data)

    # 6. Notes
    temp_indices_df = pd.DataFrame(indices_data)
    if not temp_indices_df.empty:
        new_results['note_globale'] = temp_indices_df.mean(axis=1).fillna(0)
    else:
        new_results['note_globale'] = pd.Series(0.0, index=df_main.index)
    
    note_pond_series = new_results['note_globale'].copy()
    for cat, weights in NOTES_PONDEREE_CONFIG.items():
        cat_mask = (pos_cat == cat)
        if cat_mask.any():
            w_sum = pd.Series(0.0, index=df_main.index)
            w_total = 0.0
            for idx_name, w in weights.items():
                if idx_name in temp_indices_df.columns:
                    w_sum += temp_indices_df[idx_name] * w
                    w_total += w
            if w_total > 0:
                note_pond_series.loc[cat_mask] = (w_sum / w_total).loc[cat_mask]
    new_results['note_ponderee'] = note_pond_series

    # 7. Profils
    # On prépare un DF de calcul temporaire pour normalize_metrics
    df_calc = pd.concat([df_main, pd.DataFrame({'position_category': pos_cat}, index=df_main.index)], axis=1)
    norm_cols = normalize_metrics(df_calc, list(all_profile_metrics))
    # On ajoute les norm_cols au DF de calcul pour les profils
    df_calc = pd.concat([df_calc, pd.DataFrame(norm_cols, index=df_main.index)], axis=1)

    for cat, profiles in PROFILE_WEIGHTS.items():
        cat_mask = (pos_cat == cat)
        if not cat_mask.any(): continue
        for prof_name, weights in profiles.items():
            prof_col = f'profile_affinity_{prof_name.lower().replace(" ", "_").replace("-", "_")}'
            aff_series = pd.Series(0.0, index=df_main.index)
            for m, w in weights.items():
                norm_col = f'{m}_norm'
                if norm_col in df_calc.columns:
                    aff_series += df_calc[norm_col] * w
            
            # Rank PCT sur le groupe
            final_aff = pd.Series(0.0, index=df_main.index)
            final_aff.loc[cat_mask] = aff_series.loc[cat_mask].rank(pct=True) * 100
            new_results[prof_col] = final_aff

    # 8. Fusion Unique et Nettoyage
    # On supprime du DF original les colonnes qu'on va réinjecter pour éviter les doublons
    cols_to_overwrite = [c for c in new_results.keys() if c in df_main.columns]
    df_main = df_main.drop(columns=cols_to_overwrite)
    
    # Concaténation unique
    df_final = pd.concat([df_main, pd.DataFrame(new_results, index=df_main.index)], axis=1)
    
    # Nettoyage final
    df_final = df_final.replace({np.nan: None})
    cols_to_drop = [c for c in df_final.columns if c in ['max_mins_comp', 'percentile_eligible'] or str(c).endswith('_norm')]
    return df_final.drop(columns=cols_to_drop)

# =================================================================
# 5. MAIN ENRICHMENT PROCESS (BATCH MODE)
# =================================================================

def run_enrichment(mode):
    logger.info(f"Démarrage du Enrichment Processing (Mode: {mode})...")
    engine = create_engine(DB_URL)
    
    # Pré-collecte des métriques
    all_metric_keys = set()
    for idx_cat in INDICES_CONFIG.values():
        for idx_def in idx_cat.values():
            all_metric_keys.update(idx_def.keys())
    
    all_profile_metrics = set()
    for p_cat in PROFILE_WEIGHTS.values():
        for p_def in p_cat.values():
            all_profile_metrics.update(p_def.keys())

    try:
        with engine.connect() as conn:
            # 1. Découverte des contextes bruts
            logger.info("Analyse des contextes (Compétitions / Saisons) disponibles dans la source...")
            all_contexts = conn.execute(text(f"SELECT DISTINCT competition, season FROM {SOURCE_TABLE}")).fetchall()
            all_contexts_set = set((r[0], r[1]) for r in all_contexts)
            
            # 2. Découverte des contextes déjà enrichis (Resume Logic)
            existing_ids = []
            done_contexts_set = set()
            
            if mode == "-2":
                logger.info(f"Vérification de l'état d'avancement dans {TARGET_TABLE}...")
                try:
                    # Lecture des IDs existants pour le Smart Delta
                    existing_ids = pd.read_sql(f"SELECT id FROM {TARGET_TABLE}", conn)['id'].tolist()
                    
                    done_contexts = conn.execute(text(f"SELECT DISTINCT competition, season FROM {TARGET_TABLE}")).fetchall()
                    done_contexts_set = set((r[0], r[1]) for r in done_contexts)
                except Exception:
                    # Si la table n'existe pas encore
                    done_contexts_set = set()
                    existing_ids = []
            
            # 3. Calcul du delta (ce qui reste à traiter)
            if mode == "-1":
                to_process = sorted(list(all_contexts_set)) # Tout traiter en Full Replace
            else:
                to_process = sorted(list(all_contexts_set - done_contexts_set))
                
            logger.info(f"Contextes totaux: {len(all_contexts_set)} | À traiter: {len(to_process)}")

        # 4. Boucle itérative par contexte (Résilience individuelle)
        for i, (comp, season) in enumerate(to_process):
            try:
                logger.info(f"[{i+1}/{len(to_process)}] Traitement : {comp} - {season}...")
                
                # Chargement sélectif
                sql = text(f"SELECT * FROM {SOURCE_TABLE} WHERE competition = :comp AND season = :season")
                df_batch = pd.read_sql(sql, engine, params={"comp": comp, "season": season})
                
                if df_batch.empty:
                    continue

                # Vérification Smart Delta : On vérifie si ce batch contient des nouveautés
                if mode == "-2" and existing_ids:
                    if df_batch[~df_batch['id'].isin(existing_ids)].empty:
                        logger.info(f"   -> Skip : Aucun nouveau joueur dans ce contexte.")
                        continue

                # Calculs analytiques (Sur le batch COMPLET pour la justesse statistique)
                df_enriched = process_batch(df_batch, all_metric_keys, all_profile_metrics)

                # Logique d'insertion intelligente
                if_exists_action = 'append'
                
                if mode == "-2" and existing_ids:
                    # Filtrage post-calcul pour ne pas insérer de doublons
                    df_enriched = df_enriched[~df_enriched['id'].isin(existing_ids)]
                elif mode == "-1" and i == 0:
                    # Full Replace : on écrase la table sur le premier batch du cycle
                    if_exists_action = 'replace'

                if df_enriched.empty:
                    continue

                # Injection (Optimisée par lots)
                df_enriched.to_sql('players_enriched', engine, schema='wyscout_data', if_exists=if_exists_action, index=False, chunksize=5000, method='multi')
                logger.info(f"   -> Succès : {len(df_enriched)} joueurs injectés.")
            
            except Exception as batch_error:
                logger.error(f"!!! ÉCHEC sur le batch {comp} - {season} : {batch_error}")
                # On continue la boucle pour ne pas bloquer les autres saisons
                continue

        logger.info("Cycle d'enrichissement terminé.")

    except Exception as e:
        logger.error(f"ERREUR FATALE durant l'initialisation du batch processing : {e}")
        import traceback
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Moteur d'enrichissement analytique Wyscout.")
    parser.add_argument("--mode", choices=["-1", "-2"], required=True, help="Mode d'enrichissement : -1 (Full Replace) ou -2 (Smart Incremental)")
    args = parser.parse_args()
    
    run_enrichment(args.mode)
