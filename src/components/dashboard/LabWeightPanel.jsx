import React, { useState, useMemo } from 'react';
import { Settings, X, SlidersHorizontal, Scale, Zap, Trash2 } from 'lucide-react';
import { MetricSelectionPanel } from './MetricSelectionPanel';

export default function LabWeightPanel({ metricsList, onCalculate, loading }) {
    // État principal : Liste des métriques avec poids et signes
    const [selectedMetrics, setSelectedMetrics] = useState([]); // Array of { id, label, weight, sign }
    
    // États requis pour le MetricSelectionPanel (cohérence UI)
    const [selectedTemplateLabels, setSelectedTemplateLabels] = useState(new Set());
    const [metricDisplayMode, setMetricDisplayMode] = useState('percentile');

    const metricOptions = useMemo(() => 
        metricsList.map(m => ({ value: m.id, label: m.label })), 
    [metricsList]);

    const selectedMetricIds = useMemo(() => 
        selectedMetrics.map(m => m.id), 
    [selectedMetrics]);

    // --- LOGIQUE DE SYNCHRONISATION & ÉQUILIBRAGE ---

    const balanceWeights = (metrics, changedId, newValue) => {
        if (metrics.length <= 1) {
            return metrics.map(m => ({ ...m, weight: 1.0 }));
        }

        const changedIndex = metrics.findIndex(m => m.id === changedId);
        const oldValue = metrics[changedIndex].weight;
        const delta = newValue - oldValue;

        // On calcule la somme des autres poids pour redistribuer
        const otherMetrics = metrics.filter(m => m.id !== changedId);
        const otherSum = otherMetrics.reduce((sum, m) => sum + m.weight, 0);

        if (otherSum === 0) {
            // Si tous les autres sont à 0, on répartit équitablement le reste
            const share = (1 - newValue) / otherMetrics.length;
            return metrics.map(m => m.id === changedId ? { ...m, weight: newValue } : { ...m, weight: share });
        }

        // Redistribution proportionnelle
        const factor = (otherSum - delta) / otherSum;
        
        return metrics.map(m => {
            if (m.id === changedId) return { ...m, weight: newValue };
            // On s'assure que le nouveau poids n'est pas négatif
            const nextWeight = Math.max(0, m.weight * factor);
            return { ...m, weight: nextWeight };
        });
    };

    const normalizeAll = (metrics) => {
        if (metrics.length === 0) return [];
        const sum = metrics.reduce((s, m) => s + m.weight, 0);
        if (sum === 0) return metrics.map(m => ({ ...m, weight: 1 / metrics.length }));
        return metrics.map(m => ({ ...m, weight: m.weight / sum }));
    };

    const handleMetricToggle = (metricId) => {
        if (selectedMetricIds.includes(metricId)) {
            setSelectedMetrics(prev => normalizeAll(prev.filter(m => m.id !== metricId)));
        } else {
            const metric = metricsList.find(m => m.id === metricId);
            if (metric) {
                // On ajoute et on normalise tout le monde
                setSelectedMetrics(prev => normalizeAll([...prev, { 
                    id: metricId, 
                    label: metric.label, 
                    weight: 1 / (prev.length + 1), 
                    sign: 1 
                }]));
            }
        }
    };

    const handleTemplateToggle = (templateLabel, metricIds) => {
        const newLabels = new Set(selectedTemplateLabels);
        if (newLabels.has(templateLabel)) {
            newLabels.delete(templateLabel);
            setSelectedMetrics(prev => normalizeAll(prev.filter(m => !metricIds.includes(m.id))));
        } else {
            newLabels.add(templateLabel);
            const toAdd = metricIds
                .filter(id => !selectedMetricIds.includes(id))
                .map(id => {
                    const m = metricsList.find(x => x.id === id);
                    return { id, label: m?.label || id, weight: 0.1, sign: 1 };
                });
            setSelectedMetrics(prev => normalizeAll([...prev, ...toAdd]));
        }
        setSelectedTemplateLabels(newLabels);
    };

    const handleReset = () => {
        setSelectedMetrics([]);
        setSelectedTemplateLabels(new Set());
    };

    const updateMetric = (id, field, value) => {
        if (field === 'weight') {
            setSelectedMetrics(prev => balanceWeights(prev, id, value));
        } else {
            setSelectedMetrics(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
        }
    };

    const handleEqualize = () => {
        if (selectedMetrics.length === 0) return;
        const equalWeight = 1 / selectedMetrics.length;
        setSelectedMetrics(prev => prev.map(m => ({ ...m, weight: equalWeight })));
    };

    const handleRun = () => {
        if (selectedMetrics.length === 0) return;
        const weights = {};
        const signs = {};
        selectedMetrics.forEach(m => {
            weights[m.id] = m.weight;
            signs[m.id] = m.sign;
        });
        onCalculate(weights, signs);
    };

    return (
        <div className="flex flex-col h-full bg-canvas-black border border-hazard-white/10 rounded-[4px] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
            {/* HEADER */}
            <div className="p-8 border-b border-hazard-white/5 bg-surface-slate flex-shrink-0">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-2 h-8 bg-jelly-mint" />
                    <div>
                        <h3 className="verge-label-mono text-xl font-black text-hazard-white tracking-[0.1em] uppercase">Configuration</h3>
                        <p className="verge-label-mono text-[9px] text-secondary-text font-black uppercase tracking-[0.3em] opacity-40 mt-1">Définissez vos critères d'analyse</p>
                    </div>
                </div>

                <MetricSelectionPanel 
                    cat="joueurs"
                    selectedTemplateLabels={selectedTemplateLabels}
                    onTemplateToggle={handleTemplateToggle}
                    metricOptions={metricOptions}
                    selectedMetrics={selectedMetricIds}
                    onMetricToggle={handleMetricToggle}
                    MIN_METRICS={1}
                    onResetMetrics={handleReset}
                    hideModeSelector={true}
                />
            </div>

            {/* LISTE DES PONDÉRATIONS */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-canvas-black">
                {selectedMetrics.length > 0 ? (
                    <>
                        <div className="sticky top-0 z-10 flex items-center gap-4 py-4 bg-canvas-black -mx-8 px-8 mb-4 border-b border-hazard-white/5">
                            <div className="h-px flex-grow bg-hazard-white/5"></div>
                            <div className="flex items-center gap-3 verge-label-mono text-[9px] font-black uppercase tracking-[0.3em] text-secondary-text">
                                <SlidersHorizontal size={12} />
                                PONDÉRATION
                                <button 
                                    onClick={handleEqualize}
                                    className="ml-3 p-1.5 rounded-[1px] hover:bg-jelly-mint/10 text-jelly-mint transition-colors border border-transparent hover:border-jelly-mint/20"
                                    title="Égaliser les poids"
                                >
                                    <Scale size={12} />
                                </button>
                            </div>
                            <div className="h-px flex-grow bg-hazard-white/5"></div>
                        </div>
                        
                        <div className="space-y-4">
                            {selectedMetrics.map(m => (
                                <div key={m.id} className="group p-5 bg-surface-slate border border-hazard-white/5 rounded-[2px] hover:border-jelly-mint/20 transition-all shadow-lg">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="verge-label-mono text-[10px] font-black text-hazard-white uppercase tracking-wider truncate pr-4">{m.label}</span>
                                        <button onClick={() => handleMetricToggle(m.id)} className="text-secondary-text hover:text-hazard-white transition-colors">
                                            <X size={14} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center gap-5">
                                        <button 
                                            onClick={() => updateMetric(m.id, 'sign', m.sign === 1 ? -1 : 1)}
                                            className={`w-10 h-10 rounded-[1px] flex items-center justify-center verge-label-mono text-base font-black transition-all border ${
                                                m.sign === 1 
                                                ? 'bg-jelly-mint/10 border-jelly-mint/30 text-jelly-mint' 
                                                : 'bg-red-500/10 border-red-500/30 text-red-500'
                                            }`}
                                        >
                                            {m.sign === 1 ? '+' : '-'}
                                        </button>
                                        
                                        <div className="relative flex-grow h-8 flex items-center">
                                            <div className="absolute w-full h-1 bg-canvas-black rounded-[1px]" />
                                            <div 
                                                className={`absolute h-1 rounded-[1px] ${m.sign === 1 ? 'bg-jelly-mint' : 'bg-red-500'}`} 
                                                style={{ width: `${Math.round(m.weight * 100)}%` }}
                                            />
                                            <input 
                                                type="range" min="0" max="1" step="0.01" 
                                                value={m.weight}
                                                onChange={(e) => updateMetric(m.id, 'weight', parseFloat(e.target.value))}
                                                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div 
                                                className={`absolute h-4 w-4 rounded-[1px] shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-hazard-white/20 ${m.sign === 1 ? 'bg-jelly-mint' : 'bg-red-500'}`}
                                                style={{ left: `${Math.round(m.weight * 100)}%`, transform: 'translateX(-50%)' }}
                                            />
                                        </div>
                                        
                                        <span className={`w-12 text-right verge-label-mono text-[11px] font-black tabular-nums ${m.sign === 1 ? 'text-jelly-mint' : 'text-red-500'}`}>
                                            {Math.round(m.weight * 100)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-secondary-text space-y-6 opacity-20 py-20">
                        <SlidersHorizontal size={48} strokeWidth={1} />
                        <p className="verge-label-mono text-[10px] font-black uppercase tracking-[0.3em] text-center">Ajoutez des métriques pour commencer</p>
                    </div>
                )}
            </div>

            {/* FOOTER ACTION */}
            <div className="p-8 bg-surface-slate border-t border-hazard-white/5 flex-shrink-0">
                <button
                    onClick={handleRun}
                    disabled={selectedMetrics.length === 0 || loading}
                    className="w-full relative group flex items-center justify-center px-8 py-6 rounded-[2px] bg-jelly-mint hover:bg-jelly-mint/90 disabled:bg-canvas-black disabled:text-[#444] transition-all duration-300 shadow-[0_20px_40px_rgba(60,255,208,0.2)] active:scale-[0.98]"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-absolute-black/10 border-t-black rounded-full animate-spin" />
                    ) : (
                        <span className="flex items-center gap-4 verge-label-mono text-[12px] font-black uppercase tracking-[0.4em] text-absolute-black">
                            <Zap size={18} fill="currentColor" />
                            Lancer l'Analyse
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}
