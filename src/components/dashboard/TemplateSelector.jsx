import React from 'react';

const TEMPLATE_MAPPING = {
  "Volume Offensif": ["xg_shot_avg_norm", "offensive_duels_avg_norm", "shots_avg_norm", "head_shots_avg_norm", "penalties_taken_norm"],
  "Efficacité Offensive": ["decisive_goal_avg_norm", "non_penalty_goal_avg_norm", "goals_avg_norm", "goal_conversion_percent_norm", "successful_attacking_actions_avg_norm", "offensive_duels_won_norm", "first_goal_avg_norm", "head_goals_avg_norm", "shots_on_target_percent_norm", "penalties_conversion_percent_norm"],
  "Mouvement Offensif": ["cutback_avg_norm", "touch_in_box_avg_norm", "off_the_balls_avg_norm", "linkup_plays_avg_norm"],
  "Dribble": ["dribbles_avg_norm", "successful_dribbles_percent_norm", "dribbles_with_progress_avg_norm", "foul_suffered_avg_norm"],
  "Course de Progression": ["ball_entry_in_final_third_avg_norm", "accelerations_avg_norm", "progressive_run_avg_norm", "run_avg_norm", "inside_run_avg_norm"],
  "Ballon Reçu": ["received_dangerous_pass_avg_norm", "received_pass_in_final_third_avg_norm", "received_long_pass_avg_norm", "received_pass_avg_norm"],
  "Passe": ["pass_to_penalty_area_avg_norm", "passes_to_final_third_avg_norm", "pass_to_zone_fourteen_avg_norm", "progressive_pass_avg_norm", "passes_avg_norm", "buildup_pass_avg_norm"],
  "Précision de Passe": ["accurate_pass_to_penalty_area_percent_norm", "accurate_passes_to_final_third_percent_norm", "successful_progressive_pass_percent_norm", "successful_forward_passes_percent_norm", "accurate_passes_percent_norm"],
  "Création": ["assists_avg_norm", "deep_completed_cross_avg_norm", "deep_completed_pass_avg_norm", "xg_assist_avg_norm", "smart_passes_avg_norm", "accurate_smart_passes_percent_norm", "pre_assist_avg_norm", "key_passes_avg_norm", "shot_assists_avg_norm", "pre_pre_assist_avg_norm", "cross_to_goalie_box_avg_norm"],
  "Précision Type Passe": ["successful_vertical_passes_percent_norm", "successful_through_passes_percent_norm", "accurate_crosses_percent_norm", "successful_long_passes_percent_norm", "accurate_short_medium_pass_percent_norm"],
  "Type de Passe": ["vertical_passes_avg_norm", "through_passes_avg_norm", "diagonal_to_flank_avg_norm", "crosses_avg_norm", "long_passes_avg_norm", "short_medium_pass_avg_norm", "average_pass_length_norm", "average_long_pass_length_norm", "corners_taken_avg_norm", "free_kicks_taken_avg_norm"],
  "Coups de Pied Arrêtés": ["direct_free_kicks_on_target_percent_norm", "direct_free_kicks_taken_avg_norm", "free_kicks_taken_avg_norm"],
  "Duel": ["duels_won_norm", "loose_ball_duels_avg_norm", "duels_avg_norm"],
  "Duel Aérien": ["aerial_duels_won_norm", "aerial_duels_avg_norm"],
  "Tacle & Bloc": ["defensive_duel_regain_avg_norm", "possession_adjusted_tackle_norm", "successful_defensive_actions_avg_norm", "successful_tackle_percent_norm", "defensive_duels_won_norm", "defensive_duels_avg_norm", "tackle_avg_norm", "shot_block_avg_norm"],
  "Couverture & Interception": ["possession_adjusted_interceptions_norm", "interceptions_avg_norm", "covering_depth_avg_norm"],
  "Récupérations": ["dangerous_opponent_half_recoveries_avg_norm", "opponent_half_recoveries_avg_norm", "recoveries_avg_norm"],
  "Pressing": ["recovery_counterpressing_avg_norm", "pressing_duels_avg_norm", "counterattack_interception_avg_norm"],
  "Balles Perdues": ["dangerous_own_half_losses_avg_norm", "own_half_losses_avg_norm", "lost_balls_to_saa_percent_norm", "losses_avg_norm", "missed_balls_avg_norm", "ball_losses_avg_norm"],
  "Discipline": ["red_cards_avg_norm", "dangerous_foul_avg_norm", "yellow_cards_avg_norm", "fouls_avg_norm"],
  "Arrêt (Gardien)": ["save_percent_norm", "conceded_goals_avg_norm", "save_avg_norm", "shots_against_avg_norm"],
  "Sortie de But (Gardien)": ["gk_aerial_duels_avg_norm", "goalkeeper_exits_avg_norm"],
  "xG Subit Différentiel (Gardien)": ["prevented_goals_avg_norm", "xg_save_avg_norm", "clean_sheets_norm", "save_with_reflex_percent_norm", "easy_conceded_goal_avg_norm"]
};

export const TemplateSelector = ({
    onTemplateToggle,
    selectedTemplateLabels,
    cat,
}) => {
    const handleTemplateClick = (templateKey) => {
        onTemplateToggle(templateKey, TEMPLATE_MAPPING[templateKey]);
    };

    if (cat !== 'joueurs') {
        return <p className="text-xs text-slate-500 italic">Les modèles sont disponibles uniquement pour l'analyse des joueurs.</p>;
    }

    return (
        <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block">
                Modèles Tactiques (DS)
            </label>
            <div className="flex flex-wrap gap-2">
                {Object.keys(TEMPLATE_MAPPING).map(key => {
                    const isActive = selectedTemplateLabels.has(key);
                    return (
                        <button
                            key={key}
                            onClick={() => handleTemplateClick(key)}
                            className={`px-3 py-2 text-[10px] font-black uppercase tracking-tighter rounded-xl border transition-all duration-300 ${
                                isActive 
                                ? 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/20 scale-105' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-sky-500/50 hover:bg-sky-500/5'
                            }`}
                        >
                            {key}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};