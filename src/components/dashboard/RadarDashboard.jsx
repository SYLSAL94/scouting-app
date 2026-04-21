import React, { useState } from 'react';
import { Target } from 'lucide-react';
import { RadarChartVisualization } from './RadarChartVisualization';
import { MetricSelectionPanel } from './MetricSelectionPanel';
import { PlayerSearchTile } from './PlayerSearchTile';
import { useMetricSelection } from '../../hooks/useMetricSelection';

const Step = ({ number, title, children }) => (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <h3 className="flex items-center text-sm font-semibold mb-3 text-white">
            <span className="flex items-center justify-center w-6 h-6 mr-3 text-xs font-bold rounded-full bg-sky-500 text-white">
                {number}
            </span>
            {title}
        </h3>
        <div className="space-y-4">{children}</div>
    </div>
);

export const RadarDashboard = ({ 
    players = [], 
    metricsList = [], 
    activeFilters = {},
    initialSelectedPlayer = null 
}) => {
    // 1. Entities State
    const [selectedEntities, setSelectedEntities] = useState(initialSelectedPlayer ? [initialSelectedPlayer] : []);
    const [compareWithMedian, setCompareWithMedian] = useState(false);

    // 2. Metrics State (Shared via hook)
    const {
        selectedMetrics,
        setSelectedMetrics,
        selectedTemplateLabels,
        setSelectedTemplateLabels,
        metricDisplayMode,
        setMetricDisplayMode,
        customTemplates,
        handleMetricToggle,
        handleTemplateToggle,
        handleResetMetrics,
        saveCustomTemplate,
        deleteCustomTemplate,
        applyCustomTemplate,
        activeMetrics
    } = useMetricSelection();

    const selectedEntityIds = selectedEntities.map(p => p.id || p.unique_id);
    const canGenerate = selectedEntityIds.length > 0 && activeMetrics.length >= 3;

    const [appliedConfig, setAppliedConfig] = React.useState(null);

    React.useEffect(() => {
        setAppliedConfig(null);
    }, [activeFilters, metricDisplayMode]);

    const handlePlayerSelect = (player) => {
        if (!selectedEntities.find(p => (p.id || p.unique_id) === (player.id || player.unique_id))) {
            if (selectedEntities.length < 3) {
                setSelectedEntities([...selectedEntities, player]);
                setAppliedConfig(null);
            }
        }
    };

    const handlePlayerRemove = (idToRemove) => {
        const next = selectedEntities.filter(p => (p.id || p.unique_id) !== idToRemove);
        setSelectedEntities(next);
        if (next.length <= 2) {
            setCompareWithMedian(false);
        }
        setAppliedConfig(null);
    };

    const onMetricChangeWrapper = (fn) => (...args) => {
        fn(...args);
        setAppliedConfig(null);
    };

    const handleGenerate = () => {
        setAppliedConfig({
            entityIds: selectedEntityIds,
            metrics: activeMetrics,
            compareWithMedian,
            activeFilters
        });
    };

    return (
        <div className="flex flex-col lg:flex-row h-full min-h-[800px] gap-6">
            {/* LEFT PANEL: Control Panel */}
            <div className="w-full lg:w-[450px] flex flex-col h-full bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden flex-shrink-0">
                <div className="p-5 flex-shrink-0 border-b border-white/10 bg-slate-900/80">
                    <div className="flex items-center">
                        <div className="mr-4 p-2.5 rounded-xl bg-sky-500/20">
                            <Target size={24} className="text-sky-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Créateur de Radar</h2>
                            <p className="text-sm text-sky-400/80 font-medium">Zéro-Calcul Cloud Node</p>
                        </div>
                    </div>
                </div>

                <div className="flex-grow p-5 overflow-y-auto styled-scrollbar space-y-5">
                    {/* Étape 1 : Entités */}
                    <Step number="1" title="Sélection des Entités (max: 3)">
                        <div className="space-y-3">
                            <PlayerSearchTile 
                                players={players} 
                                onSelectPlayer={handlePlayerSelect} 
                                activeFilters={activeFilters}
                            />
                            
                            {selectedEntities.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    {selectedEntities.map((p, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/10">
                                            <div className="text-sm font-medium text-white">{p.name || p.full_name}</div>
                                            <button onClick={() => handlePlayerRemove(p.id || p.unique_id)} className="text-rose-400 hover:text-rose-300 text-xs font-bold">X</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <label className={`flex items-center space-x-2.5 text-sm transition-opacity mt-4 ${selectedEntities.length !== 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-500 text-sky-500 bg-slate-800"
                                    checked={compareWithMedian}
                                    onChange={(e) => {
                                        setCompareWithMedian(e.target.checked);
                                        setAppliedConfig(null);
                                    }}
                                    disabled={selectedEntities.length !== 1}
                                />
                                <span className="text-slate-300">Comparer au profil médian</span>
                            </label>
                        </div>
                    </Step>

                    {/* Étape 2 : Métriques */}
                    <Step number="2" title="Sélection des Métriques">
                        <MetricSelectionPanel
                            cat="joueurs"
                            selectedTemplateLabels={selectedTemplateLabels}
                            onTemplateToggle={onMetricChangeWrapper(handleTemplateToggle)}
                            metricDisplayMode={metricDisplayMode}
                            onMetricModeChange={setMetricDisplayMode}
                            metricOptions={metricsList}
                            selectedMetrics={selectedMetrics}
                            onMetricToggle={onMetricChangeWrapper(handleMetricToggle)}
                            MIN_METRICS={3}
                            customTemplates={customTemplates}
                            saveCustomTemplate={saveCustomTemplate}
                            deleteCustomTemplate={deleteCustomTemplate}
                            applyCustomTemplate={(m) => { setSelectedMetrics(m); setSelectedTemplateLabels(new Set()); setAppliedConfig(null); }}
                            onResetMetrics={() => { setSelectedMetrics([]); setSelectedTemplateLabels(new Set()); setAppliedConfig(null); }}
                        />
                    </Step>
                    
                    {/* Étape 3 : Bouton Générer */}
                    <div className="pt-4 mt-4 border-t border-white/10">
                        <button
                            onClick={handleGenerate}
                            disabled={!canGenerate || appliedConfig !== null}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all duration-300 ${
                                canGenerate && appliedConfig === null
                                    ? 'bg-sky-500 hover:bg-sky-400 text-slate-900 shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:shadow-[0_0_30px_rgba(14,165,233,0.6)] transform hover:-translate-y-1'
                                    : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                            }`}
                        >
                            {appliedConfig !== null ? 'Radar à jour' : 'Générer le Radar'}
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: Visualization */}
            <div className="flex-1 glass-panel flex flex-col p-6 min-h-[600px]">
                 {appliedConfig ? (
                     <RadarChartVisualization
                        selectedEntityIds={appliedConfig.entityIds}
                        metrics={appliedConfig.metrics}
                        compareWithMedian={appliedConfig.compareWithMedian}
                        activeFilters={appliedConfig.activeFilters}
                        metricDisplayMode={metricDisplayMode}
                        entityColors={[{stroke: '#38bdf8', fill: '#38bdf8'}, {stroke: '#f59e0b', fill: '#f59e0b'}, {stroke: '#10b981', fill: '#10b981'}]}
                     />
                 ) : (
                     <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/10 rounded-3xl m-4">
                        <Target className="text-slate-700 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-slate-400 mb-2">Prêt à visualiser</h3>
                        <p className="text-slate-500 max-w-sm">
                            Sélectionnez au moins une entité (max: 3) et trois métriques tactiques dans le panneau de gauche, puis cliquez sur "Générer le Radar".
                        </p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default RadarDashboard;
