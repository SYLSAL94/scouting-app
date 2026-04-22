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
        <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {/* HEADER AVEC METRIC SELECTION PANEL (Réutilisation Lego) */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent flex-shrink-0">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 rounded-xl bg-sky-500/20 ring-1 ring-sky-500/30">
                        <Settings size={22} className="text-sky-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Configuration</h3>
                        <p className="text-[10px] text-slate-500 font-medium">Définissez vos critères d'analyse</p>
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
                    hideModeSelector={true} // Nouveau flag pour masquer le sélecteur de mode
                />
            </div>

            {/* LISTE DES PONDÉRATIONS (DYNAMIQUE) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/10">
                {selectedMetrics.length > 0 ? (
                    <>
                        <div className="sticky top-0 z-10 flex items-center gap-4 py-3 bg-slate-900/95 backdrop-blur-sm -mx-6 px-6 mb-2 border-b border-white/5">
                            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <SlidersHorizontal size={12} />
                                Pondération
                                <button 
                                    onClick={handleEqualize}
                                    className="ml-2 p-1 rounded-full hover:bg-sky-500/20 text-sky-400 transition-colors"
                                    title="Égaliser les poids"
                                >
                                    <Scale size={12} />
                                </button>
                            </div>
                            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                        </div>
                        
                        <div className="space-y-3">
                            {selectedMetrics.map(m => (
                                <div key={m.id} className="group p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-bold text-slate-200 truncate pr-4">{m.label}</span>
                                        <button onClick={() => handleMetricToggle(m.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                            <X size={14} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => updateMetric(m.id, 'sign', m.sign === 1 ? -1 : 1)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-all border ${
                                                m.sign === 1 
                                                ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' 
                                                : 'bg-red-500/10 border-red-500/30 text-red-400'
                                            }`}
                                        >
                                            {m.sign === 1 ? '+' : '-'}
                                        </button>
                                        
                                        <div className="relative flex-grow h-6 flex items-center">
                                            <div className="absolute w-full h-1 bg-white/10 rounded-full" />
                                            <div 
                                                className={`absolute h-1 rounded-full ${m.sign === 1 ? 'bg-sky-500' : 'bg-red-500'}`} 
                                                style={{ width: `${Math.round(m.weight * 100)}%` }}
                                            />
                                            <input 
                                                type="range" min="0" max="1" step="0.01" 
                                                value={m.weight}
                                                onChange={(e) => updateMetric(m.id, 'weight', parseFloat(e.target.value))}
                                                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div 
                                                className={`absolute h-3 w-3 rounded-full border-2 border-slate-900 shadow-lg ${m.sign === 1 ? 'bg-sky-400' : 'bg-red-400'}`}
                                                style={{ left: `${Math.round(m.weight * 100)}%`, transform: 'translateX(-50%)' }}
                                            />
                                        </div>
                                        
                                        <span className={`w-10 text-right text-xs font-black tabular-nums ${m.sign === 1 ? 'text-sky-400' : 'text-red-400'}`}>
                                            {Math.round(m.weight * 100)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-40">
                        <SlidersHorizontal size={40} strokeWidth={1} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-center">Ajoutez des métriques pour commencer</p>
                    </div>
                )}
            </div>

            {/* FOOTER ACTION */}
            <div className="p-6 bg-black/40 border-t border-white/5 flex-shrink-0">
                <button
                    onClick={handleRun}
                    disabled={selectedMetrics.length === 0 || loading}
                    className="w-full relative group flex items-center justify-center px-6 py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-xl shadow-sky-900/20"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <span className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white">
                            <Zap size={18} fill="currentColor" />
                            Lancer l'Analyse
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}
