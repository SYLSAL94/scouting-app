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
import { ChevronDown } from 'lucide-react';

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
    const [isAnalyseExpanded, setIsAnalyseExpanded] = useState(false);
    
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
                let cleanData = data.recordToDisplay || (data.items && data.items[0]) || (Array.isArray(data) ? data[0] : data);
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
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center md:p-6 overflow-hidden">
            <div className="w-full h-full md:max-w-7xl md:max-h-[95vh] bg-[#131313] border-t border-white md:border md:border-white/20 flex flex-col relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]">
                
                {/* Header Actions */}
                <div className="absolute top-8 right-8 z-20 flex gap-4">
                    {/* Context Switcher - VERGE STYLE */}
                    {availableContexts.length > 1 && (
                        <div className="flex items-center gap-3 bg-[#2d2d2d] border border-white/10 rounded-[4px] px-4 py-2">
                            <span className="verge-label-mono text-[9px] text-[#3cffd0] uppercase">Contexte</span>
                            <select 
                                className="bg-transparent text-white text-[11px] font-black outline-none cursor-pointer verge-label-mono"
                                value={availableContexts.findIndex(c => 
                                    c.competition === (selectedContext?.competition || rowContext?.competition) && 
                                    c.season === (selectedContext?.season || rowContext?.season)
                                )}
                                onChange={(e) => setSelectedContext(availableContexts[e.target.value])}
                            >
                                {availableContexts.map((ctx, idx) => (
                                    <option key={idx} value={idx} className="bg-[#131313] text-white">
                                        {ctx.competition} ({ctx.season})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 flex items-center justify-center bg-[#2d2d2d] text-white hover:bg-white hover:text-black transition-all border border-white/10 rounded-[4px]"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto styled-scrollbar p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-full flex-col gap-6 bg-[#131313]">
                            <div className="w-12 h-12 border-2 border-[#3cffd0] border-t-transparent animate-spin"></div>
                            <p className="verge-label-mono text-[#949494] text-xs uppercase tracking-widest">Initialisation Cloud-Native...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full flex-col gap-4 bg-[#131313]">
                            <p className="verge-h3 text-white">ERREUR DE CHARGEMENT</p>
                            <button onClick={onClose} className="px-8 py-3 bg-white text-black verge-label-mono text-[10px] font-black">RETOUR</button>
                        </div>
                    ) : playerData ? (
                        <div className="space-y-0">
                            
                            {/* En-tête du joueur - THE VERGE STRUCTURED LAYOUT */}
                            <div className="flex flex-col lg:grid lg:grid-cols-12 items-center lg:items-start gap-12 p-10 md:p-16 lg:p-24 bg-[#131313] border-b border-white/10 relative overflow-hidden">
                                
                                {/* Colonne 1: Photo - Fixed Width */}
                                <div className="lg:col-span-3 flex justify-center lg:justify-start">
                                    <div className="relative group">
                                        <div className="absolute -inset-1 bg-[#3cffd0] opacity-10 group-hover:opacity-30 blur-[2px] transition-all duration-500 rounded-[2px]" />
                                        <div className="relative w-48 h-48 md:w-64 md:h-64 bg-[#2d2d2d] border border-white/20 rounded-[2px] overflow-hidden p-1.5">
                                            {playerData.image ? (
                                                <img src={playerData.image} alt={playerData.name} className="w-full h-full object-cover rounded-[1px]" />
                                            ) : (
                                                <div className="w-full h-full bg-[#131313] flex items-center justify-center text-8xl font-black text-[#2d2d2d]">
                                                    {playerData?.name ? String(playerData.name).charAt(0) : '?'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-[#3cffd0]" />
                                    </div>
                                </div>
                                
                                {/* Colonne 2: Identity - Flexible */}
                                <div className="lg:col-span-5 text-center lg:text-left flex flex-col justify-center h-full min-w-0">
                                    <div className="flex flex-col gap-2 mb-6">
                                        <span className="verge-kicker">{playerData.position_category}</span>
                                        <div className="flex items-center justify-center lg:justify-start gap-6">
                                            <h2 className="text-6xl md:text-7xl lg:text-8xl font-black text-white uppercase leading-[0.85] tracking-tighter break-words">
                                                {playerData.name || playerData.full_name}
                                            </h2>
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
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 verge-label-mono text-[9px] md:text-[10px] uppercase font-black tracking-[0.15em]">
                                            <span className="text-[#3cffd0] bg-[#3cffd0]/10 px-3 py-1.5 border border-[#3cffd0]/20">{playerData.last_club_name}</span>
                                            <span className="text-white/20">/</span>
                                            <span className="text-[#949494]">{playerData.season}</span>
                                            <span className="text-white/20">/</span>
                                            <span className="text-white truncate max-w-[200px]">{playerData.competition}</span>
                                        </div>

                                        <div className="flex gap-3 justify-center lg:justify-start">
                                            <div className="bg-[#2d2d2d] px-5 py-2.5 verge-label-mono text-[10px] text-white border border-white/5 rounded-[2px] font-black">{playerData.season_age || playerData.age} ANS</div>
                                            <div className="bg-[#2d2d2d] px-5 py-2.5 verge-label-mono text-[10px] text-white border border-white/5 rounded-[2px] font-black uppercase">PIED {playerData?.foot || 'DROIT'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Colonne 3: Analytics - Ranking & Scores */}
                                <div className="lg:col-span-4 w-full flex flex-col gap-10 lg:items-end justify-center">
                                    {/* Ranking Section Moved Here to avoid collision */}
                                    <div 
                                        onClick={() => setIsRankingModalOpen(true)}
                                        className="cursor-pointer group flex flex-col lg:items-end w-full lg:w-auto"
                                    >
                                        <div className="verge-label-mono text-[10px] group-hover:text-[#3cffd0] transition-colors mb-4 uppercase text-[#949494] tracking-[0.2em] font-black">Classement Population</div>
                                        <div className="text-6xl lg:text-7xl font-black text-white flex items-baseline gap-3 group-hover:text-[#3cffd0] transition-all">
                                            {(rankingData?.rank && rankingData.rank > 0) ? rankingData.rank : '-'}<span className="text-[#949494] text-2xl opacity-30 font-black">/ {rankingData?.total || '-'}</span>
                                        </div>
                                    </div>

                                    {/* Score Tiles */}
                                    <div className="grid grid-cols-2 lg:flex lg:flex-row gap-4 w-full lg:w-auto">
                                        <div className="bg-[#131313] border border-white/10 p-8 flex-1 lg:min-w-[150px] text-center rounded-[4px]">
                                            <div className="verge-label-mono text-[9px] mb-4 text-[#949494] uppercase tracking-widest font-black opacity-60">Note Globale</div>
                                            <div className="text-6xl font-black text-white leading-none tracking-tighter">
                                                {Math.round(playerData.note_globale || 64)}
                                            </div>
                                        </div>
                                        
                                        <div className="bg-[#3cffd0] p-8 flex-1 lg:min-w-[150px] text-center rounded-[4px] shadow-[0_0_40px_rgba(60,255,208,0.1)]">
                                            <div className="verge-label-mono text-[9px] text-black/60 mb-4 uppercase tracking-widest font-black">Note Pondérée</div>
                                            <div className="text-6xl font-black text-black leading-none tracking-tighter">
                                                {Math.round(playerData.note_ponderee || 75)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Mobile */}
                            <div className="lg:hidden flex bg-[#131313] p-4 border-b border-white/10 sticky top-0 z-40 overflow-x-auto scrollbar-hide gap-3">
                                {[
                                    { id: 'profil', label: 'PROFIL' },
                                    { id: 'analyse', label: 'ANALYSE' },
                                    { id: 'stats', label: 'STATS' },
                                    { id: 'reseau', label: 'VOISINAGE' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`shrink-0 px-6 py-3 verge-label-mono text-[10px] font-black transition-all ${
                                            activeTab === tab.id ? 'bg-[#3cffd0] text-black' : 'text-[#949494] bg-[#2d2d2d]'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Grille principale - Triple Colonne */}
                            <div className="p-8 md:p-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 items-start">
                                    
                                    {/* Colonne GAUCHE : Profil */}
                                    <div className={`${activeTab === 'profil' ? 'block' : 'hidden'} lg:block lg:col-span-3 space-y-10`}>
                                        <DetailsPanelWidget 
                                            player={playerData} 
                                            onSelectProfile={(role) => {
                                                setSelectedPositionForRanking(role);
                                                setIsRankingModalOpen(true);
                                            }}
                                        />
                                        <PositionDistributionWidget player={playerData} />
                                        <PerformancePanelWidget player={playerData} />
                                    </div>

                                    {/* Colonne MILIEU : Analyse */}
                                    <div className={`${activeTab === 'analyse' ? 'block' : 'hidden'} lg:block lg:col-span-5 space-y-10`}>
                                        <div className="space-y-6">
                                            <button 
                                                onClick={() => setIsAnalyseExpanded(!isAnalyseExpanded)}
                                                className="w-full flex items-center justify-between px-2 hover:opacity-80 transition-opacity"
                                            >
                                                <h3 className="verge-label-mono text-[#3cffd0] flex items-center gap-3 uppercase text-[11px] tracking-[0.2em]">
                                                    <span className={`w-1.5 h-1.5 transition-all duration-500 ${isAnalyseExpanded ? 'bg-[#3cffd0] shadow-[0_0_8px_#3cffd0]' : 'bg-[#949494]'}`}></span> 
                                                    Analyse Comparative
                                                </h3>
                                                <motion.div animate={{ rotate: isAnalyseExpanded ? 180 : 0 }} className={isAnalyseExpanded ? "text-[#3cffd0]" : "text-[#949494]"}>
                                                    <ChevronDown size={14} />
                                                </motion.div>
                                            </button>
                                            
                                            <AnimatePresence>
                                                {isAnalyseExpanded && (
                                                    <motion.div 
                                                        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="bg-[#131313] border border-white/10 p-2"
                                                    >
                                                        <RecalculationPanelWidget 
                                                            playerId={playerId}
                                                            onRecalculated={(newData) => {
                                                                if (newData && newData.recordToDisplay) {
                                                                    setPlayerData(prev => ({ ...prev, ...newData.recordToDisplay }));
                                                                    setRankingData({ rank: newData.rank, total: newData.populationCount, is_recalculated: true });
                                                                }
                                                            }}
                                                        />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center px-2">
                                                <h3 className="verge-label-mono text-[#3cffd0] flex items-center gap-3 uppercase text-[11px] tracking-[0.2em]">
                                                    <span className="w-1.5 h-1.5 bg-[#3cffd0]"></span> 
                                                    Tactical Metrics
                                                </h3>
                                                <div className="flex bg-[#2d2d2d] p-1 rounded-[2px]">
                                                    <button 
                                                        onClick={() => setAnalysisSubTab('radar')}
                                                        className={`px-5 py-2 verge-label-mono text-[9px] font-black tracking-widest transition-all rounded-[1px] ${analysisSubTab === 'radar' ? 'bg-[#3cffd0] text-black shadow-[0_0_15px_rgba(60,255,208,0.2)]' : 'text-[#949494] hover:text-white'}`}
                                                    > RADAR </button>
                                                    <button 
                                                        onClick={() => setAnalysisSubTab('trends')}
                                                        className={`px-5 py-2 verge-label-mono text-[9px] font-black tracking-widest transition-all rounded-[1px] ${analysisSubTab === 'trends' ? 'bg-[#3cffd0] text-black shadow-[0_0_15px_rgba(60,255,208,0.2)]' : 'text-[#949494] hover:text-white'}`}
                                                    > TRENDS </button>
                                                </div>
                                            </div>
                                            
                                            <div className="min-h-[450px] bg-[#131313] border border-white/10 p-8 flex items-center justify-center">
                                                <AnimatePresence mode="wait">
                                                    {analysisSubTab === 'radar' ? (
                                                        <motion.div key="radar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                                                            <PlayerRadar player={playerData} />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div key="trends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                                                            <PlayerTrends player={playerData} metricsList={metricsList} />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <SimilarPlayersWidget 
                                            playerId={playerId} 
                                            competition={contextToUse?.competition}
                                            season={contextToUse?.season}
                                            onSelectPlayer={onSwitchPlayer}
                                        />
                                    </div>

                                    {/* Colonne DROITE : Stats & Voisinage */}
                                    <div className="lg:col-span-4 space-y-10">
                                        <div className={`${activeTab === 'stats' ? 'block' : 'hidden'} lg:block space-y-10`}>
                                            <TrendsWidget player={playerData} />
                                            <DataPanelWidget player={playerData} />
                                        </div>
                                        
                                        <div className={`${activeTab === 'reseau' ? 'block' : 'hidden'} lg:block space-y-10`}>
                                            {playerData && (
                                                <TeammatesWidget 
                                                    playerId={playerId} 
                                                    team={playerData?.last_club_name}
                                                    competition={contextToUse?.competition}
                                                    season={contextToUse?.season}
                                                    onSelectPlayer={onSwitchPlayer}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Modale de Classement Détaillé */}
                <RankingModal 
                    isOpen={isRankingModalOpen}
                    onClose={() => { setIsRankingModalOpen(false); setSelectedPositionForRanking(null); }}
                    playerId={playerId}
                    playerName={playerData?.name || playerData?.full_name}
                    competition={contextToUse?.competition}
                    season={contextToUse?.season}
                    position={selectedPositionForRanking}
                    onSelectPlayer={(id) => { onSwitchPlayer && onSwitchPlayer(id); setIsRankingModalOpen(false); }}
                />
            </div>
        </div>
    );
}

// Ranking Modal Refactored for Verge
function RankingModal({ isOpen, onClose, playerId, playerName, competition, season, position, onSelectPlayer }) {
    const [rankingList, setRankingList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('full');

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
                .catch(err => { console.error(err); setLoading(false); });
        }
    }, [isOpen, playerId]);

    if (!isOpen) return null;

    const targetIndex = rankingList.findIndex(p => (String(p.id || p.player_id) === String(playerId)));
    const displayList = activeTab === 'focus' && targetIndex !== -1 
        ? rankingList.slice(Math.max(0, targetIndex - 2), Math.min(rankingList.length, targetIndex + 3))
        : rankingList;

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4">
            <div className="bg-[#131313] border border-white/20 rounded-[4px] w-full max-w-2xl h-full max-h-[85vh] flex flex-col overflow-hidden">
                <div className="p-10 border-b border-white/10 flex justify-between items-center bg-[#131313]">
                    <div>
                        <h3 className="verge-h3 text-white uppercase italic">{position || 'LEADERBOARD'}</h3>
                        <p className="verge-label-mono text-[#3cffd0] text-[10px] mt-2 uppercase font-black tracking-widest">{playerName}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-[#2d2d2d] text-white hover:bg-white hover:text-black border border-white/10 rounded-[4px]">✕</button>
                </div>

                <div className="px-10 py-6 bg-[#131313] border-b border-white/10 flex gap-4">
                    <button onClick={() => setActiveTab('full')} className={`flex-1 py-3 rounded-[2px] verge-label-mono text-[10px] font-black transition-all ${activeTab === 'full' ? 'bg-[#3cffd0] text-black' : 'bg-[#2d2d2d] text-[#949494]'}`}>GLOBAL</button>
                    <button onClick={() => setActiveTab('focus')} className={`flex-1 py-3 rounded-[2px] verge-label-mono text-[10px] font-black transition-all ${activeTab === 'focus' ? 'bg-[#3cffd0] text-black' : 'bg-[#2d2d2d] text-[#949494]'}`}>FOCUS</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-10 space-y-3 styled-scrollbar bg-[#131313]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4"><div className="w-8 h-8 border-2 border-[#3cffd0] border-t-transparent animate-spin"></div></div>
                    ) : (
                        displayList.map((item, idx) => {
                            const realIdx = activeTab === 'focus' ? rankingList.indexOf(item) : idx;
                            const isTarget = item.id === playerId || item.player_id === playerId;
                            return (
                                <div key={idx} onClick={() => !isTarget && onSelectPlayer(item.id || item.player_id)} className={`flex items-center justify-between p-4 border transition-all cursor-pointer ${isTarget ? 'bg-[#3cffd0] border-[#3cffd0] text-black' : 'bg-[#2d2d2d] border-white/5 hover:border-white/20'}`}>
                                    <div className="flex items-center gap-6 flex-1 min-w-0">
                                        <div className={`w-10 h-10 shrink-0 flex items-center justify-center verge-label-mono text-[14px] font-black ${isTarget ? 'bg-black text-[#3cffd0]' : 'bg-[#131313] text-white'}`}>{realIdx + 1}</div>
                                        <div className="min-w-0">
                                            <div className={`text-sm font-black uppercase truncate ${isTarget ? 'text-black' : 'text-white'}`}>{item.name || item.player_name}</div>
                                            <div className={`verge-label-mono text-[8px] uppercase tracking-widest truncate ${isTarget ? 'text-black/60' : 'text-[#949494]'}`}>{item.team || item.current_team_name}</div>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className={`text-xl font-black ${isTarget ? 'text-black' : 'text-white'}`}>{Number(item.score).toFixed(1)}</div>
                                        <div className={`verge-label-mono text-[7px] uppercase ${isTarget ? 'text-black/40' : 'text-[#949494]'}`}>PTS</div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
