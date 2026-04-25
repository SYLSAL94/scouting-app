import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';

export default function SimilarPlayersWidget({ playerId, competition, season, onSelectPlayer }) {
    const [mode, setMode] = useState('similar'); // 'similar' or 'complementary'
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filtres UI locaux
    const [filters, setFilters] = useState({
        season: season || '',
        competitions: competition || '',
        maxAge: ''
    });

    // Synchronisation si le contexte parent change
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            season: season || '',
            competitions: competition || ''
        }));
    }, [season, competition]);

    const [meta, setMeta] = useState({
        seasons: [],
        competitions: []
    });

    // Fetch MetaData for filters
    useEffect(() => {
        Promise.all([
            fetch(`${API_BASE_URL}/api/meta/seasons`).then(res => res.json()),
            fetch(`${API_BASE_URL}/api/meta/competitions`).then(res => res.json())
        ]).then(([seasons, competitions]) => {
            setMeta({ seasons, competitions });
        }).catch(err => console.error("Metadata fetch error:", err));
    }, []);

    useEffect(() => {
        if (!playerId) return;
        setLoading(true);

        let url = `${API_BASE_URL}/api/players/${playerId}/advanced-search?mode=${mode}`;
        if (filters.season) url += `&season=${encodeURIComponent(filters.season)}`;
        if (filters.competitions) url += `&competitions=${encodeURIComponent(filters.competitions)}`;
        if (filters.maxAge) url += `&max_age=${filters.maxAge}`;
        url += `&limit=10`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setPlayers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [playerId, mode, filters]);

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-[#131313] border border-white/10 rounded-[4px] p-6 h-full flex flex-col overflow-hidden">
            {/* Header & Mode Switcher */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="verge-label-mono text-[#3cffd0] uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-1.5 h-1.5 bg-[#3cffd0]"></span> Voisinage
                    </h3>
                </div>
                
                <div className="flex bg-[#2d2d2d] p-1 rounded-[4px] border border-white/10">
                    <button 
                        onClick={() => setMode('similar')}
                        className={`px-4 py-2 rounded-[2px] verge-label-mono text-[9px] font-black transition-all ${mode === 'similar' ? 'bg-[#3cffd0] text-black' : 'text-[#949494] hover:text-white'}`}
                    >
                        SIMILAIRES
                    </button>
                    <button 
                        onClick={() => setMode('complementary')}
                        className={`px-4 py-2 rounded-[2px] verge-label-mono text-[9px] font-black transition-all ${mode === 'complementary' ? 'bg-[#5200ff] text-white' : 'text-[#949494] hover:text-white'}`}
                    >
                        PROFILES
                    </button>
                </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-3 gap-2 mb-6">
                <select 
                    className="bg-[#2d2d2d] border border-white/10 text-white verge-label-mono text-[9px] rounded-[8px] px-3 py-3 outline-none focus:border-[#3cffd0] transition-colors appearance-none cursor-pointer"
                    value={filters.season}
                    onChange={(e) => handleFilterChange('season', e.target.value)}
                >
                    <option value="">Saisons</option>
                    {meta.seasons.map(s => <option key={s} value={s} className="bg-[#131313]">{s}</option>)}
                </select>
                <select 
                    className="bg-[#2d2d2d] border border-white/10 text-white verge-label-mono text-[9px] rounded-[8px] px-3 py-3 outline-none focus:border-[#3cffd0] transition-colors appearance-none cursor-pointer"
                    value={filters.competitions}
                    onChange={(e) => handleFilterChange('competitions', e.target.value)}
                >
                    <option value="">Ligues</option>
                    {meta.competitions.map(c => <option key={c} value={c} className="bg-[#131313]">{c}</option>)}
                </select>
                <select 
                    className="bg-[#2d2d2d] border border-white/10 text-white verge-label-mono text-[9px] rounded-[8px] px-3 py-3 outline-none focus:border-[#3cffd0] transition-colors appearance-none cursor-pointer"
                    value={filters.maxAge}
                    onChange={(e) => handleFilterChange('maxAge', e.target.value)}
                >
                    <option value="">Âge Max</option>
                    <option value="21" className="bg-[#131313]">U21</option>
                    <option value="23" className="bg-[#131313]">U23</option>
                    <option value="25" className="bg-[#131313]">U25</option>
                </select>
            </div>
            
            <div className="flex-1 overflow-y-auto styled-scrollbar pr-1">
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-20 bg-[#2d2d2d] rounded-[4px] animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : players.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <p className="verge-label-mono text-[#949494] text-[9px] uppercase">Aucun profil identifié</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {players.map((p, i) => (
                                <li 
                                    key={p.unique_id || `${p.id}-${i}`} 
                                    onClick={() => onSelectPlayer && onSelectPlayer(p.id)}
                                    className="group bg-[#2d2d2d] hover:bg-[#3cffd0] p-4 rounded-[12px] border border-white/5 hover:border-[#3cffd0] transition-all flex justify-between items-center cursor-pointer"
                                >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-[6px] bg-[#131313] border border-white/10 flex items-center justify-center verge-label-mono text-[11px] text-[#949494] group-hover:text-black transition-colors shrink-0">
                                        {(i + 1).toString().padStart(2, '0')}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-[14px] text-white group-hover:text-black transition-colors uppercase truncate leading-none mb-1.5">
                                            {p.name || p.full_name}
                                        </div>
                                        <div className="verge-label-mono text-[8px] text-[#949494] uppercase tracking-[0.2em] group-hover:text-black/60 truncate">
                                            {p.last_club_name} • {p.season}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-right shrink-0">
                                    <div className="verge-label-mono text-[7px] font-black uppercase text-[#949494] group-hover:text-black/60 mb-1 tracking-widest">
                                        {mode === 'similar' ? 'DISTANCE' : 'MATCH'}
                                    </div>
                                    <div className={`verge-label-mono text-[12px] font-black group-hover:text-black transition-colors`}>
                                        {mode === 'similar' 
                                            ? Number(p.similarity_distance).toFixed(3) 
                                            : `${Number(p.complementary_score).toFixed(1)}%`
                                        }
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
