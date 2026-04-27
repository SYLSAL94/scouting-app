import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';

export default function TeammatesWidget({ playerId, competition, season, team, onSelectPlayer }) {
    const [teammates, setTeammates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!playerId) return;
        setLoading(true);
        
        let url = `${API_BASE_URL}/api/players/${playerId}/teammates?`;
        if (competition) url += `competition=${encodeURIComponent(competition)}&`;
        if (season) url += `season=${encodeURIComponent(season)}&`;
        if (team) url += `team=${encodeURIComponent(team)}&`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setTeammates(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [playerId, competition, season, team]);

    return (
        <div className="bg-canvas-black border border-hazard-white/10 rounded-[4px] p-6 flex flex-col overflow-hidden h-[450px]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="verge-label-mono text-[10px] uppercase tracking-widest text-hazard-white flex items-center gap-2">
                        <span className="w-1 h-3 bg-jelly-mint"></span> Effectif
                    </h3>
                    <p className="verge-label-mono text-[8px] text-secondary-text uppercase tracking-widest mt-2 truncate max-w-[150px]">
                        {team || 'Club Actuel'}
                    </p>
                </div>
                <div className="px-3 py-1 bg-surface-slate rounded-[2px] verge-label-mono text-[8px] font-black text-secondary-text border border-hazard-white/5">
                    {teammates.length}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 styled-scrollbar space-y-2">
                {loading ? (
                    Array(8).fill(0).map((_, i) => (
                        <div key={i} className="h-12 bg-surface-slate rounded-[2px] animate-pulse border border-hazard-white/5" />
                    ))
                ) : teammates.length === 0 ? (
                    <div className="verge-label-mono text-secondary-text text-[9px] text-center py-10 uppercase">Aucun coéquipier identifié.</div>
                ) : (
                    teammates.map((p, i) => {
                        const score = Number(p.note_ponderee || 0);
                        
                        return (
                            <div 
                                key={p.unique_id || `${p.id}-${i}`} 
                                onClick={() => onSelectPlayer && onSelectPlayer(p.id)}
                                className="group flex items-center gap-4 p-3 bg-surface-slate hover:bg-jelly-mint border border-hazard-white/5 transition-all duration-300 cursor-pointer rounded-[2px]"
                            >
                                <div className="w-8 h-8 rounded-[2px] bg-canvas-black border border-hazard-white/10 flex items-center justify-center verge-label-mono text-[9px] text-secondary-text group-hover:text-absolute-black transition-colors uppercase font-black">
                                    {p.position_category?.slice(0,2).toUpperCase() || 'PL'}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="verge-label-mono font-black text-[10px] text-hazard-white truncate group-hover:text-absolute-black transition-colors uppercase">
                                            {p.name || p.full_name}
                                        </div>
                                        <div className={`verge-label-mono text-[10px] font-black ${score >= 70 ? 'text-jelly-mint' : 'text-hazard-white'} group-hover:text-absolute-black`}>
                                            {score.toFixed(0)}
                                        </div>
                                    </div>
                                    <div className="h-1 w-full bg-canvas-black rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-700 ease-out ${score >= 70 ? 'bg-jelly-mint' : 'bg-hazard-white/40'} group-hover:bg-absolute-black`} 
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
