import React, { useState, useEffect } from 'react';
import SimilarPlayersWidget from './SimilarPlayersWidget';
import TeammatesWidget from './TeammatesWidget';
import RecalculationPanelWidget from './RecalculationPanelWidget';
import DetailsPanelWidget from './DetailsPanelWidget';
import PerformancePanelWidget from './PerformancePanelWidget';
import PositionDistributionWidget from './PositionDistributionWidget';
import DataPanelWidget from './DataPanelWidget';
import TrendsWidget from './TrendsWidget';
import PlayerRadar from '../../PlayerRadar';
import PlayerTrends from '../dashboard/PlayerTrends';
import FavoriteToggle from '../dashboard/FavoriteToggle';
import { motion, AnimatePresence } from 'framer-motion';

import { API_BASE_URL } from '../../config';

export default function PlayerDashboard({ playerId, onClose, activeFilters = {}, rowContext = null, onSwitchPlayer = null, metricsList = [], user, onUpdateUser }) {
    const [playerData, setPlayerData] = useState(null);
    const [rankingData, setRankingData] = useState(null);
    const [availableContexts, setAvailableContexts] = useState([]);
    const [selectedContext, setSelectedContext] = useState(rowContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
    const [selectedPositionForRanking, setSelectedPositionForRanking] = useState(null);
    const [activeTab, setActiveTab] = useState('profil'); // 'profil', 'analyse', 'stats', 'reseau'
    const [analysisSubTab, setAnalysisSubTab] = useState('radar'); // 'radar' ou 'trends'
    
    // Définition du contexte actif pour le rendu et les effets
    const contextToUse = selectedContext || rowContext;

    // Reset du contexte lors du changement de joueur (Navigation)
    useEffect(() => {
        if (playerId) {
            setSelectedContext(rowContext);
            setPlayerData(null);
            setRankingData(null);
        }
    }, [playerId, rowContext]);

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
        // On ne reset plus playerData ici car c'est fait dans le useEffect de Reset ci-dessus
        
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

        // Fetch 2: Classement dynamique (Contextualisé)
        let rankingUrl = `${API_BASE_URL}/api/players/${playerId}/ranking?`;
        const rankingParams = [];
        if (finalCompetitions) rankingParams.push(`competition=${encodeURIComponent(finalCompetitions)}`);
        if (finalSeasons) rankingParams.push(`season=${encodeURIComponent(finalSeasons)}`);
        rankingUrl += rankingParams.join('&');

        fetch(rankingUrl)
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
                                    <div className="flex flex-col md:flex-row items-center md:items-end gap-4 mb-4">
                                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none">{playerData.name || playerData.full_name}</h2>
                                        <div className="shrink-0">
                                            <FavoriteToggle 
                                                playerId={playerId} 
                                                season={playerData.season}
                                                competition={playerData.competition}
                                                user={user} 
                                                onUpdateUser={onUpdateUser} 
                                            />
                                        </div>
                                    </div>
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
                                    {/* Classement Spécifique - INTERACTIF */}
                                    <div 
                                        onClick={() => setIsRankingModalOpen(true)}
                                        className="text-right cursor-pointer hover:bg-white/10 transition-all duration-300 rounded-xl p-3 border border-transparent hover:border-white/10 group"
                                    >
                                        <div className="flex items-center justify-end gap-2 mb-1">
                                            <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest group-hover:text-sky-400 transition-colors">Classement</div>
                                            {rankingData?.is_top_1 && (
                                                <span className="px-2 py-0.5 bg-yellow-500 text-black text-[9px] font-black rounded shadow-lg shadow-yellow-500/20 uppercase">Top 1%</span>
                                            )}
                                        </div>
                                        <div className="text-4xl font-black text-white flex items-baseline justify-end group-hover:scale-105 transition-transform origin-right">
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
                            <div className="lg:hidden flex bg-slate-900/80 backdrop-blur-xl p-1 rounded-xl border border-white/5 sticky top-0 z-40 shadow-2xl mb-4 overflow-x-auto scrollbar-hide">
                                {[
                                    { id: 'profil', label: 'Profil', icon: '👤' },
                                    { id: 'analyse', label: 'Analyse', icon: '📊' },
                                    { id: 'stats', label: 'Stats', icon: '🔢' },
                                    { id: 'reseau', label: 'Réseau', icon: '🤝' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${
                                            activeTab === tab.id 
                                            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' 
                                            : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                    >
                                        <span>{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-8 items-start">
                                
                                {/* Colonne GAUCHE : Profil (Onglet 'profil' sur mobile) */}
                                <div className={`${activeTab === 'profil' ? 'block' : 'hidden'} lg:block lg:col-span-3 space-y-6 md:space-y-8`}>
                                    <DetailsPanelWidget 
                                        player={playerData} 
                                        onSelectProfile={(role) => {
                                            setSelectedPositionForRanking(role);
                                            setIsRankingModalOpen(true);
                                        }}
                                    />
                                    <PositionDistributionWidget 
                                        player={playerData} 
                                        onSelectPosition={(pos) => {
                                            setSelectedPositionForRanking(pos);
                                            setIsRankingModalOpen(true);
                                        }}
                                    />
                                    <PerformancePanelWidget 
                                        player={playerData} 
                                        onSelectIndex={(indexLabel) => {
                                            setSelectedPositionForRanking(indexLabel);
                                            setIsRankingModalOpen(true);
                                        }}
                                    />
                                </div>

                                {/* Colonne MILIEU : Analyse (Onglet 'analyse' sur mobile) */}
                                <div className={`${activeTab === 'analyse' ? 'block' : 'hidden'} lg:block lg:col-span-5 space-y-6 md:space-y-8`}>
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
                                        <div className="flex justify-between items-end px-2">
                                            <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-sky-400 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-sky-400 rounded-full"></span> 
                                                {analysisSubTab === 'radar' ? 'Tactical Radar' : 'Career Evolution'}
                                            </h3>
                                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 shadow-inner">
                                                <button 
                                                    onClick={() => setAnalysisSubTab('radar')}
                                                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all duration-300 ${analysisSubTab === 'radar' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                                                > RADAR </button>
                                                <button 
                                                    onClick={() => setAnalysisSubTab('trends')}
                                                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all duration-300 ${analysisSubTab === 'trends' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                                                > TRENDS </button>
                                            </div>
                                        </div>
                                        
                                        <div className="min-h-[400px]">
                                            <AnimatePresence mode="wait">
                                                {analysisSubTab === 'radar' ? (
                                                    <motion.div 
                                                        key="radar" 
                                                        initial={{ opacity: 0, x: -20 }} 
                                                        animate={{ opacity: 1, x: 0 }} 
                                                        exit={{ opacity: 0, x: 20 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <PlayerRadar player={playerData} />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div 
                                                        key="trends" 
                                                        initial={{ opacity: 0, x: 20 }} 
                                                        animate={{ opacity: 1, x: 0 }} 
                                                        exit={{ opacity: 0, x: -20 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <PlayerTrends player={playerData} metricsList={metricsList} />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                </div>

                                {/* Colonne DROITE : Stats & Réseau (Onglets 'stats' et 'reseau' sur mobile) */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className={`${activeTab === 'stats' ? 'block' : 'hidden'} lg:block space-y-6`}>
                                        <TrendsWidget player={playerData} />
                                        <DataPanelWidget player={playerData} />
                                    </div>
                                    
                                    <div className={`${activeTab === 'reseau' ? 'block' : 'hidden'} lg:block space-y-6`}>
                                    
                                    {playerData && (
                                        <TeammatesWidget 
                                            playerId={playerId} 
                                            team={playerData?.last_club_name}
                                            competition={contextToUse?.competition}
                                            season={contextToUse?.season}
                                            onSelectPlayer={onSwitchPlayer}
                                        />
                                    )}
                                    
                                    <SimilarPlayersWidget 
                                        playerId={playerId} 
                                        competition={contextToUse?.competition}
                                        season={contextToUse?.season}
                                        onSelectPlayer={onSwitchPlayer}
                                    />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Modale de Classement Détaillé */}
                <RankingModal 
                    isOpen={isRankingModalOpen}
                    onClose={() => {
                        setIsRankingModalOpen(false);
                        setSelectedPositionForRanking(null);
                    }}
                    playerId={playerId}
                    playerName={playerData?.name || playerData?.full_name}
                    competition={contextToUse?.competition}
                    season={contextToUse?.season}
                    position={selectedPositionForRanking}
                    onSelectPlayer={(id) => {
                        if (onSwitchPlayer) {
                            onSwitchPlayer(id);
                            setIsRankingModalOpen(false);
                        } else {
                            // Fallback si pas de switch prop : on simule un clic via les outils du parent
                            console.warn("Switch player not implemented in parent");
                            setIsRankingModalOpen(false);
                        }
                    }}
                />
            </div>
        </div>
    );
}

// Sous-composant Modale de Ranking - DESIGN PREMIUM
function RankingModal({ isOpen, onClose, playerId, playerName, competition, season, position, onSelectPlayer }) {
    const [rankingList, setRankingList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('full'); // 'full' ou 'focus'

    useEffect(() => {
        if (isOpen && playerId) {
            setLoading(true);
            
            let url = `${API_BASE_URL}/api/players/${playerId}/ranking?`;
            const params = [];
            if (competition) params.push(`competition=${encodeURIComponent(competition)}`);
            if (season) params.push(`season=${encodeURIComponent(season)}`);
            if (position) params.push(`position=${encodeURIComponent(position)}`);
            url += params.join('&');

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    setRankingList(data.items || data.full_ranking || []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Ranking Detail fetch error:", err);
                    setLoading(false);
                });
        }
    }, [isOpen, playerId]);

    if (!isOpen) return null;

    // Logique pour l'onglet 'Ma Position' (Joueur cible + voisins)
    const targetIndex = rankingList.findIndex(p => (p.id === playerId || p.player_id === playerId));
    const focusList = targetIndex !== -1 
        ? rankingList.slice(Math.max(0, targetIndex - 2), Math.min(rankingList.length, targetIndex + 3))
        : [];

    const displayList = activeTab === 'focus' ? focusList : rankingList;

    return (
        <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-0 md:p-4">
            <div className="bg-slate-900 border-0 md:border md:border-slate-700/50 rounded-none md:rounded-[2.5rem] w-full max-w-2xl h-full md:max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
                
                {/* Header Premium */}
                <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-slate-900">
                    <div>
                        <h3 className="text-xl md:text-3xl font-black text-white tracking-tighter uppercase italic">{position || 'Classement'}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
                            <p className="text-sky-400 text-[10px] font-black uppercase tracking-widest truncate max-w-[200px] md:max-w-none">{playerName}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                    >
                        ✕
                    </button>
                </div>

                {/* Barre d'onglets Mobile */}
                <div className="px-6 py-3 bg-slate-900 border-b border-white/5 flex gap-2">
                    <button 
                        onClick={() => setActiveTab('full')}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'full' ? 'bg-sky-500 text-white shadow-lg' : 'bg-white/5 text-slate-500'}`}
                    >
                        Leaderboard
                    </button>
                    <button 
                        onClick={() => setActiveTab('focus')}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'focus' ? 'bg-sky-500 text-white shadow-lg' : 'bg-white/5 text-slate-500'}`}
                    >
                        Ma Position
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 styled-scrollbar bg-slate-900/30">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-6">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-sky-500/20 rounded-full"></div>
                                <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                            </div>
                            <p className="text-white font-black text-xs uppercase tracking-widest animate-pulse">Analyse du classement...</p>
                        </div>
                    ) : displayList.length > 0 ? (
                        <div className="space-y-3 md:space-y-4 pb-10">
                            {displayList.map((item, idx) => {
                                const realIdx = activeTab === 'focus' ? rankingList.indexOf(item) : idx;
                                const isTarget = item.id === playerId || item.player_id === playerId;
                                return (
                                    <div 
                                        key={idx} 
                                        onClick={() => !isTarget && onSelectPlayer(item.id || item.player_id)}
                                        className={`group flex items-center justify-between p-3 md:p-4 rounded-2xl md:rounded-3xl border transition-all duration-300 cursor-pointer ${
                                            isTarget 
                                                ? 'bg-sky-500/20 border-sky-500/40 shadow-[0_0_20px_rgba(14,165,233,0.15)] cursor-default' 
                                                : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 md:gap-5 flex-1 min-w-0">
                                            {/* Badge de Rang */}
                                            <div className={`w-8 h-8 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-lg md:rounded-2xl font-black text-xs md:text-lg ${
                                                realIdx === 0 ? 'bg-yellow-500 text-yellow-950' : 
                                                realIdx === 1 ? 'bg-slate-300 text-slate-950' : 
                                                realIdx === 2 ? 'bg-orange-600 text-orange-50' : 
                                                'bg-slate-800 text-slate-400'
                                            }`}>
                                                {realIdx + 1}
                                            </div>

                                            {/* Photo & Info */}
                                            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                                <div className="relative shrink-0">
                                                    {item.image ? (
                                                        <img src={item.image} alt="" className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover border border-white/10 bg-slate-800" />
                                                    ) : (
                                                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm md:text-xl font-black text-slate-600">
                                                            {item.name ? item.name.charAt(0) : '?'}
                                                        </div>
                                                    )}
                                                    {isTarget && <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-sky-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[8px] md:text-[10px] text-white font-black">✓</div>}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className={`text-sm md:text-base font-black truncate ${isTarget ? 'text-white' : 'text-slate-200 group-hover:text-sky-400 transition-colors'}`}>
                                                        {item.name || item.player_name}
                                                    </span>
                                                    <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase truncate">
                                                        {item.team || item.current_team_name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <div className={`text-sm md:text-lg font-black ${isTarget ? 'text-sky-400' : 'text-white'}`}>
                                                {Number(item.score).toFixed(1)}
                                            </div>
                                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">SCORE</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="text-4xl">🔎</div>
                            <div className="text-slate-500 font-bold text-sm">Aucune donnée de classement disponible pour ce contexte.</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
