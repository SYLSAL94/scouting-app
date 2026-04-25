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
        <div className="h-full flex flex-col xl:flex-row gap-8">
            {/* Navigation Mobile */}
            <div className="xl:hidden flex bg-[#2d2d2d] p-1 rounded-[2px] border border-white/5 mb-6 shadow-xl">
                <button 
                    onClick={() => setActiveTab('field')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1px] verge-label-mono text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'field' ? 'bg-[#3cffd0] text-black shadow-[0_0_15px_rgba(60,255,208,0.3)]' : 'text-[#949494]'}`}
                >
                    ⚽ XI OPTIMAL
                </button>
                <button 
                    onClick={() => setActiveTab('config')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1px] verge-label-mono text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'config' ? 'bg-[#3cffd0] text-black shadow-[0_0_15px_rgba(60,255,208,0.3)]' : 'text-[#949494]'}`}
                >
                    ⚡ OPTIMISER
                </button>
            </div>

            {/* Zone Terrain */}
            <div className={`${activeTab === 'field' ? 'block' : 'hidden'} xl:block flex-[4] h-[calc(100vh-240px)] min-h-[600px] flex relative rounded-[4px] overflow-hidden border border-white/10 bg-[#131313] shadow-[0_30px_60px_rgba(0,0,0,0.4)]`}>
                {loading && (
                    <div className="absolute inset-0 z-50 bg-[#131313]/90 backdrop-blur-md flex flex-col items-center justify-center gap-8">
                        <div className="relative">
                           <Loader2 className="w-16 h-16 text-[#3cffd0] animate-spin" />
                           <div className="absolute inset-0 bg-[#3cffd0]/10 blur-3xl rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex flex-col items-center">
                           <p className="verge-label-mono text-[11px] font-black uppercase tracking-[0.4em] text-[#3cffd0] mb-2">NEURAL OPTIMIZATION</p>
                           <p className="verge-label-mono text-[9px] text-[#949494] uppercase tracking-widest opacity-40">Processing tactical weights...</p>
                        </div>
                    </div>
                )}
                {!loading && bestXI.length === 0 && (
                    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-12 text-center bg-[radial-gradient(circle_at_center,_rgba(60,255,208,0.03)_0%,_transparent_70%)]">
                        <div className="w-20 h-20 bg-[#2d2d2d] border border-white/10 rounded-[2px] flex items-center justify-center mb-10 shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative group">
                             <div className="absolute inset-0 bg-[#3cffd0]/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                             <Activity className="w-10 h-10 text-[#3cffd0] opacity-40" />
                        </div>
                        <h4 className="verge-label-mono text-3xl font-black text-white uppercase tracking-tighter mb-4">PRÊT POUR L'OPTIMISATION</h4>
                        <p className="max-w-md verge-label-mono text-[#949494] text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed opacity-60">
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
            <div className={`${activeTab === 'config' ? 'block' : 'hidden'} xl:block xl:w-[420px] flex-shrink-0 flex flex-col bg-[#2d2d2d] border border-white/10 rounded-[4px] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.6)]`}>
                <div className="p-10 space-y-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-2 h-8 bg-[#3cffd0]" />
                        <h3 className="verge-label-mono text-2xl font-black text-white uppercase tracking-[0.1em]">
                            BEST <span className="text-[#3cffd0]">XI</span>
                        </h3>
                    </div>

                    <div className="space-y-5">
                        <button
                            onClick={() => setUseWeightedNote((p) => !p)}
                            className={`w-full group relative flex items-center justify-center px-6 py-5 border verge-label-mono text-[10px] font-black uppercase tracking-[0.2em] rounded-[2px] transition-all duration-300 ${useWeightedNote
                                ? 'border-[#3cffd0]/30 text-[#3cffd0] bg-[#3cffd0]/5'
                                : 'border-white/10 text-[#949494] hover:border-white/20'
                                }`}
                        >
                            <span className="relative flex items-center gap-4 z-10">
                                {useWeightedNote ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                {useWeightedNote ? 'IMPACT SCORE' : 'STANDARD NOTE'}
                            </span>
                        </button>

                        <div className="relative">
                            <select
                                value={formationKey}
                                onChange={(e) => setFormationKey(e.target.value)}
                                className="block w-full px-6 py-5 verge-label-mono text-[10px] font-black uppercase tracking-[0.2em] border border-white/5 focus:outline-none focus:border-[#3cffd0]/50 rounded-[2px] bg-[#131313] text-white appearance-none cursor-pointer"
                            >
                                {Object.keys(formations).map((name) => (
                                    <option key={name} value={name}>FORMATION : {name}</option>
                                ))}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                <Activity size={14} />
                            </div>
                        </div>

                        <button
                            onClick={generateXI}
                            disabled={loading}
                            className="w-full py-6 bg-[#3cffd0] hover:bg-[#3cffd0]/90 disabled:bg-[#131313] disabled:text-[#444] text-black rounded-[2px] verge-label-mono font-black uppercase tracking-[0.3em] text-[12px] shadow-[0_20px_40px_rgba(60,255,208,0.2)] transition-all active:scale-[0.98] flex items-center justify-center gap-4"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "GÉNÉRER LE XI"}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-black/20 border-t border-white/5 overflow-hidden">
                    <div className="px-10 py-5 border-b border-white/5 bg-[#131313]/50">
                        <h4 className="verge-label-mono text-[9px] font-black uppercase tracking-[0.3em] text-[#949494]">REMPLAÇANTS SUGGÉRÉS</h4>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 styled-scrollbar">
                        {benchPlayers.length > 0 ? (
                            benchPlayers.map(player => (
                                <div key={player.id}
                                    onClick={() => onPlayerClick?.(player)}
                                    className="group flex items-center justify-between p-4 rounded-[2px] bg-[#131313] border border-transparent hover:border-[#3cffd0]/30 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-5 flex-1 min-w-0">
                                        <div className="w-12 h-12 shrink-0 rounded-[1px] bg-[#2d2d2d] overflow-hidden border border-white/5">
                                            <img src={player.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="verge-label-mono text-[11px] font-black text-white uppercase truncate tracking-tight">{player.name || player.full_name}</p>
                                            <p className="verge-label-mono text-[8px] text-[#949494] font-black uppercase tracking-widest truncate opacity-50">REMPLAÇANT: {player.substituteFor}</p>
                                        </div>
                                    </div>
                                    <div className="verge-label-mono text-[12px] font-black text-[#3cffd0] shrink-0 tabular-nums">
                                        {Number(player[useWeightedNote ? 'note_ponderee' : 'note_globale'] || 0).toFixed(1)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 opacity-10">
                                <UserX size={40} />
                                <p className="verge-label-mono text-[9px] uppercase font-black mt-4 tracking-widest">AUCUN REMPLAÇANT</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
