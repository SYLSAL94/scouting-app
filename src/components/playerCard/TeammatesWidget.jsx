import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://api-scouting.theanalyst.cloud';

export default function TeammatesWidget({ playerId }) {
    const [teammates, setTeammates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!playerId) return;
        setLoading(true);
        fetch(`${API_BASE_URL}/api/players/${playerId}/teammates`)
            .then(res => res.json())
            .then(data => {
                setTeammates(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [playerId]);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-md h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Effectif
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">Saison & Club Actuel</p>
                </div>
                <div className="px-2 py-1 bg-slate-800 rounded text-[10px] font-black text-slate-400 border border-slate-700">
                    {teammates.length} JOUEURS
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 styled-scrollbar space-y-1.5">
                {loading ? (
                    Array(8).fill(0).map((_, i) => (
                        <div key={i} className="h-10 bg-slate-800/30 rounded-lg animate-pulse" />
                    ))
                ) : teammates.length === 0 ? (
                    <div className="text-slate-500 text-[11px] font-medium text-center py-10 italic">Aucun coéquipier identifié.</div>
                ) : (
                    teammates.map((p, i) => {
                        const score = Number(p.note_ponderee || 0);
                        const scoreColor = score >= 80 ? 'bg-emerald-500' : score >= 70 ? 'bg-sky-500' : score >= 60 ? 'bg-amber-500' : 'bg-slate-600';
                        
                        return (
                            <div 
                                key={p.unique_id || `${p.id}-${i}`} 
                                className="group flex items-center gap-3 p-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-sky-500/30 rounded-xl transition-all duration-300 cursor-pointer"
                            >
                                {/* Position Badge */}
                                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-[9px] font-black text-slate-400 group-hover:text-sky-400 group-hover:border-sky-500/50 transition-colors">
                                    {p.position_category?.slice(0,2).toUpperCase() || 'PL'}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <div className="font-bold text-xs text-slate-200 truncate group-hover:text-white transition-colors">
                                            {p.name || p.full_name}
                                        </div>
                                        <div className={`text-[10px] font-black ${score >= 70 ? 'text-sky-400' : 'text-slate-400'}`}>
                                            {score.toFixed(1)}
                                        </div>
                                    </div>
                                    {/* Mini Gauge */}
                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${scoreColor} transition-all duration-700 ease-out`} 
                                            style={{ width: `${score}%` }} 
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
