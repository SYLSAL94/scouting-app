// src/components/teambuilder/BestXI.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, UserX, Loader2, Activity } from 'lucide-react';
import { formations } from '../../config/formations';
import Field from './Field';

export default function BestXI({ activeFilters, onPlayerClick }) {
    const [formationKey, setFormationKey] = useState('4-3-3');
    const [useWeightedNote, setUseWeightedNote] = useState(true);
    const [loading, setLoading] = useState(false);
    const [bestXI, setBestXI] = useState([]);
    const [benchPlayers, setBenchPlayers] = useState([]);
    const [activeTab, setActiveTab] = useState('field'); // 'field' | 'config'

    const generateXI = () => {
        setLoading(true);
        fetch('https://api-scouting.theanalyst.cloud/api/teambuilder/auto-generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                formation: formationKey,
                metric_type: useWeightedNote ? 'note_ponderee' : 'note_globale',
                population_filters: activeFilters
            })
        })
        .then(res => res.json())
        .then(data => {
            setBestXI(data.xi || []);
            setBenchPlayers(data.bench || []);
            setLoading(false);
        })
        .catch(err => {
            console.error("Error generating Best XI:", err);
            setLoading(false);
        });
    };

    useEffect(() => {
        // Optionnel: on peut vider le XI précédent si on veut forcer une nouvelle génération
        // setBestXI([]);
    }, [activeFilters]);

    const formationLayout = useMemo(() => formations[formationKey] || [], [formationKey]);

    const formationForField = useMemo(() => {
        return bestXI.reduce((acc, slot) => {
            acc[slot.slot_id] = slot.player;
            return acc;
        }, {});
    }, [bestXI]);

    return (
        <div className="h-full flex flex-col xl:flex-row gap-6 md:gap-8">
            {/* Navigation Mobile */}
            <div className="xl:hidden flex bg-slate-900/80 backdrop-blur-xl p-1 rounded-2xl border border-white/5 mb-4 shadow-xl">
                <button 
                    onClick={() => setActiveTab('field')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'field' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500'}`}
                >
                    ⚽ XI Optimal
                </button>
                <button 
                    onClick={() => setActiveTab('config')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'config' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500'}`}
                >
                    ⚡ Optimiser
                </button>
            </div>

            {/* Zone Terrain - Dynamique et Flexible (Harmonisée avec MonXI) */}
            <div className={`${activeTab === 'field' ? 'block' : 'hidden'} xl:block flex-[4] min-h-[700px] 2xl:min-h-[850px] flex relative rounded-[2rem] overflow-hidden border border-white/5 bg-[#0a0d14]/50 shadow-2xl backdrop-blur-md`}>
                {loading && (
                    <div className="absolute inset-0 z-50 bg-[#080a0f]/80 backdrop-blur-md flex flex-col items-center justify-center gap-6">
                        <div className="relative">
                           <Loader2 className="w-16 h-16 text-sky-500 animate-spin" />
                           <div className="absolute inset-0 bg-sky-500/20 blur-2xl rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex flex-col items-center">
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400 mb-1">Neural Optimization</p>
                           <p className="text-[9px] text-white/30 uppercase tracking-widest">Processing tactical weights...</p>
                        </div>
                    </div>
                )}
                {!loading && bestXI.length === 0 && (
                    <div className="absolute inset-0 z-40 bg-slate-950/20 backdrop-blur-[2px] flex flex-col items-center justify-center p-8 md:p-12 text-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-sky-500/10 border border-sky-500/20 rounded-full flex items-center justify-center mb-6 shadow-2xl relative">
                             <div className="absolute inset-0 bg-sky-500/5 blur-xl rounded-full"></div>
                             <Activity className="w-8 h-8 md:w-10 md:h-10 text-sky-500/40" />
                        </div>
                        <h4 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight mb-3">Prêt pour l'Optimisation</h4>
                        <p className="max-w-xs text-slate-400 text-[10px] md:text-xs font-medium uppercase tracking-widest leading-relaxed">
                            Configurez votre formation et cliquez sur le bouton pour générer le meilleur XI.
                        </p>
                    </div>
                )}
                <Field
                    formationLayout={formationLayout}
                    formation={formationForField}
                    onSlotClick={(slotId) => {
                        const p = formationForField[slotId];
                        if (p) onPlayerClick?.(p);
                    }}
                />
            </div>

            {/* Zone Optimisation - Panneau Latéral */}
            <div className={`${activeTab === 'config' ? 'block' : 'hidden'} xl:block xl:w-[420px] flex-shrink-0 flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl`}>
                <div className="p-6 md:p-8 space-y-6">
                    <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
                        Best <span className="text-sky-400">XI</span>
                    </h3>

                    <div className="space-y-4">
                        <button
                            onClick={() => setUseWeightedNote((p) => !p)}
                            className={`w-full group relative flex items-center justify-center px-4 py-4 border text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${useWeightedNote
                                ? 'border-emerald-500/30 text-white'
                                : 'border-sky-500/30 text-white'
                                }`}
                        >
                            <div className={`absolute inset-0 opacity-20 ${useWeightedNote ? 'bg-emerald-500' : 'bg-sky-500'}`} />
                            <span className="relative flex items-center gap-3 z-10">
                                {useWeightedNote ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                {useWeightedNote ? 'Impact Score' : 'Standard Note'}
                            </span>
                        </button>

                        <div className="relative">
                            <select
                                value={formationKey}
                                onChange={(e) => setFormationKey(e.target.value)}
                                className="block w-full px-5 py-4 text-[10px] md:text-xs font-black uppercase tracking-widest border border-white/10 focus:outline-none focus:border-sky-500/50 rounded-xl bg-slate-900/50 text-white appearance-none cursor-pointer"
                            >
                                {Object.keys(formations).map((name) => (
                                    <option key={name} value={name}>Formation : {name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={generateXI}
                            disabled={loading}
                            className="w-full py-5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] md:text-sm shadow-2xl shadow-sky-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Générer le XI"}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-black/20 border-t border-white/5 overflow-hidden">
                    <div className="px-8 py-4 border-b border-white/5 bg-slate-900/50">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Remplaçants Suggérés</h4>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 styled-scrollbar">
                        {benchPlayers.length > 0 ? (
                            benchPlayers.map(player => (
                                <div key={player.id}
                                    onClick={() => onPlayerClick?.(player)}
                                    className="group flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-transparent hover:border-sky-500/30 hover:bg-white/10 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-800 overflow-hidden border border-white/10">
                                            <img src={player.image} alt="" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-200 truncate group-hover:text-white">{player.name || player.full_name}</p>
                                            <p className="text-[9px] text-slate-500 uppercase tracking-widest truncate">Remplaçant: {player.substituteFor}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-black text-sky-400 shrink-0">
                                        {Number(player[useWeightedNote ? 'note_ponderee' : 'note_globale'] || 0).toFixed(1)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 opacity-30">
                                <UserX size={32} />
                                <p className="text-[10px] uppercase font-bold mt-2">Aucun remplaçant</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
