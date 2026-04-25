import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, LayoutGrid, X } from 'lucide-react';

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
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTemplateClick = (templateKey) => {
        onTemplateToggle(templateKey, TEMPLATE_MAPPING[templateKey]);
    };

    if (cat !== 'joueurs') {
        return <p className="text-xs text-slate-500 italic">Les modèles sont disponibles uniquement pour l'analyse des joueurs.</p>;
    }

    return (
        <div className="space-y-4 relative" ref={containerRef}>
            <label className="verge-label-mono text-[10px] font-black uppercase text-white/40 tracking-[0.2em] mb-4 block group-hover:text-white transition-colors">
                Modèles Tactiques (DS)
            </label>
            
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full min-h-[50px] p-4 bg-[#131313] border rounded-[2px] flex items-center justify-between transition-all duration-300 ${
                    isOpen ? 'border-[#3cffd0] shadow-[0_0_25px_rgba(60,255,208,0.1)]' : 'border-white/5 hover:border-white/20'
                }`}
            >
                <div className="flex items-center gap-4 overflow-hidden">
                    <div className={`p-1.5 rounded-[2px] ${selectedTemplateLabels.size > 0 ? 'bg-[#3cffd0] text-black' : 'bg-white/5 text-white/20'}`}>
                        <LayoutGrid size={14} />
                    </div>
                    <div className="flex flex-col items-start overflow-hidden">
                        <span className="verge-label-mono text-[10px] font-black text-white uppercase tracking-widest truncate w-full">
                            {selectedTemplateLabels.size === 0 
                                ? "Choisir un profil..." 
                                : Array.from(selectedTemplateLabels).join(', ')}
                        </span>
                        {selectedTemplateLabels.size > 0 && (
                            <span className="verge-label-mono text-[8px] text-[#3cffd0] font-black uppercase tracking-widest mt-1">
                                {selectedTemplateLabels.size} ARCHÉTYPE(S) ACTIF(S)
                            </span>
                        )}
                    </div>
                </div>
                <ChevronDown size={16} className={`text-[#949494] transition-all duration-500 ${isOpen ? 'rotate-180 text-[#3cffd0]' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 z-[100] bg-[#131313]/95 backdrop-blur-xl border border-white/10 rounded-[2px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="max-h-[350px] overflow-y-auto py-3 styled-scrollbar">
                        {Object.keys(TEMPLATE_MAPPING).map((key, index) => {
                            const isActive = selectedTemplateLabels.has(key);
                            return (
                                <div 
                                    key={key}
                                    onClick={() => handleTemplateClick(key)}
                                    className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-all verge-label-mono text-[10px] uppercase tracking-wider ${
                                        isActive 
                                        ? 'bg-[#3cffd0] text-black font-black' 
                                        : 'text-[#949494] hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-black' : 'border-white/5'}`}>
                                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                                        </div>
                                        <span>{key}</span>
                                    </div>
                                    {isActive && <Check size={14} className="text-black" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};