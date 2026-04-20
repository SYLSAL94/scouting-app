// Config-Driven Scouting Analysis
// Extrait de sharedConfig.js (Legacy Wyscout)

export const NOTES_PONDEREE_CONFIG = {
    'Gardien': {
        'Indice_xG_Subit_Différentiel': 0.20,
        'Indice_Arret': 0.15,
        'Indice_Sortie_de_but': 0.13,
        'Indice_Aerial_duel': 0.12,
        'Indice_Covering_Interception': 0.10,
        'Indice_Type_pass': 0.08,
        'Indice_Acc_type_pass': 0.07,
        'Indice_Discipline': 0.06,
        'Indice_Acc_pass': 0.05,
        'Indice_Pass': 0.04,
    },

    'Defenseurs centraux': {
        'Indice_Tackle_Block': 0.20,
        'Indice_Duel': 0.15,
        'Indice_Aerial_duel': 0.13,
        'Indice_Covering_Interception': 0.12,
        'Indice_Type_pass': 0.10,
        'Indice_Acc_type_pass': 0.08,
        'Indice_Recoveries': 0.07,
        'Indice_Pressing': 0.06,
        'Indice_Acc_pass': 0.05,
        'Indice_Pass': 0.04,
    },

    'Latéraux': {
        'Indice_Tackle_Block': 0.20,
        'Indice_Type_pass': 0.15,
        'Indice_Acc_type_pass': 0.13,
        'Indice_Creation': 0.12,
        'Indice_Dribble': 0.10,
        'Indice_Progres_run': 0.08,
        'Indice_Move_Offensive': 0.07,
        'Indice_Pressing': 0.06,
        'Indice_Acc_pass': 0.05,
        'Indice_Pass': 0.04,
    },

    'Milieux defensifs': {
        'Indice_Duel': 0.20,
        'Indice_Covering_Interception': 0.15,
        'Indice_Tackle_Block': 0.13,
        'Indice_Type_pass': 0.12,
        'Indice_Acc_type_pass': 0.10,
        'Indice_Recoveries': 0.08,
        'Indice_Lost_balls': 0.07,
        'Indice_Pressing': 0.06,
        'Indice_Acc_pass': 0.05,
        'Indice_Pass': 0.04,
    },

    'Milieux centraux': {
        'Indice_Received_ball': 0.20,
        'Indice_Acc_type_pass': 0.15,
        'Indice_Type_pass': 0.13,
        'Indice_Creation': 0.12,
        'Indice_Dribble': 0.10,
        'Indice_Progres_run': 0.08,
        'Indice_Pressing': 0.07,
        'Indice_Recoveries': 0.06,
        'Indice_Acc_pass': 0.05,
        'Indice_Pass': 0.04,
    },

    'Milieux offensifs': {
        'Indice_Creation': 0.20,
        'Indice_Acc_Offensive': 0.15,
        'Indice_Volume_Offensive': 0.13,
        'Indice_Move_Offensive': 0.12,
        'Indice_Type_pass': 0.10,
        'Indice_Acc_type_pass': 0.08,
        'Indice_Received_ball': 0.07,
        'Indice_Progres_run': 0.06,
        'Indice_Acc_pass': 0.05,
        'Indice_Pass': 0.04,
    },

    'Ailiers': {
        'Indice_Creation': 0.20,
        'Indice_Volume_Offensive': 0.15,
        'Indice_Acc_Offensive': 0.13,
        'Indice_Progres_run': 0.12,
        'Indice_Dribble': 0.10,
        'Indice_Move_Offensive': 0.08,
        'Indice_Received_ball': 0.07,
        'Indice_Pressing': 0.06,
        'Indice_Acc_pass': 0.05,
        'Indice_Pass': 0.04,
    },

    'Avant-centre': {
        'Indice_Acc_Offensive': 0.20,
        'Indice_Volume_Offensive': 0.15,
        'Indice_Received_ball': 0.13,
        'Indice_Move_Offensive': 0.12,
        'Indice_Aerial_duel': 0.10,
        'Indice_Duel': 0.08,
        'Indice_Creation': 0.07,
        'Indice_Pressing': 0.06,
        'Indice_Acc_pass': 0.05,
        'Indice_Pass': 0.04,
    },

    // Fallback pour les joueurs dont le poste n'est pas mappé
    'field_player': {
        'Indice_Volume_Offensive': 0.15,
        'Indice_Acc_Offensive': 0.15,
        'Indice_Creation': 0.15,
        'Indice_Dribble': 0.15,
        'Indice_Duel': 0.15,
        'Indice_Pressing': 0.10,
        'Indice_Acc_pass': 0.10,
        'Indice_Pass': 0.05,
    }
};
