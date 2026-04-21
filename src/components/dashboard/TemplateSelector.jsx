import React, { useMemo, useState } from 'react';
import { Check, LayoutTemplate, Plus, Trash2, Save } from 'lucide-react';

const TEMPLATE_MAPPING = {
  "Volume Offensif": ["xg_shot_avg_norm", "offensive_duels_avg_norm", "shots_avg_norm", "head_shots_avg_norm", "penalties_taken_norm"],
  "Efficacité": ["decisive_goal_avg_norm", "non_penalty_goal_avg_norm", "goals_avg_norm", "goal_conversion_percent_norm", "successful_attacking_actions_avg_norm"],
  "Création": ["assists_avg_norm", "deep_completed_cross_avg_norm", "xg_assist_avg_norm", "key_passes_avg_norm", "shot_assists_avg_norm"],
  "Distribution": ["pass_to_penalty_area_avg_norm", "passes_to_final_third_avg_norm", "progressive_pass_avg_norm", "vertical_passes_avg_norm"],
  "Défensif": ["possession_adjusted_interceptions_norm", "interceptions_avg_norm", "defensive_duels_won_norm"]
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

    const templates = useMemo(() => {
        return Object.keys(TEMPLATE_MAPPING).map(key => ({
            key: key,
            label: key,
            metrics: TEMPLATE_MAPPING[key]
        }));
    }, []);

    const handleSave = () => {
        if (newTemplateName.trim()) {
            saveCustomTemplate && saveCustomTemplate(newTemplateName.trim());
            setNewTemplateName('');
        }
    };

    if (cat !== 'joueurs') {
        return <p className="text-xs text-slate-500 italic">Les modèles sont disponibles uniquement pour l'analyse des joueurs.</p>;
    }

    return (
        <div className="space-y-4">
            {/* Tactical Models */}
            <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    <LayoutTemplate size={14} />
                    Modèles Tactiques (DS)
                </label>
                <div className="grid grid-cols-1 gap-2">
                    {templates.map(template => {
                        const isSelected = selectedTemplateLabels.has(template.key);
                        return (
                            <button
                                key={template.key}
                                onClick={() => onTemplateToggle(template.key, template.metrics)}
                                className={`
                                    group flex items-center justify-between px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 border
                                    ${isSelected
                                        ? 'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/50 text-sky-600 dark:text-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.15)]'
                                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`flex items-center justify-center w-4 h-4 rounded-full transition-all ${isSelected ? 'bg-sky-500 text-white dark:text-slate-900' : 'bg-slate-300 dark:bg-slate-700 text-transparent group-hover:bg-slate-400 dark:group-hover:bg-slate-600'}`}>
                                        <Check size={12} strokeWidth={4} />
                                    </span>
                                    {template.label}
                                </div>
                                <span className="text-[10px] opacity-40 font-normal">{template.metrics.length} vars</span>
                            </button>
                        );
                    })}
                </div>
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