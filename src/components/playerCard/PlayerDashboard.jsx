import React, { useState, useEffect } from 'react';
import SimilarPlayersWidget from './SimilarPlayersWidget';
import TeammatesWidget from './TeammatesWidget';
import RecalculationPanelWidget from './RecalculationPanelWidget';
import DetailsPanelWidget from './DetailsPanelWidget';
import PerformancePanelWidget from './PerformancePanelWidget';
import PositionDistributionWidget from './PositionDistributionWidget';
import DataPanelWidget from './DataPanelWidget';
import PlayerRadar from '../../PlayerRadar';

const API_BASE_URL = 'https://api-scouting.theanalyst.cloud';

export default function PlayerDashboard({ playerId, onClose, activeFilters = {}, rowContext = null }) {
    const [playerData, setPlayerData] = useState(null);
    const [rankingData, setRankingData] = useState(null);
    const [availableContexts, setAvailableContexts] = useState([]);
    const [selectedContext, setSelectedContext] = useState(rowContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Définition du contexte actif pour le rendu et les effets
    const contextToUse = selectedContext || rowContext;

    // Fetch initial des contextes disponibles
    useEffect(() => {
        if (!playerId) return;
        fetch(`${API_BASE_URL}/api/players/${playerId}/contexts`)
            .then(res => res.json())
            .then(data => setAvailableContexts(data))
            .catch(err => console.error("Error fetching contexts:", err));
    }, [playerId]);

    useEffect(() => {
        if (!playerId) return;
        setLoading(true);
        setError(null);
        
        // Fetch 1: Profil complet avec propagation du contexte
        // Priorité : selectedContext (Switcher) > rowContext (Clic liste) > activeFilters (Sidebar)
        let profileUrl = `${API_BASE_URL}/api/players/${playerId}?`;
        const queryParams = [];

        const finalCompetitions = contextToUse?.competition || (activeFilters?.competitions?.length > 0 ? activeFilters.competitions.join(',') : null);
        const finalSeasons = contextToUse?.season || (activeFilters?.seasons?.length > 0 ? activeFilters.seasons.join(',') : null);
        const finalTeams = contextToUse?.last_club_name || contextToUse?.team || (activeFilters?.teams?.length > 0 ? activeFilters.teams.join(',') : null);

        if (finalCompetitions) queryParams.push(`competitions=${encodeURIComponent(finalCompetitions)}`);
        if (finalSeasons) queryParams.push(`seasons=${encodeURIComponent(finalSeasons)}`);
        if (finalTeams) queryParams.push(`teams=${encodeURIComponent(finalTeams)}`);
        
        profileUrl += queryParams.join('&');

        fetch(profileUrl)
            .then(res => {
                if (!res.ok) throw new Error('Erreur lors du chargement du profil');
                return res.json();
            })
            .then(data => {
                console.log("🚨 DEBUG PAYLOAD API :", data);
                
                // Désarchivage multi-niveaux (items, recordToDisplay ou root)
                let cleanData = null;
                if (data && data.recordToDisplay) {
                    cleanData = data.recordToDisplay;
                } else if (data && data.items && Array.isArray(data.items)) {
                    cleanData = data.items[0];
                } else if (Array.isArray(data)) {
                    cleanData = data[0];
                } else {
                    cleanData = data;
                }

                setPlayerData(cleanData || null);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });

        // Fetch 2: Classement dynamique
        fetch(`${API_BASE_URL}/api/players/${playerId}/ranking`)
            .then(res => res.json())
            .then(data => setRankingData(data))
            .catch(err => console.error("Ranking fetch error:", err));

    }, [playerId, activeFilters, selectedContext]);

    if (!playerId) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center md:p-6 overflow-hidden">
            <div className="w-full h-full md:max-w-7xl md:max-h-[90vh] bg-slate-900 border-t border-slate-700 md:border md:rounded-2xl flex flex-col relative overflow-hidden">
                
                {/* Header Actions */}
                <div className="absolute top-4 right-4 z-20 flex gap-3">
                    {/* Context Switcher - ÉLÉGANT */}
                    {availableContexts.length > 1 && (
                        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-full px-3 py-1 shadow-lg">
                            <span className="text-[9px] font-black uppercase text-sky-400 tracking-tighter">Contexte</span>
                            <select 
                                className="bg-transparent text-white text-[11px] font-bold outline-none cursor-pointer"
                                value={availableContexts.findIndex(c => 
                                    c.competition === (selectedContext?.competition || rowContext?.competition) && 
                                    c.season === (selectedContext?.season || rowContext?.season)
                                )}
                                onChange={(e) => {
                                    const idx = e.target.value;
                                    setSelectedContext(availableContexts[idx]);
                                }}
                            >
                                {availableContexts.map((ctx, idx) => (
                                    <option key={idx} value={idx} className="bg-slate-900 text-white">
                                        {ctx.competition} ({ctx.season})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700 shadow-lg"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto styled-scrollbar p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-full flex-col gap-4">
                            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-400 font-medium">Chargement du profil Cloud-Native...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full flex-col gap-2">
                            <div className="text-red-500 text-4xl">⚠️</div>
                            <p className="text-slate-300 font-bold text-lg">{error}</p>
                            <button onClick={onClose} className="mt-4 px-6 py-2 bg-slate-800 rounded-lg text-white font-medium hover:bg-slate-700">Retour</button>
                        </div>
                    ) : playerData ? (
                        <div className="space-y-8">
                            
                            {/* En-tête du joueur - PREMIUM LAYOUT */}
                            <div className="flex flex-col md:flex-row items-center gap-6 p-4 md:p-8 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl shadow-inner relative overflow-hidden">
                                {playerData.image ? (
                                    <img src={playerData.image} alt={playerData.name} className="w-28 h-28 rounded-full object-cover border-4 border-slate-700 shadow-2xl bg-slate-800 relative z-10" />
                                ) : (
                                    <div className="w-28 h-28 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-4xl font-black text-slate-600 relative z-10">
                                        {playerData?.name ? String(playerData.name).charAt(0) : '?'}
                                    </div>
                                )}
                                
                                <div className="text-center md:text-left flex-1 min-w-0 relative z-10">
                                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight">{playerData.name || playerData.full_name}</h2>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                                        <span className="px-3 py-1 bg-sky-500 text-white rounded-md shadow-lg shadow-sky-500/20">{playerData.position_category}</span>
                                        <span className="opacity-30 text-lg">•</span>
                                        <span className="text-slate-200">{playerData.last_club_name}</span>
                                        <span className="opacity-30 text-lg">•</span>
                                        <span>{playerData.season}</span>
                                        <span className="opacity-30 text-lg">•</span>
                                        <span className="truncate text-sky-400">{playerData.competition}</span>
                                    </div>
                                    <div className="flex gap-4 mt-6 justify-center md:justify-start">
                                        <div className="px-4 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-[11px] font-black text-slate-300 shadow-sm">{playerData.season_age || playerData.age} ANS</div>
                                        <div className="px-4 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-[11px] font-black text-slate-300 shadow-sm">PIED {playerData?.foot ? String(playerData.foot).toUpperCase() : 'DROIT'}</div>
                                    </div>
                                </div>

                                {/* Classement & Stats - Haut Droite */}
                                <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 relative z-10">
                                    {/* Classement Spécifique */}
                                    <div className="text-right">
                                        <div className="flex items-center justify-end gap-2 mb-1">
                                            <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Classement</div>
                                            {rankingData?.is_top_1 && (
                                                <span className="px-2 py-0.5 bg-yellow-500 text-black text-[9px] font-black rounded shadow-lg shadow-yellow-500/20 uppercase">Top 1%</span>
                                            )}
                                        </div>
                                        <div className="text-4xl font-black text-white flex items-baseline justify-end">
                                            {rankingData?.rank || '-'}<span className="text-slate-600 text-xl ml-1">/ {rankingData?.total || '-'}</span>
                                        </div>
                                    </div>

                                    {/* Score Tiles */}
                                    <div className="flex gap-3 md:gap-4">
                                        <div className="bg-slate-800/80 border border-white/5 rounded-2xl p-3 md:p-5 text-center min-w-[80px] md:min-w-[130px] shadow-2xl backdrop-blur-md">
                                            <div className="text-[8px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Note Globale</div>
                                            <div className="text-3xl md:text-5xl font-black text-white leading-none tracking-tighter">
                                                {Math.round(playerData.note_globale || 64)}
                                            </div>
                                        </div>
                                        <div className="bg-sky-500 border border-sky-400 rounded-2xl p-3 md:p-5 text-center min-w-[80px] md:min-w-[130px] shadow-2xl shadow-sky-500/20">
                                            <div className="text-[8px] md:text-[10px] font-black uppercase text-white/80 tracking-widest mb-1">Note Pondérée</div>
                                            <div className="text-3xl md:text-5xl font-black text-white leading-none tracking-tighter">
                                                {Math.round(playerData.note_ponderee || 75)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Grille principale - Triple Colonne */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-8 items-start">
                                
                                {/* Colonne GAUCHE : Details & Gauges (4/12) */}
                                <div className="lg:col-span-4 space-y-6 md:space-y-8">
                                    <DetailsPanelWidget player={playerData} />
                                    <PositionDistributionWidget player={playerData} />
                                    <PerformancePanelWidget player={playerData} />
                                </div>

                                {/* Colonne MILIEU : Radar, Recalcul, Similar (4/12) */}
                                <div className="lg:col-span-4 space-y-6 md:space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-sky-400 flex items-center gap-2 px-2">
                                            <span className="w-2 h-2 bg-sky-400 rounded-full"></span> Analyse Comparative
                                        </h3>
                                        <RecalculationPanelWidget 
                                            playerId={playerId}
                                            onRecalculated={(newData) => {
                                                if (newData && newData.recordToDisplay) {
                                                    // Fusion des données pour préserver les métadonnées initiales (nom, photo)
                                                    setPlayerData(prev => ({
                                                        ...prev,
                                                        ...newData.recordToDisplay
                                                    }));
                                                    // Mise à jour du classement dans le header
                                                    setRankingData({
                                                        rank: newData.rank,
                                                        total: newData.populationCount,
                                                        is_recalculated: true
                                                    });
                                                }
                                            }}
                                        />
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-sky-400 flex items-center gap-2 px-2">
                                            <span className="w-2 h-2 bg-sky-400 rounded-full"></span> Tactical Radar
                                        </h3>
                                        <PlayerRadar player={playerData} />
                                    </div>

                                    <SimilarPlayersWidget 
                                        playerId={playerId} 
                                        competition={contextToUse?.competition}
                                        season={contextToUse?.season}
                                    />
                                </div>

                                {/* Colonne DROITE : Table & Teammates (4/12) */}
                                <div className="lg:col-span-4 space-y-6 md:space-y-8 h-full flex flex-col">
                                    <div className="flex-1 md:min-h-[500px]">
                                        <DataPanelWidget player={playerData} />
                                    </div>
                                    <TeammatesWidget 
                                        playerId={playerId} 
                                        competition={contextToUse?.competition}
                                        season={contextToUse?.season}
                                        team={contextToUse?.last_club_name}
                                    />
                                </div>
                                
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
