import React, { useState } from 'react';
import { ArrowLeft, Activity, Shield, Zap, Target } from 'lucide-react';
import { VersusPlayerGrid } from './VersusPlayerGrid';
import { VersusComparison } from './VersusComparison';
import { MetricSelectionPanel } from './MetricSelectionPanel';
import { useMetricSelection } from '../../hooks/useMetricSelection';

const MAX_PLAYERS = 5;

export const VersusDashboard = ({ 
    metricsList, 
    selectedPlayersToCompare = [], 
    setSelectedPlayersToCompare,     
    onClose,
    activeFilters = {}
}) => {
    const {
        selectedMetrics,
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
        applyCustomTemplate
    } = useMetricSelection();

    const handleAddPlayer = (p) => {
        if (!p) return;
        setSelectedPlayersToCompare(prev => {
            const playerID = p.id || p.unique_id;
            const exists = prev.some(x => (x.id || x.unique_id) === playerID);
            if (exists) return prev;
            if (prev.length >= MAX_PLAYERS) return prev;
            return [...prev, p];
        });
    };

    const handleRemovePlayer = (id) => {
        if (!id) return;
        setSelectedPlayersToCompare(prev => prev.filter(p => (p.id || p.unique_id) !== id));
    };

    // État pour les onglets mobiles
    const [activeMobileTab, setActiveMobileTab] = React.useState('visionnage');

    return (
        <div className="p-4 md:p-8 max-w-[1700px] mx-auto min-h-screen flex flex-col bg-[#131313]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-12 gap-4 md:gap-6">
                <div className="flex flex-col w-full md:w-auto">
                    <button onClick={onClose} className="verge-label-mono text-[#3860be] hover:text-white flex items-center gap-2 mb-2 md:mb-4 group text-[9px] md:text-[11px]">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Intelligence Hub
                    </button>
                    <div className="flex justify-between items-center md:block">
                        <h1 className="verge-h2 md:verge-h1 text-white text-3xl md:text-6xl">Match-up <span className="text-[#3cffd0]">Simulator</span></h1>
                        <button 
                            onClick={() => setSelectedPlayersToCompare([])}
                            className="md:hidden p-2 border border-[#f43f5e]/30 text-[#f43f5e] rounded-[2px]"
                            title="Reset"
                        >
                            <ArrowLeft size={14} className="rotate-45" />
                        </button>
                    </div>
                </div>
                <button 
                    onClick={() => setSelectedPlayersToCompare([])}
                    className="hidden md:block px-8 py-3 border border-[#f43f5e]/30 text-[#f43f5e] hover:bg-[#f43f5e]/10 rounded-[4px] verge-label-mono text-[10px] font-black tracking-widest transition-all"
                >
                    RESET SÉLECTEUR
                </button>
            </div>

            {/* Tabs Mobile */}
            <div className="flex md:hidden bg-[#1a1a1a] p-1 rounded-[4px] border border-white/10 mb-6 gap-1">
                <button 
                    onClick={() => setActiveMobileTab('visionnage')}
                    className={`flex-1 py-3 verge-label-mono text-[8px] font-black transition-all rounded-[2px] ${activeMobileTab === 'visionnage' ? 'bg-[#3cffd0] text-black shadow-[0_0_15px_rgba(60,255,208,0.3)]' : 'text-[#949494]'}`}
                >
                    Visionnage
                </button>
                <button 
                    onClick={() => setActiveMobileTab('joueurs')}
                    className={`flex-1 py-3 verge-label-mono text-[8px] font-black transition-all rounded-[2px] ${activeMobileTab === 'joueurs' ? 'bg-[#3cffd0] text-black shadow-[0_0_15px_rgba(60,255,208,0.3)]' : 'text-[#949494]'}`}
                >
                    Choix Joueurs
                </button>
                <button 
                    onClick={() => setActiveMobileTab('modeles')}
                    className={`flex-1 py-3 verge-label-mono text-[8px] font-black transition-all rounded-[2px] ${activeMobileTab === 'modeles' ? 'bg-[#3cffd0] text-black shadow-[0_0_15px_rgba(60,255,208,0.3)]' : 'text-[#949494]'}`}
                >
                    Modèles
                </button>
            </div>

            {/* Choix Joueurs tab (Mobile) or Desktop selection */}
            <div className={`${activeMobileTab === 'joueurs' ? 'block' : 'hidden'} md:block`}>
                <VersusPlayerGrid 
                    selectedPlayers={selectedPlayersToCompare}
                    onAddPlayer={handleAddPlayer}
                    onRemovePlayer={handleRemovePlayer}
                    MAX_PLAYERS={MAX_PLAYERS}
                    activeFilters={activeFilters}
                />
            </div>

            {/* Modèles tab (Mobile) - Exclusive on mobile */}
            <div className={`${activeMobileTab === 'modeles' ? 'block' : 'hidden'} md:hidden mt-4`}>
                <h2 className="verge-label-mono text-[11px] font-black tracking-[0.3em] text-[#3cffd0] mb-6 flex items-center gap-4">
                    <div className="w-2 h-2 bg-[#3cffd0]" />
                    MODÈLES TACTIQUES
                </h2>
                <div className="p-4 rounded-[4px] border border-white/10 bg-[#2d2d2d]">
                    <MetricSelectionPanel
                        cat={'joueurs'}
                        selectedTemplateLabels={selectedTemplateLabels}
                        onTemplateToggle={handleTemplateToggle}
                        metricDisplayMode={metricDisplayMode}
                        onMetricModeChange={setMetricDisplayMode}
                        metricOptions={metricsList}
                        selectedMetrics={selectedMetrics}
                        onMetricToggle={handleMetricToggle}
                        MIN_METRICS={1}
                        customTemplates={customTemplates}
                        saveCustomTemplate={saveCustomTemplate}
                        deleteCustomTemplate={deleteCustomTemplate}
                        applyCustomTemplate={applyCustomTemplate}
                        onResetMetrics={handleResetMetrics}
                        selectedPlayersToCompare={selectedPlayersToCompare}
                    />
                </div>
            </div>

            {/* Visionnage tab (Mobile) or Desktop results */}
            <div className={`${activeMobileTab === 'visionnage' ? 'block' : 'hidden'} md:block`}>
                <VersusComparison 
                    selectedPlayers={selectedPlayersToCompare}
                    selectedMetrics={selectedMetrics}
                    selectedTemplateLabels={selectedTemplateLabels}
                    handleTemplateToggle={handleTemplateToggle}
                    metricDisplayMode={metricDisplayMode}
                    setMetricDisplayMode={setMetricDisplayMode}
                    metricOptions={metricsList}
                    availableMetrics={metricsList}
                    handleMetricToggle={handleMetricToggle}
                    customTemplates={customTemplates}
                    saveCustomTemplate={saveCustomTemplate}
                    deleteCustomTemplate={deleteCustomTemplate}
                    applyCustomTemplate={applyCustomTemplate}
                    onResetMetrics={handleResetMetrics}
                    isMobileTabbed={activeMobileTab === 'visionnage'}
                />
            </div>
        </div>
    );
};
