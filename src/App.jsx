import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Activity, Users, ArrowLeft, BarChart2, X } from 'lucide-react';

// Import des composants factorisés
import LandingPage from './components/layout/LandingPage';
import ExplorationPath from './components/layout/ExplorationPath';
import LoginScreen from './components/layout/LoginScreen';
import FilterPanel from './components/dashboard/FilterPanel';
import RankingTable from './components/dashboard/RankingTable';
import ScatterContent from './components/dashboard/ScatterContent';
import PlayerDashboard from './components/playerCard/PlayerDashboard';
import { HeadToHeadContent } from './components/dashboard/HeadToHeadContent';
import { PlayerSearchTile } from './components/dashboard/PlayerSearchTile';
import { VersusDashboard } from './components/dashboard/VersusDashboard';
import { RadarDashboard } from './components/dashboard/RadarDashboard';
import TeamBuilderDashboard from './components/dashboard/TeamBuilderDashboard';
import LabDashboard from './components/dashboard/LabDashboard';
import ContextualChatBot from './components/ContextualChatBot';
import GlobalPlayerSearch from './components/dashboard/GlobalPlayerSearch';
import TrendsDashboard from './components/dashboard/TrendsDashboard';
import { TrendingUp } from 'lucide-react';

function App() {
  // --- ÉTATS DE SÉCURITÉ ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const [view, setView] = useState('LANDING'); 
  const [dashboardView, setDashboardView] = useState('TABLE'); 
  const [players, setPlayers] = useState([]);
  const [selectedPlayersToCompare, setSelectedPlayersToCompare] = useState([]);

  const [totalPlayers, setTotalPlayers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('RESULTS');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [competitionsList, setCompetitionsList] = useState([]);
  const [positionsList, setPositionsList] = useState([]);
  const [teamsList, setTeamsList] = useState([]);
  const [seasonsList, setSeasonsList] = useState([]);
  const [metricsList, setMetricsList] = useState([]);
  const [profiles, setProfiles] = useState([]);
  
  const defaultFilters = {
    search: '', competitions: [], positions: [], minAge: 16, maxAge: 40,
    minMinutes: 0, sortBy: 'xg_shot', teams: [], seasons: [],
    height: { min: 140, max: 210 }, weight: { min: 50, max: 110 },
    playtime: { min: 0, max: 100 }, foot: 'all', onLoan: false,
    useSeasonAge: false, marketValue: { min: 0, max: 150000000 }, minMatches: 0
  };

  const [activeFilters, setActiveFilters] = useState(defaultFilters);
  const [pendingFilters, setPendingFilters] = useState(defaultFilters);
  const [openSection, setOpenSection] = useState('ligues');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetch('https://api-scouting.theanalyst.cloud/api/meta/competitions').then(res => res.json()).then(data => setCompetitionsList(data));
    fetch('https://api-scouting.theanalyst.cloud/api/meta/positions').then(res => res.json()).then(data => setPositionsList(data));
    fetch('https://api-scouting.theanalyst.cloud/api/meta/teams').then(res => res.json()).then(data => setTeamsList(data));
    fetch('https://api-scouting.theanalyst.cloud/api/meta/seasons').then(res => res.json()).then(data => setSeasonsList(data));
    fetch('https://api-scouting.theanalyst.cloud/api/meta/metrics').then(res => res.json()).then(data => setMetricsList(data));
    fetch('https://api-scouting.theanalyst.cloud/api/profiles').then(res => res.json()).then(data => setProfiles(data)).catch(err => console.error(err));
  }, []);

  const fetchPlayers = useCallback(() => {
    setLoading(true);
    const currentLimit = dashboardView === 'SCATTER' ? 200 : pageSize;
    let url = `https://api-scouting.theanalyst.cloud/api/players?limit=${currentLimit}&page=${currentPage}`;
    if (activeFilters.search) url += `&search=${encodeURIComponent(activeFilters.search)}`;
    if (activeFilters.competitions.length > 0) url += `&competitions=${encodeURIComponent(activeFilters.competitions.join(','))}`;
    if (activeFilters.positions.length > 0) url += `&positions=${encodeURIComponent(activeFilters.positions.join(','))}`;
    if (activeFilters.teams.length > 0) url += `&teams=${encodeURIComponent(activeFilters.teams.join(','))}`;
    if (activeFilters.seasons.length > 0) url += `&seasons=${encodeURIComponent(activeFilters.seasons.join(','))}`;
    url += `&min_age=${activeFilters.minAge}&max_age=${activeFilters.maxAge}`;
    url += `&min_height=${activeFilters.height.min}&max_height=${activeFilters.height.max}`;
    url += `&min_weight=${activeFilters.weight.min}&max_weight=${activeFilters.weight.max}`;
    if (activeFilters.playtime.min > 0) url += `&min_playtime=${activeFilters.playtime.min}`;
    if (activeFilters.foot && activeFilters.foot !== 'all') url += `&foot=${activeFilters.foot}`;
    if (activeFilters.onLoan) url += `&on_loan=true`;
    if (activeFilters.useSeasonAge) url += `&use_season_age=true`;
    if (activeFilters.marketValue.min > 0) url += `&min_market_value=${activeFilters.marketValue.min}`;
    if (activeFilters.marketValue.max < 150000000) url += `&max_market_value=${activeFilters.marketValue.max}`;
    if (activeFilters.minMatches > 0) url += `&min_matches=${activeFilters.minMatches}`;
    url += `&sort_by=${activeFilters.sortBy}`;

    fetch(url).then(res => res.json()).then(data => {
      setPlayers(data.items || []);
      setTotalPlayers(data.total || 0);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setError(err.message);
      setLoading(false);
    });
  }, [currentPage, activeFilters, dashboardView]);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers, dashboardView]);
  useEffect(() => { setCurrentPage(1); }, [activeFilters]);

  const handleApplyFilters = () => { setActiveFilters(pendingFilters); setCurrentPage(1); setShowFilters(false); };
  const handleResetFilters = () => { setPendingFilters(defaultFilters); setActiveFilters(defaultFilters); setCurrentPage(1); };
  const loadProfile = (config) => { setPendingFilters({ ...defaultFilters, ...config }); };
  const handlePlayerClick = (playerData) => { setSelectedPlayer(playerData); };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={(userData) => { setUser(userData); setIsAuthenticated(true); }} />;
  }

  return (
    <div className="min-h-screen text-[rgb(var(--text-main))] font-sans relative">
      {/* Header Premium Apple-Style */}
      {view !== 'LANDING' && (
        <div className="sticky top-0 z-[100] w-full px-4 md:px-8 bg-[#080809]/60 backdrop-blur-xl border-b border-white/5 h-20 flex items-center">
          <div className="w-full max-w-[1700px] mx-auto grid grid-cols-2 md:grid-cols-3 items-center">
            
            {/* Logo - Colonne Gauche */}
            <div className="flex items-center gap-3 cursor-pointer group w-fit" onClick={() => setView('EXPLORATION')}>
               <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform duration-300">
                  <Activity size={22} className="text-white" />
               </div>
               <div className="hidden lg:flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] leading-none">The Analyst</span>
                  <span className="text-[11px] font-bold text-sky-400 uppercase tracking-[0.2em] leading-none mt-1">Intelligence</span>
               </div>
            </div>
            
            {/* Recherche Centrale - Style Apple */}
            <div className="flex justify-center order-3 md:order-2 col-span-2 md:col-span-1 mt-4 md:mt-0">
              <div className="w-full max-w-[500px] transition-all duration-500 focus-within:max-w-[600px]">
                <GlobalPlayerSearch onPlayerSelect={handlePlayerClick} />
              </div>
            </div>

            {/* Espace Droite - Colonne Droite (Balancing) */}
            <div className="hidden md:flex justify-end order-2 md:order-3">
               <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Network Active</span>
               </div>
            </div>
            
          </div>
        </div>
      )}

      <AnimatePresence>
        {view === 'LANDING' ? (
          <LandingPage key="landing" onEnter={() => setView('EXPLORATION')} />
        ) : view === 'EXPLORATION' ? (
          <ExplorationPath key="exploration" 
            onSelectPath={(p) => {
               if (p === 'SCATTER') { setView('DASHBOARD'); setDashboardView('SCATTER'); }
               else if (p === 'DASHBOARD') { setView('DASHBOARD'); setDashboardView('TABLE'); }
               else if (p === 'TRENDS') { setView('DASHBOARD'); setDashboardView('TRENDS'); }
               else if (p === 'TEAMBUILDER') { setView('TEAMBUILDER'); }
               else if (p === 'LAB') { setView('LAB'); }
               else setView(p);
            }} 
            onBack={() => setView('LANDING')} 
          />
        ) : view === 'MATCHUP' ? (
          <div key="matchup" className="min-h-screen">
            <div className="bg-sky-500 text-white text-[10px] p-1 text-center font-bold">MODE MATCHUP ACTIF</div>
            <VersusDashboard 
              metricsList={metricsList}
              selectedPlayersToCompare={selectedPlayersToCompare}
              setSelectedPlayersToCompare={setSelectedPlayersToCompare}
              onClose={() => setView('EXPLORATION')}
              activeFilters={activeFilters}
            />
          </div>
        ) : view === 'DASHBOARD' ? (
          <motion.div 
            key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-4 md:p-8 max-w-[1700px] mx-auto min-h-screen flex flex-col"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
              <div>
                <button onClick={() => setView('EXPLORATION')} className="btn-back" style={{ marginBottom: '8px' }}>
                  <ArrowLeft size={14} /> Back to Hub
                </button>
                <h1 className="text-2xl md:text-3xl xl:text-5xl font-black tracking-tighter uppercase leading-none">
                  Player <span className="text-highlight">Rankings</span>
                </h1>
              </div>
              <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 xl:gap-6">
                  <div className="flex w-full xl:w-auto gap-1 bg-white/5 p-1 rounded-xl border border-white/5 h-fit">
                      <button onClick={() => setDashboardView('FILTERS')} className={`xl:hidden flex-1 px-4 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${dashboardView === 'FILTERS' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-white/40 hover:text-white'}`}>Filtres</button>
                      <button onClick={() => setDashboardView('TABLE')} className={`flex-1 xl:flex-none px-4 xl:px-6 py-3 rounded-lg text-[9px] xl:text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${dashboardView === 'TABLE' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-white/40 hover:text-white'}`}>Tableau</button>
                      <button onClick={() => setDashboardView('SCATTER')} className={`flex-1 xl:flex-none px-4 xl:px-6 py-3 rounded-lg text-[9px] xl:text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${dashboardView === 'SCATTER' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-white/40 hover:text-white'}`}>Analyse</button>
                      <button onClick={() => setDashboardView('TRENDS')} className={`flex-1 xl:flex-none px-4 xl:px-6 py-3 rounded-lg text-[9px] xl:text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${dashboardView === 'TRENDS' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-white/40 hover:text-white'}`}>Trends</button>
                      <button onClick={() => setDashboardView('VERSUS')} disabled={selectedPlayersToCompare.length !== 2} className={`flex-1 xl:flex-none px-4 xl:px-6 py-3 rounded-lg text-[9px] xl:text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${dashboardView === 'VERSUS' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : (selectedPlayersToCompare.length === 2 ? 'text-sky-400 hover:text-sky-300 border border-sky-500/30' : 'text-white/20 cursor-not-allowed')}`}>Versus ({selectedPlayersToCompare.length}/2)</button>
                  </div>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6 xl:gap-10">
              <div className={`xl:block xl:w-[420px] shrink-0 ${dashboardView === 'FILTERS' ? 'block' : 'hidden'}`}>
                <FilterPanel 
                  openSection={openSection} setOpenSection={setOpenSection}
                  pendingFilters={pendingFilters} setPendingFilters={setPendingFilters}
                  competitionsList={competitionsList} positionsList={positionsList} teamsList={teamsList} seasonsList={seasonsList} metricsList={metricsList}
                  profiles={profiles} loadProfile={loadProfile} onProfileSaved={(newP) => setProfiles(prev => [newP, ...prev])} 
                  onProfileDeleted={(id) => setProfiles(prev => prev.filter(p => p.id !== id))}
                  handleResetFilters={handleResetFilters} handleApplyFilters={() => { handleApplyFilters(); if (window.innerWidth < 1280) setDashboardView('TABLE'); }}
                  hasChanges={JSON.stringify(pendingFilters) !== JSON.stringify(activeFilters)}
                />
              </div>

              <main className="ranking-content-panel flex-1 flex flex-col gap-4 min-w-0">
                {dashboardView === 'TABLE' && (
                  <RankingTable 
                    players={players} 
                    loading={loading} 
                    error={error} 
                    currentPage={currentPage} 
                    pageSize={pageSize} 
                    totalPlayers={totalPlayers} 
                    totalPages={Math.ceil(totalPlayers / pageSize)} 
                    setCurrentPage={setCurrentPage} 
                    handlePlayerClick={handlePlayerClick} 
                    selectedSortBy={pendingFilters.sortBy} 
                    selectedPlayersToCompare={selectedPlayersToCompare} 
                    setSelectedPlayersToCompare={setSelectedPlayersToCompare} 
                    metricsList={metricsList} 
                    useSeasonAge={activeFilters.useSeasonAge} 
                    onSortChange={(val) => setPendingFilters(prev => ({ ...prev, sortBy: val }))} 
                  />
                )}
                {dashboardView === 'SCATTER' && (
                  <ScatterContent 
                    players={players} 
                    metricsList={metricsList} 
                    onPlayerClick={handlePlayerClick} 
                  />
                )}
                {dashboardView === 'TRENDS' && (
                  <TrendsDashboard metricsList={metricsList} />
                )}
                {dashboardView === 'VERSUS' && (
                  <div className="flex-1 bg-slate-900/50 rounded-3xl border border-white/5 p-8 flex flex-col items-center justify-center gap-6">
                    <div className="w-20 h-20 bg-sky-500/20 rounded-full flex items-center justify-center">
                       <Users className="text-sky-400" size={40} />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Mode Versus Activé</h2>
                    <button 
                      onClick={() => setView('MATCHUP')}
                      className="px-10 py-4 bg-sky-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-sky-500/20 hover:scale-105 transition-all"
                    > Lancer la comparaison </button>
                  </div>
                )}
              </main>
            </div>
          </motion.div>
        ) : view === 'RADAR' ? (
          <div key="radar" className="p-8 max-w-[1800px] mx-auto min-h-screen flex flex-col">
             <button onClick={() => setView('EXPLORATION')} className="btn-back mb-8"><ArrowLeft size={14} /> Intelligence Hub</button>
             <RadarDashboard players={players} metricsList={metricsList} activeFilters={activeFilters} initialSelectedPlayer={selectedPlayer || (selectedPlayersToCompare.length > 0 ? selectedPlayersToCompare[0] : null)} />
          </div>
        ) : view === 'TEAMBUILDER' ? (
          <div key="teambuilder" className="w-full px-4 md:px-8 min-h-screen flex flex-col">
             <div className="max-w-[1700px] mx-auto w-full flex flex-col flex-1">
                <button onClick={() => setView('EXPLORATION')} className="btn-back mt-8 mb-4 md:mb-8"><ArrowLeft size={14} /> Intelligence Hub</button>
                <TeamBuilderDashboard activeFilters={activeFilters} onPlayerClick={handlePlayerClick} filterProps={{ openSection, setOpenSection, pendingFilters, setPendingFilters, competitionsList, positionsList, teamsList, seasonsList, metricsList, handleResetFilters, handleApplyFilters, hasChanges: JSON.stringify(pendingFilters) !== JSON.stringify(activeFilters) }} />
             </div>
          </div>
        ) : view === 'LAB' ? (
          <div key="lab" className="p-8 max-w-[1800px] mx-auto min-h-screen flex flex-col">
             <button onClick={() => setView('EXPLORATION')} className="btn-back mb-8"><ArrowLeft size={14} /> Back</button>
             <LabDashboard activeFilters={activeFilters} metricsList={metricsList} onPlayerClick={handlePlayerClick} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        ) : null}
      </AnimatePresence>

      <footer className="mt-auto py-8 border-t border-white/5 text-center text-[10px] text-[rgb(var(--text-muted))] uppercase tracking-widest">© 2026 THE ANALYST SCOUTING SYSTEM • CLOUD-NATIVE ARCHITECTURE</footer>

      <ContextualChatBot selectedPlayer={selectedPlayer} players={players} activeFilters={activeFilters} />

      <AnimatePresence>
        {selectedPlayer && (
            <PlayerDashboard 
              playerId={selectedPlayer.id} 
              rowContext={selectedPlayer} 
              onClose={() => setSelectedPlayer(null)} 
              activeFilters={activeFilters} 
              metricsList={metricsList}
              onSwitchPlayer={(id) => { 
                const newPlayer = players.find(p => p.id === id) || { id }; 
                setSelectedPlayer(newPlayer); 
              }} 
            />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;