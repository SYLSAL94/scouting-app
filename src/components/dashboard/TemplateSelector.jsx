import React from 'react';

const TEMPLATE_MAPPING = {
  "Volume Offensif": ["xg_shot_avg_pct", "offensive_duels_avg_pct", "shots_avg_pct", "head_shots_avg_pct", "penalties_taken_pct"],
  "Efficacité Offensive": ["decisive_goal_avg_pct", "non_penalty_goal_avg_pct", "goals_avg_pct", "goal_conversion_percent_pct", "successful_attacking_actions_avg_pct", "offensive_duels_won_pct", "first_goal_avg_pct", "head_goals_avg_pct", "shots_on_target_percent_pct", "penalties_conversion_percent_pct"],
  "Mouvement Offensif": ["cutback_avg_pct", "touch_in_box_avg_pct", "off_the_balls_avg_pct", "linkup_plays_avg_pct"],
  "Dribble": ["dribbles_avg_pct", "successful_dribbles_percent_pct", "dribbles_with_progress_avg_pct", "foul_suffered_avg_pct"],
  "Course de Progression": ["ball_entry_in_final_third_avg_pct", "accelerations_avg_pct", "progressive_run_avg_pct", "run_avg_pct", "inside_run_avg_pct"],
  "Ballon Reçu": ["received_dangerous_pass_avg_pct", "received_pass_in_final_third_avg_pct", "received_long_pass_avg_pct", "received_pass_avg_pct"],
  "Passe": ["pass_to_penalty_area_avg_pct", "passes_to_final_third_avg_pct", "pass_to_zone_fourteen_avg_pct", "progressive_pass_avg_pct", "passes_avg_pct", "buildup_pass_avg_pct"],
  "Précision de Passe": ["accurate_pass_to_penalty_area_percent_pct", "accurate_passes_to_final_third_percent_pct", "successful_progressive_pass_percent_pct", "successful_forward_passes_percent_pct", "accurate_passes_percent_pct"],
  "Création": ["assists_avg_pct", "deep_completed_cross_avg_pct", "deep_completed_pass_avg_pct", "xg_assist_avg_pct", "smart_passes_avg_pct", "accurate_smart_passes_percent_pct", "pre_assist_avg_pct", "key_passes_avg_pct", "shot_assists_avg_pct", "pre_pre_assist_avg_pct", "cross_to_goalie_box_avg_pct"],
  "Précision Type Passe": ["successful_vertical_passes_percent_pct", "successful_through_passes_percent_pct", "accurate_crosses_percent_pct", "successful_long_passes_percent_pct", "accurate_short_medium_pass_percent_pct"],
  "Type de Passe": ["vertical_passes_avg_pct", "through_passes_avg_pct", "diagonal_to_flank_avg_pct", "crosses_avg_pct", "long_passes_avg_pct", "short_medium_pass_avg_pct", "average_pass_length_pct", "average_long_pass_length_pct", "corners_taken_avg_pct", "free_kicks_taken_avg_pct"],
  "Coups de Pied Arrêtés": ["direct_free_kicks_on_target_percent_pct", "direct_free_kicks_taken_avg_pct", "free_kicks_taken_avg_pct"],
  "Duel": ["duels_won_pct", "loose_ball_duels_avg_pct", "duels_avg_pct"],
  "Duel Aérien": ["aerial_duels_won_pct", "aerial_duels_avg_pct"],
  "Tacle & Bloc": ["defensive_duel_regain_avg_pct", "possession_adjusted_tackle_pct", "successful_defensive_actions_avg_pct", "successful_tackle_percent_pct", "defensive_duels_won_pct", "defensive_duels_avg_pct", "tackle_avg_pct", "shot_block_avg_pct"],
  "Couverture & Interception": ["possession_adjusted_interceptions_pct", "interceptions_avg_pct", "covering_depth_avg_pct"],
  "Récupérations": ["dangerous_opponent_half_recoveries_avg_pct", "opponent_half_recoveries_avg_pct", "recoveries_avg_pct"],
  "Pressing": ["recovery_counterpressing_avg_pct", "pressing_duels_avg_pct", "counterattack_interception_avg_pct"],
  "Balles Perdues": ["dangerous_own_half_losses_avg_pct", "own_half_losses_avg_pct", "lost_balls_to_saa_percent_pct", "losses_avg_pct", "missed_balls_avg_pct", "ball_losses_avg_pct"],
  "Discipline": ["red_cards_avg_pct", "dangerous_foul_avg_pct", "yellow_cards_avg_pct", "fouls_avg_pct"],
  "Arrêt (Gardien)": ["save_percent_pct", "conceded_goals_avg_pct", "save_avg_pct", "shots_against_avg_pct"],
  "Sortie de But (Gardien)": ["gk_aerial_duels_avg_pct", "goalkeeper_exits_avg_pct"],
  "xG Subit Différentiel (Gardien)": ["prevented_goals_avg_pct", "xg_save_avg_pct", "clean_sheets_pct", "save_with_reflex_percent_pct", "easy_conceded_goal_avg_pct"]
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
        <div className="space-y-6">
            <label className="verge-label-mono text-[10px] font-black uppercase text-[#949494] tracking-[0.2em] mb-4 block">
                Modèles Tactiques (DS)
            </label>
            <div className="flex flex-wrap gap-2">
                {Object.keys(TEMPLATE_MAPPING).map(key => {
                    const isActive = selectedTemplateLabels.has(key);
                    return (
                        <button
                            key={key}
                            onClick={() => handleTemplateClick(key)}
                            className={`px-3 py-2 text-[9px] font-black verge-label-mono uppercase tracking-tight rounded-[2px] border transition-all duration-200 ${
                                isActive 
                                ? 'bg-[#3cffd0] border-[#3cffd0] text-black shadow-[0_0_15px_rgba(60,255,208,0.3)] scale-105' 
                                : 'bg-[#131313] border-white/10 text-[#949494] hover:border-[#3cffd0]/50 hover:text-white'
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