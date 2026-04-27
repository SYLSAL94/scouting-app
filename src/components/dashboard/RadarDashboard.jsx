import React, { useState } from 'react';
import { Target } from 'lucide-react';
import { RadarChartVisualization } from './RadarChartVisualization';
import { MetricSelectionPanel } from './MetricSelectionPanel';
import { PlayerSearchTile } from './PlayerSearchTile';
import { useMetricSelection } from '../../hooks/useMetricSelection';

const Step = ({ number, title, children }) => (
    <div className="p-6 rounded-[4px] bg-surface-slate/50 border border-hazard-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-jelly-mint/10" />
        <h3 className="flex items-center verge-label-mono text-[10px] font-black mb-6 text-hazard-white uppercase tracking-widest group-hover:text-jelly-mint transition-colors">
            <span className="flex items-center justify-center w-6 h-6 mr-4 text-[9px] font-black rounded-[2px] bg-jelly-mint text-absolute-black">
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
    const [activeTab, setActiveTab] = useState('CHART'); // 'CHART', 'ENTITIES', 'METRICS'

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
            entities: selectedEntities.map(p => ({
                id: p.id || p.unique_id,
                season: p.season,
                competition: p.competition
            })),
            metrics: activeMetrics,
            compareWithMedian,
            activeFilters,
            displayMode: metricDisplayMode
        });
        if (window.innerWidth < 1280) {
            setActiveTab('CHART');
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full min-h-0 xl:min-h-[800px] bg-canvas-black">
            {/* Mobile Tab Bar */}
            <div className="flex xl:hidden bg-surface-slate p-1 rounded-[4px] border border-hazard-white/5 mb-2 gap-1">
                <button 
                    onClick={() => setActiveTab('CHART')}
                    className={`flex-1 py-3 rounded-[2px] verge-label-mono text-[8px] font-black uppercase transition-all duration-300 ${activeTab === 'CHART' ? 'bg-jelly-mint text-absolute-black shadow-[0_0_15px_rgba(60,255,208,0.3)]' : 'text-secondary-text'}`}
                >
                    Visionnage
                </button>
                <button 
                    onClick={() => setActiveTab('ENTITIES')}
                    className={`flex-1 py-3 rounded-[2px] verge-label-mono text-[8px] font-black uppercase transition-all duration-300 ${activeTab === 'ENTITIES' ? 'bg-jelly-mint text-absolute-black shadow-[0_0_15px_rgba(60,255,208,0.3)]' : 'text-secondary-text'}`}
                >
                    Entités
                </button>
                <button 
                    onClick={() => setActiveTab('METRICS')}
                    className={`flex-1 py-3 rounded-[2px] verge-label-mono text-[8px] font-black uppercase transition-all duration-300 ${activeTab === 'METRICS' ? 'bg-jelly-mint text-absolute-black shadow-[0_0_15px_rgba(60,255,208,0.3)]' : 'text-secondary-text'}`}
                >
                    Métriques
                </button>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 h-auto xl:h-full min-h-screen xl:min-h-0">
                {/* LEFT PANEL: Control Panel */}
                <div className={`w-full xl:w-[480px] flex flex-col h-auto xl:h-full bg-canvas-black rounded-[4px] border border-hazard-white/10 overflow-hidden flex-shrink-0 ${activeTab !== 'CHART' ? 'flex' : 'hidden xl:flex'}`}>
                    <div className="p-6 md:p-8 flex-shrink-0 border-b border-hazard-white/10 bg-canvas-black">
                        <div className="flex items-center">
                            <div className="mr-4 md:mr-6 p-3 md:p-4 rounded-[4px] bg-jelly-mint/10 border border-jelly-mint/20">
                                <Target size={24} className="text-jelly-mint" />
                            </div>
                            <div>
                                <h2 className="verge-h3 text-hazard-white text-xl md:text-3xl">Radar <span className="text-jelly-mint">Studio</span></h2>
                                <p className="verge-label-mono text-[8px] md:text-[9px] text-secondary-text mt-1 md:mt-2 uppercase tracking-widest">Normalisation Active</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-grow p-6 md:p-8 overflow-y-auto styled-scrollbar space-y-6">
                        {/* Step 1: Entities (Mobile tab or Desktop) */}
                        <div className={`${activeTab === 'ENTITIES' ? 'block' : 'hidden'} xl:block`}>
                            <Step number="1" title="SÉLECTION DES ENTITÉS">
                                <div className="space-y-4">
                                    <PlayerSearchTile 
                                        players={players} 
                                        onSelectPlayer={handlePlayerSelect} 
                                        activeFilters={activeFilters}
                                    />
                                    
                                    {selectedEntities.length > 0 && (
                                        <div className="space-y-2 mt-4">
                                            {selectedEntities.map((p, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-canvas-black p-3 rounded-[2px] border border-hazard-white/5">
                                                    <div className="verge-label-mono text-[9px] font-black text-hazard-white uppercase truncate mr-4">{p.name || p.full_name}</div>
                                                    <button onClick={() => handlePlayerRemove(p.id || p.unique_id)} className="text-[#f43f5e] verge-label-mono text-[8px] font-black">RETIRER</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <label className={`flex items-center space-x-3 mt-4 p-4 rounded-[2px] bg-canvas-black border border-hazard-white/5 ${selectedEntities.length !== 1 ? 'opacity-30' : 'cursor-pointer hover:border-jelly-mint/30'}`}>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded-[2px] border-hazard-white/10 text-jelly-mint bg-absolute-black accent-[#3cffd0]"
                                            checked={compareWithMedian}
                                            onChange={(e) => {
                                                setCompareWithMedian(e.target.checked);
                                                setAppliedConfig(null);
                                            }}
                                            disabled={selectedEntities.length !== 1}
                                        />
                                        <span className="verge-label-mono text-[9px] text-secondary-text uppercase tracking-widest font-black leading-none">Comparer au profil médian</span>
                                    </label>
                                </div>
                            </Step>
                        </div>

                        {/* Step 2: Metrics (Mobile tab or Desktop) */}
                        <div className={`${activeTab === 'METRICS' ? 'block' : 'hidden'} xl:block`}>
                            <Step number="2" title="SÉLECTION DES MÉTRIQUES">
                                <MetricSelectionPanel
                                    cat="joueurs"
                                    selectedTemplateLabels={selectedTemplateLabels}
                                    onTemplateToggle={onMetricChangeWrapper(handleTemplateToggle)}
                                    metricDisplayMode={metricDisplayMode}
                                    onMetricModeChange={(mode) => { setMetricDisplayMode(mode); setAppliedConfig(null); }}
                                    metricOptions={metricsList}
                                    selectedMetrics={selectedMetrics}
                                    onMetricToggle={onMetricChangeWrapper(handleMetricToggle)}
                                    MIN_METRICS={3}
                                    customTemplates={customTemplates}
                                    saveCustomTemplate={saveCustomTemplate}
                                    deleteCustomTemplate={deleteCustomTemplate}
                                    applyCustomTemplate={(m) => { setSelectedMetrics(m); setSelectedTemplateLabels(new Set()); setAppliedConfig(null); }}
                                    onResetMetrics={() => { setSelectedMetrics([]); setSelectedTemplateLabels(new Set()); setAppliedConfig(null); }}
                                    selectedPlayersToCompare={selectedEntities}
                                />
                            </Step>
                        </div>
                        
                        {/* Generate Button (Shown if either config tab is active) */}
                        <div className="pt-4">
                            <button
                                onClick={handleGenerate}
                                disabled={!canGenerate || appliedConfig !== null}
                                className={`w-full py-5 rounded-[4px] verge-label-mono text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                                    canGenerate && appliedConfig === null
                                        ? 'bg-jelly-mint text-absolute-black shadow-[0_0_40px_rgba(60,255,208,0.2)]'
                                        : 'bg-hazard-white/5 text-secondary-text border border-hazard-white/5'
                                }`}
                            >
                                {appliedConfig !== null ? 'Radar à jour' : 'Générer'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: Visualization */}
                <div className={`flex-grow xl:flex-1 bg-canvas-black border border-hazard-white/10 rounded-[4px] flex flex-col p-4 md:p-10 min-h-[500px] md:min-h-[700px] min-w-0 relative overflow-hidden ${activeTab === 'CHART' ? 'flex' : 'hidden xl:flex'}`}>
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3cffd0 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                    
                    {appliedConfig ? (
                        <RadarChartVisualization
                            key={activeTab}
                            selectedEntities={appliedConfig.entities}
                            metrics={appliedConfig.metrics}
                            compareWithMedian={appliedConfig.compareWithMedian}
                            activeFilters={appliedConfig.activeFilters}
                            metricDisplayMode={appliedConfig.displayMode}
                            entityColors={[{stroke: '#3cffd0', fill: '#3cffd0'}, {stroke: '#3860be', fill: '#3860be'}, {stroke: '#f43f5e', fill: '#f43f5e'}]}
                            onPlayerSelect={undefined} 
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 md:p-12 border border-dashed border-hazard-white/10 rounded-[4px] m-4 relative z-10">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-hazard-white/5 rounded-full flex items-center justify-center mb-6 md:mb-10 border border-hazard-white/5">
                                <Target className="text-jelly-mint/40" size={32} md:size={40} />
                            </div>
                            <h3 className="verge-h2 text-hazard-white mb-4 md:mb-6 uppercase tracking-tighter text-xl md:text-4xl">PRÊT POUR L'ANALYSE</h3>
                            <p className="verge-label-mono text-secondary-text text-[9px] md:text-[10px] max-w-sm uppercase tracking-widest leading-relaxed">
                                Configurez vos cibles et vos métriques tactiques pour générer le radar.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RadarDashboard;
