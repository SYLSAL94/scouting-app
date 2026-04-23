import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://api-scouting.theanalyst.cloud';

export default function SimilarPlayersWidget({ playerId, competition, season }) {
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
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 shadow-2xl backdrop-blur-xl h-full flex flex-col overflow-hidden">
            {/* Header & Mode Switcher */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tighter uppercase">Analyse de Voisinage</h3>
                    <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mt-1">Zéro-Calcul Front • Moteur Advanced Search</p>
                </div>
                
                <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 shadow-inner">
                    <button 
                        onClick={() => setMode('similar')}
                        className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all ${mode === 'similar' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        SIMILAIRES
                    </button>
                    <button 
                        onClick={() => setMode('complementary')}
                        className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all ${mode === 'complementary' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        COMPLÉMENTAIRES
                    </button>
                </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-3 gap-2 mb-6">
                <select 
                    className="bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-bold rounded-lg px-2 py-2 outline-none focus:border-sky-500/50 transition-colors"
                    value={filters.season}
                    onChange={(e) => handleFilterChange('season', e.target.value)}
                >
                    <option value="">Toutes Saisons</option>
                    {meta.seasons.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select 
                    className="bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-bold rounded-lg px-2 py-2 outline-none focus:border-sky-500/50 transition-colors"
                    value={filters.competitions}
                    onChange={(e) => handleFilterChange('competitions', e.target.value)}
                >
                    <option value="">Toutes Ligues</option>
                    {meta.competitions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select 
                    className="bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-bold rounded-lg px-2 py-2 outline-none focus:border-sky-500/50 transition-colors"
                    value={filters.maxAge}
                    onChange={(e) => handleFilterChange('maxAge', e.target.value)}
                >
                    <option value="">Tout Âge</option>
                    <option value="21">U21</option>
                    <option value="23">U23</option>
                    <option value="25">U25</option>
                    <option value="28">U28</option>
                </select>
            </div>
            
            <div className="flex-1 overflow-y-auto styled-scrollbar pr-1">
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-20 bg-slate-800/40 rounded-xl animate-pulse border border-slate-700/30" />
                        ))}
                    </div>
                ) : players.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="text-4xl mb-4 opacity-20">🔍</div>
                        <p className="text-slate-400 font-bold text-sm">Aucun profil identifié</p>
                        <p className="text-[10px] text-slate-600 uppercase mt-1">Essayez de relâcher les filtres de ligue ou de saison</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {players.map((p, i) => (
                            <li key={p.unique_id || `${p.id}-${i}`} className="group bg-slate-800/30 hover:bg-slate-800/60 p-4 rounded-2xl border border-slate-700/30 hover:border-sky-500/30 transition-all flex justify-between items-center cursor-pointer shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:text-sky-400 transition-colors shadow-inner">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <div className="font-black text-slate-100 group-hover:text-sky-400 transition-colors tracking-tight">
                                            {p.name || p.full_name}
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                                            {p.last_club_name} <span className="opacity-30 mx-1">•</span> {p.season} <span className="text-slate-600 ml-1">{p.competition}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <div className="text-[9px] font-black uppercase tracking-tighter text-slate-500 mb-1">
                                        {mode === 'similar' ? 'Distance' : 'Complément.'}
                                    </div>
                                    <div className={`text-base font-black ${mode === 'similar' ? 'text-amber-500' : 'text-indigo-400'}`}>
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
