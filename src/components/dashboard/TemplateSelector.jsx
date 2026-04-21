import React, { useMemo, useState } from 'react';
import { Check, LayoutTemplate, Plus, Trash2, Save } from 'lucide-react';
import { SearchableMultiSelect } from './SearchableMultiSelect';

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

/**
 * Modèles Tactiques basés sur le dictionnaire Data Science.
 * Remplace la détection automatique des indices par les sous-variables.
 */
export const TemplateSelector = ({
    onTemplateToggle,
    selectedTemplateLabels,
    cat,
    // Custom Templates props
    customTemplates = [],
    saveCustomTemplate,
    deleteCustomTemplate,
    applyCustomTemplate
}) => {
    const [newTemplateName, setNewTemplateName] = useState('');

    const templateOptions = useMemo(() => {
        return Object.keys(TEMPLATE_MAPPING).map(key => ({
            value: key,
            label: `${key} (${TEMPLATE_MAPPING[key].length} vars)`
        }));
    }, []);

    const handleSave = () => {
        if (newTemplateName.trim()) {
            saveCustomTemplate && saveCustomTemplate(newTemplateName.trim());
            setNewTemplateName('');
        }
    };

    const selectedTemplateArray = Array.from(selectedTemplateLabels);

    const handleTemplateSelectToggle = (templateKey) => {
        onTemplateToggle(templateKey, TEMPLATE_MAPPING[templateKey]);
    };

    if (cat !== 'joueurs') {
        return <p className="text-xs text-slate-500 italic">Les modèles sont disponibles uniquement pour l'analyse des joueurs.</p>;
    }

    return (
        <div className="space-y-4">
            {/* Tactical Models */}
            <div>
                <SearchableMultiSelect
                    label="Modèles Tactiques (DS)"
                    placeholder="Sélectionner des modèles..."
                    options={templateOptions}
                    selectedValues={selectedTemplateArray}
                    onToggle={handleTemplateSelectToggle}
                />
            </div>

            {/* Custom Templates */}
            {saveCustomTemplate && (
                <div className="pt-4 border-t border-slate-200 dark:border-white/5">
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                        <span className="flex items-center gap-2">
                            <Save size={14} />
                            Templates Perso
                        </span>
                    </label>

                    {customTemplates.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {customTemplates.map(template => (
                                <div
                                    key={template.id}
                                    className="group flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => applyCustomTemplate(template)}
                                >
                                    <span>{template.name}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteCustomTemplate(template.id);
                                        }}
                                        className="p-1 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-500/30 text-emerald-500 dark:text-emerald-400/80 hover:text-red-500 transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            placeholder="Nom..."
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        />
                        <button
                            onClick={handleSave}
                            disabled={!newTemplateName.trim()}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};