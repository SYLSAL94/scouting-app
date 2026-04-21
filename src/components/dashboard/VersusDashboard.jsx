import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import { VersusPlayerGrid } from './VersusPlayerGrid';
import { VersusComparison } from './VersusComparison';

const MAX_PLAYERS = 5;

export const VersusDashboard = ({ 
    metricsList, 
    selectedPlayersToCompare = [], 
    setSelectedPlayersToCompare,     
    onClose 
}) => {
    const [selectedMetrics, setSelectedMetrics] = useState([]);
    const [selectedTemplateLabels, setSelectedTemplateLabels] = useState(new Set());
    const [metricDisplayMode, setMetricDisplayMode] = useState('percentile'); 
    const [customTemplates, setCustomTemplates] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('wyscout_custom_templates');
        if (saved) {
            try { setCustomTemplates(JSON.parse(saved)); } catch (e) {}
        }
    }, []);

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

    const handleMetricToggle = (metricId) => {
        setSelectedMetrics(prev => {
            if (prev.includes(metricId)) return prev.filter(m => m !== metricId);
            return [...prev, metricId];
        });
        
        // Reset tactical labels if manual selection is used
        setSelectedTemplateLabels(new Set());
    };

    const handleTemplateToggle = (templateKey, metrics) => {
        const nextLabels = new Set();
        if (selectedTemplateLabels.has(templateKey)) {
            // Uncheck: clear selection
            setSelectedMetrics([]);
        } else {
            // Overwrite selection with tactical sub-variables
            nextLabels.add(templateKey);
            setSelectedMetrics(metrics);
        }
        setSelectedTemplateLabels(nextLabels);
    };

    const handleResetMetrics = () => {
        setSelectedMetrics([]);
        setSelectedTemplateLabels(new Set());
    };

    const saveCustomTemplate = (name) => {
        const newTemplate = { id: Date.now().toString(), name, metrics: selectedMetrics };
        const next = [...customTemplates, newTemplate];
        setCustomTemplates(next);
        localStorage.setItem('wyscout_custom_templates', JSON.stringify(next));
    };

    const deleteCustomTemplate = (id) => {
        const next = customTemplates.filter(t => t.id !== id);
        setCustomTemplates(next);
        localStorage.setItem('wyscout_custom_templates', JSON.stringify(next));
    };

    const applyCustomTemplate = (template) => {
        setSelectedMetrics(template.metrics || []);
        setSelectedTemplateLabels(new Set());
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
