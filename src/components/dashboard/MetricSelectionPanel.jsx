// src/components/ui/MetricSelectionPanel.js
import React, { useState } from 'react';
import { Percent, Hash, Trash2, Info } from 'lucide-react';
import { TemplateSelector } from './TemplateSelector';
import { SearchableMultiSelect } from './SearchableMultiSelect';

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
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);

    const renderModeButton = (mode, label, Icon) => {
        const isActive = metricDisplayMode === mode;
        return (
            <button
                key={mode}
                onClick={() => onMetricModeChange(mode)}
                className={`flex items-center justify-center flex-1 px-4 py-3 text-[11px] font-black verge-label-mono rounded-[2px] transition-all ${isActive
                    ? 'text-absolute-black bg-jelly-mint shadow-[0_0_15px_rgba(60,255,208,0.3)]'
                    : 'bg-canvas-black text-secondary-text hover:bg-hazard-white/5 border border-hazard-white/5'
                    }`}
            >
                <Icon size={14} className="mr-2" />
                {label}
            </button>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="w-2 h-2 bg-jelly-mint" />
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
                <div className="space-y-4 pt-6 border-t border-hazard-white/5">
                    <div className="flex items-center justify-between">
                        <label className="verge-label-mono text-[10px] text-secondary-text tracking-[0.2em] font-black uppercase">
                            Type de données
                        </label>
                        <div className="relative">
                            <button
                                type="button"
                                className="p-1 cursor-help"
                                onMouseEnter={() => setIsTooltipOpen(true)}
                                onMouseLeave={() => setIsTooltipOpen(false)}
                            >
                                <Info size={14} className={`transition-colors ${isTooltipOpen ? 'text-jelly-mint' : 'text-secondary-text'}`} />
                            </button>
                            {isTooltipOpen && (
                                <div className="absolute right-0 bottom-full mb-3 w-72 p-6 bg-canvas-black border border-jelly-mint/30 rounded-[2px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 pointer-events-none animate-in fade-in duration-200">
                                    <div className="space-y-3">
                                        <p className="verge-label-mono text-[9px] text-jelly-mint font-black tracking-[0.2em] uppercase">Guide Analytique</p>
                                        <p className="text-[11px] leading-relaxed text-secondary-text">
                                            <strong className="text-hazard-white">PERCENTILES :</strong> Compare les joueurs dynamiquement au sein de votre population filtrée actuelle.
                                        </p>
                                        <p className="text-[11px] leading-relaxed text-secondary-text">
                                            <strong className="text-hazard-white">VALEURS BRUTES :</strong> Affiche les statistiques réelles (par 90 min) sans aucune transformation.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-1 bg-canvas-black border border-hazard-white/5 rounded-[2px]">
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
    );
};
