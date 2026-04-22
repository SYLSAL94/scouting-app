// src/components/teambuilder/BestXI.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, UserX, Loader2 } from 'lucide-react';
import { formations } from '../../config/formations';
import Field from './Field';

export default function BestXI({ activeFilters, onPlayerClick }) {
    const [formationKey, setFormationKey] = useState('4-3-3');
    const [useWeightedNote, setUseWeightedNote] = useState(true);
    const [loading, setLoading] = useState(false);
    const [bestXI, setBestXI] = useState([]);
    const [benchPlayers, setBenchPlayers] = useState([]);

    useEffect(() => {
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
    }, [formationKey, useWeightedNote, activeFilters]);

    const formationLayout = useMemo(() => formations[formationKey] || [], [formationKey]);

    const formationForField = useMemo(() => {
        return bestXI.reduce((acc, slot) => {
            acc[slot.slot_id] = slot.player;
            return acc;
        }, {});
    }, [bestXI]);

    return (
        <div className="h-full flex flex-col xl:flex-row gap-8">
            <div className="flex-1 min-h-[600px] flex relative rounded-3xl overflow-hidden border border-white/5 bg-slate-900/50 shadow-2xl">
                {loading && (
                    <div className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-sky-400">Tactical Optimization...</p>
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

            <div className="xl:w-[400px] flex-shrink-0 flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-8 space-y-6">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                        Best <span className="text-sky-400">XI</span>
                    </h3>

                    <div className="space-y-4">
                        <button
                            onClick={() => setUseWeightedNote((p) => !p)}
                            className={`w-full group relative flex items-center justify-center px-4 py-4 border text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${useWeightedNote
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
                                className="block w-full px-6 py-4 text-xs font-black uppercase tracking-widest border border-white/10 focus:outline-none focus:border-sky-500/50 rounded-xl bg-slate-900/50 text-white appearance-none cursor-pointer"
                            >
                                {Object.keys(formations).map((name) => (
                                    <option key={name} value={name}>Formation : {name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-black/20 border-t border-white/5 overflow-hidden">
                    <div className="px-8 py-4 border-b border-white/5">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Suggested Bench</h4>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                        {benchPlayers.length > 0 ? (
                            benchPlayers.map(player => (
                                <div key={player.id}
                                    onClick={() => onPlayerClick?.(player)}
                                    className="group flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden border border-white/10">
                                            <img src={player.image} alt="" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-200 truncate">{player.name || player.full_name}</p>
                                            <p className="text-[9px] text-slate-500 uppercase tracking-widest">sub: {player.substituteFor}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-black text-emerald-400">
                                        {Number(player[useWeightedNote ? 'note_ponderee' : 'note_globale'] || 0).toFixed(1)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 opacity-30">
                                <UserX size={32} />
                                <p className="text-[10px] uppercase font-bold mt-2">No subs found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
