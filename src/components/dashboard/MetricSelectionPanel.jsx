// src/components/ui/MetricSelectionPanel.js
import React, { useContext } from 'react';
import { Percent, Hash, Trash2, Info } from 'lucide-react';
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
                className={`flex items-center justify-center flex-1 px-4 py-3 text-[11px] font-black verge-label-mono rounded-[2px] transition-all ${isActive
                    ? 'text-black bg-[#3cffd0] shadow-[0_0_15px_rgba(60,255,208,0.3)]'
                    : 'bg-[#131313] text-[#949494] hover:bg-white/5 border border-white/5'
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
                <div className="flex items-center justify-between">
                    <div className="w-2 h-2 bg-[#3cffd0]" />
                    <button
                        onClick={onResetMetrics}
                        className="flex items-center gap-2 px-4 py-2 verge-label-mono text-[9px] font-black tracking-[0.2em] text-[#f43f5e] hover:bg-[#f43f5e]/10 border border-[#f43f5e]/30 rounded-[2px] transition-all"
                    >
                        <Trash2 size={12} />
                        RÉINITIALISER
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
                    <div className="space-y-4 pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between">
                            <label className="verge-label-mono text-[10px] text-[#949494] tracking-[0.2em] font-black uppercase">
                                Type de données
                            </label>
                            <div className="group relative">
                                <Info size={14} className="text-[#949494] hover:text-[#3cffd0] cursor-help transition-colors" />
                                <div className="absolute right-0 bottom-full mb-3 w-72 p-6 bg-[#131313] border border-[#3cffd0]/30 rounded-[2px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                    <div className="space-y-3">
                                        <p className="verge-label-mono text-[9px] text-[#3cffd0] font-black tracking-[0.2em] uppercase">Guide Analytique</p>
                                        <p className="text-[11px] leading-relaxed text-[#949494]">
                                            <strong className="text-white">PERCENTILES :</strong> Compare les joueurs dynamiquement au sein de votre population filtrée actuelle.
                                        </p>
                                        <p className="text-[11px] leading-relaxed text-[#949494]">
                                            <strong className="text-white">VALEURS BRUTES :</strong> Affiche les statistiques réelles (par 90 min) sans aucune transformation.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-1 bg-[#131313] border border-white/5 rounded-[2px]">
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
