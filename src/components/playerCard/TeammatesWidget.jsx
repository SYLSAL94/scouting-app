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
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-lg backdrop-blur-md h-full flex flex-col">
            <h3 className="text-lg font-bold mb-1 text-white">Effectif</h3>
            <p className="text-xs text-slate-400 mb-5">Coéquipiers partageant la même saison et le même club.</p>
            
            <div className="flex-1 overflow-y-auto pr-1">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-14 bg-slate-800/50 rounded-lg animate-pulse border border-slate-700/50" />
                        ))}
                    </div>
                ) : teammates.length === 0 ? (
                    <div className="text-slate-500 text-sm text-center py-8">Aucun coéquipier trouvé.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {teammates.map((p, i) => (
                            <div key={p.unique_id || `${p.id}-${i}`} className="bg-slate-800/40 hover:bg-slate-700/60 p-2.5 rounded-xl border border-slate-700/50 hover:border-emerald-500/30 transition-all flex items-center gap-3 cursor-pointer group">
                                <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-full flex items-center justify-center font-black text-xs text-slate-300 shadow-inner group-hover:from-emerald-600 group-hover:to-teal-700 group-hover:text-white transition-all">
                                    {p.position_category?.slice(0,2).toUpperCase() || 'PL'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-bold text-sm text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                                        {p.name || p.full_name}
                                    </div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                        <span className="font-bold text-emerald-500/80">{Number(p.note_ponderee || 0).toFixed(1)}</span>
                                        <span className="opacity-50">•</span>
                                        <span className="truncate">{p.primary_position || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
