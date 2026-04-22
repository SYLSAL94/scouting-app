// src/components/ui/MetricSelectionPanel.js
import React, { useContext } from 'react';
import { Percent, Hash, Trash2 } from 'lucide-react';
import { TemplateSelector } from './TemplateSelector';
import { SearchableMultiSelect } from './SearchableMultiSelect';

// Contexte de thème simplifié pour la cohérence stylistique
const ThemeContext = React.createContext({ theme: 'dark' });
const useTheme = () => useContext(ThemeContext);

/**
 * Composant réutilisable regroupant la sélection de métriques pour le radar.
 */
export const MetricSelectionPanel = ({
    cat,
    selectedTemplateLabels,
    onTemplateToggle,
    metricDisplayMode,
    onMetricModeChange,
    metricOptions,
    selectedMetrics,
    onMetricToggle,
    MIN_METRICS,
    customTemplates,
    saveCustomTemplate,
    deleteCustomTemplate,
    applyCustomTemplate,
    onResetMetrics,
    selectedPlayersToCompare = [],
    hideModeSelector = false
}) => {
    const { theme } = useTheme();

    const renderModeButton = (mode, label, Icon) => {
        const isActive = metricDisplayMode === mode;
        return (
            <button
                onClick={() => onMetricModeChange(mode)}
                className={`flex items-center justify-center flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${isActive
                    ? 'text-white bg-gradient-to-r from-sky-600 to-cyan-600 shadow-lg shadow-sky-900/20'
                    : 'bg-white dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 shadow-sm dark:shadow-none'
                    }`}
            >
                <Icon size={14} className="mr-2" />
                {label}
            </button>
        );
    };

    return (
        <ThemeContext.Provider value={{ theme }}>
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-[-1rem]">
                    <div />
                    <button
                        onClick={onResetMetrics}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-800/50 rounded-md transition-all hover:shadow-sm"
                    >
                        <Trash2 size={12} />
                        Réinitialiser
                    </button>
                </div>

                <TemplateSelector
                    cat={cat}
                    selectedTemplateLabels={selectedTemplateLabels}
                    onTemplateToggle={onTemplateToggle}
                    customTemplates={customTemplates}
                    saveCustomTemplate={saveCustomTemplate}
                    deleteCustomTemplate={deleteCustomTemplate}
                    applyCustomTemplate={applyCustomTemplate}
                    selectedPlayersToCompare={selectedPlayersToCompare} 
                />

                {!hideModeSelector && (
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Type de données
                        </label>
                        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5">
                            {renderModeButton('percentile', 'Percentiles', Percent)}
                            {renderModeButton('standard', 'Valeurs Brutes', Hash)}
                        </div>
                    </div>
                )}

                <SearchableMultiSelect
                    label={`Sélection Manuelle (min: ${MIN_METRICS})`}
                    placeholder="Rechercher une métrique..."
                    options={metricOptions}
                    selectedValues={selectedMetrics}
                    onToggle={onMetricToggle}
                />
            </div>
        </ThemeContext.Provider>
    );
}
