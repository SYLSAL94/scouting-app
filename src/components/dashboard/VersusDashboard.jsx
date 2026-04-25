import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { VersusPlayerGrid } from './VersusPlayerGrid';
import { VersusComparison } from './VersusComparison';
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

    return (
        <div className="p-8 max-w-[1700px] mx-auto min-h-screen flex flex-col bg-[#131313]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div className="flex flex-col">
                    <button onClick={onClose} className="verge-label-mono text-[#3860be] hover:text-white flex items-center gap-2 mb-4 group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Intelligence Hub
                    </button>
                    <h1 className="verge-h1 text-white">Match-up <span className="text-[#3cffd0]">Simulator</span></h1>
                </div>
                <button 
                    onClick={() => setSelectedPlayersToCompare([])}
                    className="px-8 py-3 border border-[#f43f5e]/30 text-[#f43f5e] hover:bg-[#f43f5e]/10 rounded-[4px] verge-label-mono text-[10px] font-black tracking-widest transition-all"
                >
                    RESET SÉLECTEUR
                </button>
            </div>

            <VersusPlayerGrid 
                selectedPlayers={selectedPlayersToCompare}
                onAddPlayer={handleAddPlayer}
                onRemovePlayer={handleRemovePlayer}
                MAX_PLAYERS={MAX_PLAYERS}
                activeFilters={activeFilters}
            />

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
            />
        </div>
    );
};
