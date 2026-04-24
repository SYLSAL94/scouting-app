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
  const [activeTab, setActiveTab] = useState('RESULTS'); // 'CONFIG' | 'RESULTS'
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showFilters, setShowFilters] = useState(false); // État pour le drawer mobile

  const [competitionsList, setCompetitionsList] = useState([]);
  const [positionsList, setPositionsList] = useState([]);
  const [teamsList, setTeamsList] = useState([]);
  const [seasonsList, setSeasonsList] = useState([]);
  const [metricsList, setMetricsList] = useState([]);
  const [profiles, setProfiles] = useState([]); // Liste des presets sauvegardés
  
  const defaultFilters = {
    search: '',
    competitions: [],
    positions: [],
    minAge: 16,
    maxAge: 40,
    minMinutes: 0,
    sortBy: 'xg_shot',
    teams: [],
    seasons: [],
    height: { min: 140, max: 210 },
    weight: { min: 50, max: 110 },
    playtime: { min: 0, max: 100 },
    foot: 'all',
    onLoan: false,
    useSeasonAge: false,
    marketValue: { min: 0, max: 150000000 },
    minMatches: 0
  };

  const [activeFilters, setActiveFilters] = useState(defaultFilters);
  const [pendingFilters, setPendingFilters] = useState(defaultFilters);
  const [openSection, setOpenSection] = useState('ligues');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetch('https://api-scouting.theanalyst.cloud/api/meta/competitions')
      .then(res => res.json()).then(data => setCompetitionsList(data));
    fetch('https://api-scouting.theanalyst.cloud/api/meta/positions')
      .then(res => res.json()).then(data => setPositionsList(data));
    fetch('https://api-scouting.theanalyst.cloud/api/meta/teams')
      .then(res => res.json()).then(data => setTeamsList(data));
    fetch('https://api-scouting.theanalyst.cloud/api/meta/seasons')
      .then(res => res.json()).then(data => setSeasonsList(data));
    fetch('https://api-scouting.theanalyst.cloud/api/meta/metrics')
      .then(res => res.json()).then(data => setMetricsList(data));
    
    // Fetch des profils d'analyse (Presets)
    fetch('https://api-scouting.theanalyst.cloud/api/profiles')
      .then(res => res.json()).then(data => setProfiles(data))
      .catch(err => console.error("Error fetching profiles:", err));
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
    
    // Nouveaux filtres API-First
    if (activeFilters.foot && activeFilters.foot !== 'all') url += `&foot=${activeFilters.foot}`;
    if (activeFilters.onLoan) url += `&on_loan=true`;
    if (activeFilters.useSeasonAge) url += `&use_season_age=true`;
    if (activeFilters.marketValue.min > 0) url += `&min_market_value=${activeFilters.marketValue.min}`;
    if (activeFilters.marketValue.max < 150000000) url += `&max_market_value=${activeFilters.marketValue.max}`;
    if (activeFilters.minMatches > 0) url += `&min_matches=${activeFilters.minMatches}`;

    url += `&sort_by=${activeFilters.sortBy}`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`);
        return res.json();
      })
      .then(data => {
        setPlayers(data.items || []);
        setTotalPlayers(data.total || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ ERREUR DE FETCH :", err);
        setError(err.message);
        setLoading(false);
      });
  }, [currentPage, activeFilters, dashboardView]);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers, dashboardView]);
  useEffect(() => { setCurrentPage(1); }, [activeFilters]);

  const handleApplyFilters = () => {
    setActiveFilters(pendingFilters);
    setCurrentPage(1);
    setShowFilters(false); // Fermer le drawer après application
  };

  const handleResetFilters = () => {
    setPendingFilters(defaultFilters);
    setActiveFilters(defaultFilters);
    setCurrentPage(1);
  };

  // Hydratation intelligente sans fetch réseau (Bouclier Anti-Spam)
  const loadProfile = (config) => {
    setPendingFilters({ ...defaultFilters, ...config });
    // Note: on ne touche PAS à activeFilters ici. 
    // L'utilisateur doit cliquer sur "Apply Analysis" pour valider.
  };

  const handlePlayerClick = (playerData) => {
    setSelectedPlayer(playerData);
  };

  if (!isAuthenticated) {
    return (
      <LoginScreen 
        onLoginSuccess={(userData) => {
          setUser(userData);
          setIsAuthenticated(true);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen text-[rgb(var(--text-main))] font-sans relative">
      <AnimatePresence mode="wait">
        {view === 'LANDING' ? (
          <LandingPage key="landing" onEnter={() => setView('EXPLORATION')} />
        ) : view === 'EXPLORATION' ? (
          <ExplorationPath key="exploration" 
            onSelectPath={(p) => {
               if (p === 'SCATTER') { setView('DASHBOARD'); setDashboardView('SCATTER'); }
               else if (p === 'DASHBOARD') { setView('DASHBOARD'); setDashboardView('TABLE'); }
               else if (p === 'TEAMBUILDER') { setView('TEAMBUILDER'); }
               else if (p === 'LAB') { setView('LAB'); }
               else setView(p);
            }} 
            onBack={() => setView('LANDING')} 
          />
        ) : view === 'DASHBOARD' ? (
          <motion.div 
            key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-4 md:p-8 max-w-[1700px] mx-auto min-h-screen flex flex-col"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
              <div>
                <button onClick={() => setView('EXPLORATION')} className="btn-back" style={{ marginBottom: '8px' }}>
                  <ArrowLeft size={14} /> Back to paths
                </button>
                <h1 className="text-2xl md:text-3xl xl:text-5xl font-black tracking-tighter uppercase leading-none">
                  Player <span className="text-highlight">Rankings</span>
                </h1>
              </div>
              <div className="flex flex-col gap-4 w-full">
                {/* Search Bar - Full width */}
                <div className="relative w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-sky-400/50" size={20} />
                    <input 
                        type="text" placeholder="Rechercher un joueur..." 
                        className="search-input w-full pl-14 pr-6 py-4 text-base md:text-lg"
                        value={pendingFilters.search} 
                        onChange={(e) => setPendingFilters({...pendingFilters, search: e.target.value})}
                    />
                </div>

                {/* Tabs Selector */}
                <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 xl:gap-6">
                  <div className="flex w-full xl:w-auto gap-1 bg-white/5 p-1 rounded-xl border border-white/5 h-fit">
                      <button 
                          onClick={() => setDashboardView('TABLE')}
                          className={`flex-1 xl:flex-none px-4 xl:px-6 py-3 rounded-lg text-[9px] xl:text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${dashboardView === 'TABLE' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-white/40 hover:text-white'}`}
                      >
                          Tableau
                      </button>
                      <button 
                          onClick={() => setDashboardView('SCATTER')}
                          className={`flex-1 xl:flex-none px-4 xl:px-6 py-3 rounded-lg text-[9px] xl:text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${dashboardView === 'SCATTER' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-white/40 hover:text-white'}`}
                      >
                          Analyse
                      </button>
                      <button 
                          onClick={() => setDashboardView('VERSUS')}
                          disabled={selectedPlayersToCompare.length !== 2}
                          className={`flex-1 xl:flex-none px-4 xl:px-6 py-3 rounded-lg text-[9px] xl:text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${dashboardView === 'VERSUS' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : (selectedPlayersToCompare.length === 2 ? 'text-sky-400 hover:text-sky-300 border border-sky-500/30' : 'text-white/20 cursor-not-allowed')}`}
                      >
                          Versus ({selectedPlayersToCompare.length}/2)
                      </button>
                      <button 
                          onClick={() => setDashboardView('FILTERS')}
                          className={`xl:hidden flex-1 px-4 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${dashboardView === 'FILTERS' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-white/40 hover:text-white bg-sky-500/10'}`}
                      >
                          Filtres
                      </button>
                  </div>
                </div>
              </div>
            </div>

              <div className="flex flex-col xl:flex-row gap-6 xl:gap-10">
                {/* FilterPanel: Sidebar sur Desktop, Onglet sur Mobile */}
                <div className={`
                  ${dashboardView === 'FILTERS' ? 'block' : 'hidden'}
                  xl:block xl:w-[350px] shrink-0
                `}>
                  <FilterPanel 
                    openSection={openSection} 
                    setOpenSection={setOpenSection}
                    pendingFilters={pendingFilters}
                    setPendingFilters={setPendingFilters}
                    competitionsList={competitionsList}
                    positionsList={positionsList}
                    teamsList={teamsList}
                    seasonsList={seasonsList}
                    metricsList={metricsList}
                    profiles={profiles}
                    loadProfile={loadProfile}
                    onProfileSaved={(newProfile) => setProfiles(prev => [newProfile, ...prev])}
                    handleResetFilters={handleResetFilters} 
                    handleApplyFilters={() => {
                        handleApplyFilters();
                        if (window.innerWidth < 1280) setDashboardView('TABLE');
                    }}
                    hasChanges={JSON.stringify(pendingFilters) !== JSON.stringify(activeFilters)}
                  />
                </div>

                <main className={`ranking-content-panel flex-1 flex flex-col gap-4 min-w-0 ${dashboardView === 'FILTERS' ? 'hidden xl:flex' : 'flex'}`}>
                  {dashboardView === 'TABLE' ? (
                    <RankingTable 
                        players={players} loading={loading} error={error} 
                        currentPage={currentPage} pageSize={pageSize} totalPlayers={totalPlayers} 
                        totalPages={Math.ceil(totalPlayers / pageSize)}
                        setCurrentPage={setCurrentPage} handlePlayerClick={handlePlayerClick}
                        selectedSortBy={pendingFilters.sortBy}
                        selectedPlayersToCompare={selectedPlayersToCompare}
                        setSelectedPlayersToCompare={setSelectedPlayersToCompare}
                        metricsList={metricsList}
                        useSeasonAge={activeFilters.useSeasonAge}
                        onSortChange={(val) => {
                          setPendingFilters(prev => ({ ...prev, sortBy: val }));
                        }}
                    />
                ) : dashboardView === 'VERSUS' ? (
                    <HeadToHeadContent selectedPlayersToCompare={selectedPlayersToCompare} />
                ) : (
                    <ScatterContent 
                        players={players} 
                        metricsList={metricsList} 
                        onPlayerClick={handlePlayerClick} 
                    />
                )}
              </main>
            </div>
          </motion.div>
        ) : view === 'RADAR' ? (
          <div className="p-8 max-w-[1800px] mx-auto min-h-screen flex flex-col">
             <button onClick={() => setView('EXPLORATION')} className="btn-back mb-8">
                <ArrowLeft size={14} /> Intelligence Hub
             </button>
             <div className="flex justify-between items-end mb-8">
                 <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Radar <span className="text-highlight">Profiling</span></h1>
             </div>

             {/* Mobile Tab Bar for Radar */}
              <div className="flex xl:hidden bg-white/5 p-1 rounded-xl border border-white/5 mb-6">
                <button 
                    onClick={() => setDashboardView('RADAR')}
                    className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${dashboardView !== 'FILTERS' ? 'bg-sky-500 text-white' : 'text-white/40'}`}
                >
                    Radar
                </button>
                <button 
                    onClick={() => setDashboardView('FILTERS')}
                    className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${dashboardView === 'FILTERS' ? 'bg-sky-500 text-white' : 'text-white/40'}`}
                >
                    Filtres
                </button>
              </div>
              
              <div className="flex flex-col xl:flex-row gap-6 xl:gap-10">
                <div className={`
                  ${dashboardView === 'FILTERS' ? 'block' : 'hidden'}
                  xl:block xl:w-[350px] shrink-0
                `}>
                  <FilterPanel 
                    openSection={openSection} 
                    setOpenSection={setOpenSection}
                    pendingFilters={pendingFilters}
                    setPendingFilters={setPendingFilters}
                    competitionsList={competitionsList}
                    positionsList={positionsList}
                    teamsList={teamsList}
                    seasonsList={seasonsList}
                    metricsList={metricsList}
                    handleResetFilters={handleResetFilters} 
                    handleApplyFilters={() => {
                        handleApplyFilters();
                        if (window.innerWidth < 1280) setDashboardView('RADAR');
                    }}
                    hasChanges={JSON.stringify(pendingFilters) !== JSON.stringify(activeFilters)}
                  />
                </div>
                
                <div className={`flex-1 min-w-0 ${dashboardView === 'FILTERS' ? 'hidden xl:block' : 'block'}`}>
                  <RadarDashboard 
                    players={players} 
                    metricsList={metricsList}
                    activeFilters={activeFilters}
                    initialSelectedPlayer={selectedPlayer || (selectedPlayersToCompare.length > 0 ? selectedPlayersToCompare[0] : null)}
                  />
                </div>
             </div>
          </div>
        ) : view === 'MATCHUP' ? (
          <VersusDashboard 
              metricsList={metricsList}
              activeFilters={activeFilters}
              selectedPlayersToCompare={selectedPlayersToCompare}
              setSelectedPlayersToCompare={setSelectedPlayersToCompare}
              onClose={() => setView('EXPLORATION')}
          />
        ) : view === 'TEAMBUILDER' ? (
          <div className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen flex flex-col">
             <button onClick={() => setView('EXPLORATION')} className="btn-back mb-8">
                <ArrowLeft size={14} /> Back
             </button>
             <div className="flex justify-between items-end mb-8">
                 <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Tactical <span className="text-highlight">Team Builder</span></h1>
             </div>
             
             <div className="flex gap-10 flex-1 min-h-0">
                {/* Sidebar Filtres : Cachée sur mobile car intégrée aux onglets du dashboard */}
                <div className="hidden lg:block w-[350px] shrink-0">
                  <FilterPanel 
                    openSection={openSection} 
                    setOpenSection={setOpenSection}
                    pendingFilters={pendingFilters}
                    setPendingFilters={setPendingFilters}
                    competitionsList={competitionsList}
                    positionsList={positionsList}
                    teamsList={teamsList}
                    seasonsList={seasonsList}
                    metricsList={metricsList}
                    handleResetFilters={handleResetFilters} 
                    handleApplyFilters={handleApplyFilters}
                    hasChanges={JSON.stringify(pendingFilters) !== JSON.stringify(activeFilters)}
                  />
                </div>
                
                <TeamBuilderDashboard 
                  activeFilters={activeFilters} 
                  onPlayerClick={handlePlayerClick}
                  // Props de filtrage pour l'onglet mobile
                  filterProps={{
                    openSection, setOpenSection,
                    pendingFilters, setPendingFilters,
                    competitionsList, positionsList, teamsList, seasonsList, metricsList,
                    handleResetFilters, handleApplyFilters,
                    hasChanges: JSON.stringify(pendingFilters) !== JSON.stringify(activeFilters)
                  }}
                />
             </div>
          </div>
        ) : view === 'LAB' ? (
          <div className="p-8 max-w-[1800px] mx-auto min-h-screen flex flex-col">
             <button onClick={() => setView('EXPLORATION')} className="btn-back mb-8">
                <ArrowLeft size={14} /> Back
             </button>
             <div className="flex justify-between items-end mb-8">
                 <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Joueur : <span className="text-highlight">Laboratoire</span></h1>
             </div>
             
             {/* Mobile Tab Bar for Lab */}
             <div className="flex xl:hidden bg-white/5 p-1 rounded-xl border border-white/5 mb-6">
                <button 
                    onClick={() => setDashboardView('LAB')}
                    className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${dashboardView !== 'FILTERS' ? 'bg-sky-500 text-white' : 'text-white/40'}`}
                >
                    Laboratoire
                </button>
                <button 
                    onClick={() => setDashboardView('FILTERS')}
                    className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${dashboardView === 'FILTERS' ? 'bg-sky-500 text-white' : 'text-white/40'}`}
                >
                    Filtres
                </button>
              </div>

             <div className="flex flex-col xl:flex-row gap-6 xl:gap-10">
                <div className={`
                  ${dashboardView === 'FILTERS' ? 'block' : 'hidden'}
                  xl:block xl:w-[300px] shrink-0
                `}>
                  <FilterPanel 
                    openSection={openSection} 
                    setOpenSection={setOpenSection}
                    pendingFilters={pendingFilters}
                    setPendingFilters={setPendingFilters}
                    competitionsList={competitionsList}
                    positionsList={positionsList}
                    teamsList={teamsList}
                    seasonsList={seasonsList}
                    metricsList={metricsList}
                    handleResetFilters={handleResetFilters} 
                    handleApplyFilters={() => {
                        handleApplyFilters();
                        if (window.innerWidth < 1280) setDashboardView('LAB');
                    }}
                    hasChanges={JSON.stringify(pendingFilters) !== JSON.stringify(activeFilters)}
                  />
                </div>
                
                <div className={`flex-1 min-w-0 ${dashboardView === 'FILTERS' ? 'hidden xl:block' : 'block'}`}>
                  <LabDashboard 
                    activeFilters={activeFilters} 
                    metricsList={metricsList}
                    onPlayerClick={handlePlayerClick}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                </div>
             </div>
          </div>
        ) : null}
      </AnimatePresence>

      <footer className="mt-auto py-8 border-t border-white/5 text-center text-[10px] text-[rgb(var(--text-muted))] uppercase tracking-widest">
        © 2026 The Analyst Scouting System • Cloud-Native Architecture
      </footer>

      <AnimatePresence>
        {selectedPlayer && (
            <PlayerDashboard 
                playerId={selectedPlayer.id} 
                rowContext={selectedPlayer}
                onClose={() => setSelectedPlayer(null)} 
                activeFilters={activeFilters}
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