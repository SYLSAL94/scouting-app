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
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div className="flex flex-col">
                    <button onClick={onClose} className="btn-back mb-2">
                        <ArrowLeft size={14} /> Intelligence Hub
                    </button>
                    <h1 className="text-5xl font-black uppercase tracking-tighter">Match-up <span className="text-highlight">Simulator</span></h1>
                </div>
                <button 
                    onClick={() => setSelectedPlayersToCompare([])}
                    className="px-6 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                >
                    Reset Sélecteur
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
