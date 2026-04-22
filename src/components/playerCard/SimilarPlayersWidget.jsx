import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://api-scouting.theanalyst.cloud';

export default function SimilarPlayersWidget({ playerId }) {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!playerId) return;
        setLoading(true);
        fetch(`${API_BASE_URL}/api/players/${playerId}/similar`)
            .then(res => res.json())
            .then(data => {
                setPlayers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [playerId]);

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-lg backdrop-blur-md h-full flex flex-col">
            <h3 className="text-lg font-bold mb-1 text-white">Profils Similaires</h3>
            <p className="text-xs text-slate-400 mb-5">Distance Euclidienne sur Macro-Indices calculée par PostgreSQL (KNN).</p>
            
            <div className="flex-1 overflow-y-auto pr-1">
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse border border-slate-700/50" />
                        ))}
                    </div>
                ) : players.length === 0 ? (
                    <div className="text-slate-500 text-sm text-center py-8">Aucun profil similaire trouvé.</div>
                ) : (
                    <ul className="space-y-3">
                        {players.map((p, i) => (
                            <li key={p.unique_id || `${p.id}-${i}`} className="group bg-slate-800/40 hover:bg-slate-700/60 p-3.5 rounded-xl border border-slate-700/50 hover:border-sky-500/30 transition-all flex justify-between items-center cursor-pointer">
                                <div>
                                    <div className="font-bold text-slate-200 group-hover:text-sky-400 transition-colors flex items-center gap-2">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-900 text-[10px] text-slate-400">
                                            {i + 1}
                                        </span>
                                        {p.name || p.full_name}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1.5 pl-7">
                                        {p.last_club_name} • {p.season} {p.competition ? `• ${p.competition}` : ''}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Distance</div>
                                    <div className="text-sm font-black text-amber-500">
                                        {Number(p.similarity_distance).toFixed(3)}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
