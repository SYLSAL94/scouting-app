import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Activity, Users, ArrowLeft, BarChart2, X, SlidersHorizontal } from 'lucide-react';

// Import des composants factorisés
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
import UserMenu from './components/layout/UserMenu';
import SettingsModal from './components/layout/SettingsModal';
import { TrendingUp } from 'lucide-react';
import { API_BASE_URL } from './config';

function App() {
  // --- ÉTATS DE SÉCURITÉ ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const [view, setView] = useState('EXPLORATION'); 
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
  
  // États Paramètres Globaux
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile');
  
  const defaultFilters = {
    search: '', competitions: [], positions: [], minAge: 16, maxAge: 40,
    minMinutes: 0, sortBy: 'xg_shot', teams: [], seasons: [],
    height: { min: 140, max: 210 }, weight: { min: 50, max: 110 },
    playtime: { min: 0, max: 100 }, foot: 'all', onLoan: false,
    useSeasonAge: false, marketValue: { min: 0, max: 150000000 }, minMatches: 0,
    consolidate: false
  };

  const [activeFilters, setActiveFilters] = useState(defaultFilters);
  const [pendingFilters, setPendingFilters] = useState(defaultFilters);
  const [openSection, setOpenSection] = useState('ligues');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${API_BASE_URL}/api/meta/competitions`).then(res => res.json()).then(data => setCompetitionsList(data));
    fetch(`${API_BASE_URL}/api/meta/positions`).then(res => res.json()).then(data => setPositionsList(data));
    fetch(`${API_BASE_URL}/api/meta/teams`).then(res => res.json()).then(data => setTeamsList(data));
    fetch(`${API_BASE_URL}/api/meta/seasons`).then(res => res.json()).then(data => setSeasonsList(data));
    fetch(`${API_BASE_URL}/api/meta/metrics`).then(res => res.json()).then(data => setMetricsList(data));
    fetch(`${API_BASE_URL}/api/profiles`).then(res => res.json()).then(data => setProfiles(data)).catch(err => console.error(err));
  }, [isAuthenticated]);

  const fetchPlayers = useCallback(() => {
    setLoading(true);
    const currentLimit = dashboardView === 'SCATTER' ? 200 : pageSize;
    let url = `${API_BASE_URL}/api/players?limit=${currentLimit}&page=${currentPage}`;
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
    if (activeFilters.consolidate) url += `&consolidate=true`;
    url += `&sort_by=${activeFilters.sortBy}`;

    fetch(url).then(res => {
      if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
      return res.json();
    }).then(data => {
      setPlayers(data.items || []);
      setTotalPlayers(data.total || 0);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setError(err.message);
      setLoading(false);
    });
  }, [currentPage, activeFilters, dashboardView]);

  useEffect(() => { 
    if (view === 'DASHBOARD') {
      fetchPlayers(); 
    }
  }, [fetchPlayers, view]);

  // Réinitialiser la page quand les filtres changent sans déclencher de double fetch
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [activeFilters]);

  const handleApplyFilters = () => { setActiveFilters(pendingFilters); setCurrentPage(1); setShowFilters(false); };
  const handleResetFilters = () => { setPendingFilters(defaultFilters); setActiveFilters(defaultFilters); setCurrentPage(1); };
  const loadProfile = (config) => { setPendingFilters({ ...defaultFilters, ...config }); };
  const handlePlayerClick = (playerData) => { setSelectedPlayer(playerData); };
  const handleSortChange = (newSortBy) => {
    setPendingFilters(prev => ({ ...prev, sortBy: newSortBy }));
    setActiveFilters(prev => ({ ...prev, sortBy: newSortBy }));
    setCurrentPage(1);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={(userData) => { setUser(userData); setIsAuthenticated(true); }} />;
  }

  return (
    <div className="min-h-screen bg-[#131313] text-white font-sans relative flex flex-col">
      {/* Header Premium Apple-Style */}
      {true && (
        <div className="sticky top-0 z-[100] w-full px-4 md:px-8 bg-[#131313] border-b border-white/10 h-24 flex items-center">
          <div className="w-full max-w-[1700px] mx-auto grid grid-cols-2 md:grid-cols-3 items-center">
            
            {/* Logo - Colonne Gauche */}
            <div className="flex items-center gap-8">
               <div className="flex items-center gap-4 cursor-pointer group w-fit" onClick={() => setView('EXPLORATION')}>
                  <div className="w-12 h-12 bg-white text-black rounded-[4px] flex items-center justify-center group-hover:bg-[#3cffd0] transition-colors">
                     <Activity size={24} />
                  </div>
                  <div className="hidden lg:flex flex-col">
                     <span className="verge-h3 text-white leading-none tracking-tighter">The Analyst</span>
                     <span className="verge-label-mono text-[#3cffd0] text-[10px] mt-1">Intelligence Hub</span>
                  </div>
               </div>
            </div>
            
            {/* Recherche Centrale */}
            <div className="flex justify-center order-3 md:order-2 col-span-2 md:col-span-1 mt-4 md:mt-0">
              <div className="w-full max-w-[500px]">
                <GlobalPlayerSearch onPlayerSelect={handlePlayerClick} />
              </div>
            </div>

            {/* Espace Droite - User Profile */}
            <div className="hidden md:flex justify-end order-2 md:order-3">
               <UserMenu 
                user={user} 
                onLogout={() => { setIsAuthenticated(false); setUser(null); }}
                onUpdateUser={setUser}
                onOpenSettings={(tab) => { setSettingsTab(tab); setShowSettings(true); }}
               />
            </div>
            
          </div>
        </div>
      )}

      <AnimatePresence>
        {view === 'EXPLORATION' ? (
          <ExplorationPath key="exploration" 
            onSelectPath={(p) => {
                if (p === 'SCATTER') { setView('DASHBOARD'); setDashboardView('SCATTER'); }
               else if (p === 'DASHBOARD') { setView('DASHBOARD'); setDashboardView('TABLE'); }
               else if (p === 'TRENDS') { setView('DASHBOARD'); setDashboardView('TRENDS'); }
               else if (p === 'TEAMBUILDER') { setView('TEAMBUILDER'); }
               else if (p === 'LAB') { setView('LAB'); }
               else setView(p);
            }} 
            onBack={() => {}} 
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
              <div className="flex flex-col items-center md:items-start">
                <button onClick={() => setView('EXPLORATION')} className="verge-label-mono text-[#3860be] hover:text-white flex items-center gap-2 mb-4">
                  <ArrowLeft size={14} /> Intelligence Hub
                </button>
                <h1 className="verge-h1 text-white">
                  {dashboardView === 'TABLE' && <>Player <span className="text-[#3cffd0]">Rankings</span></>}
                  {dashboardView === 'SCATTER' && <>Scatter <span className="text-[#3cffd0]">Analysis</span></>}
                  {dashboardView === 'TRENDS' && <>Player <span className="text-[#3cffd0]">Trends</span></>}
                  {dashboardView === 'VERSUS' && <>Head to <span className="text-[#3cffd0]">Head</span></>}
                </h1>
              </div>
            </div>

            <div className="flex flex-col gap-6">

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
                    selectedSortBy={activeFilters.sortBy} 
                    selectedPlayersToCompare={selectedPlayersToCompare} 
                    setSelectedPlayersToCompare={setSelectedPlayersToCompare} 
                    metricsList={metricsList} 
                    useSeasonAge={activeFilters.useSeasonAge} 
                    onSortChange={handleSortChange} 
                  />
                )}
                {dashboardView === 'SCATTER' && (
                  loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-8 bg-[#131313] border border-white/5 rounded-[24px] min-h-[600px] relative overflow-hidden">
                       <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3cffd0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                       <div className="relative">
                          <div className="w-16 h-16 border-2 border-[#3cffd0]/20 border-t-[#3cffd0] animate-spin rounded-full"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-2 h-2 bg-[#3cffd0] rounded-full animate-pulse"></div>
                          </div>
                       </div>
                       <div className="text-center space-y-2">
                          <p className="verge-label-mono text-[#3cffd0] text-[10px] uppercase tracking-[0.4em] font-black">Analyse Multi-Dimensionnelle</p>
                          <p className="verge-label-mono text-[#949494] text-[8px] uppercase tracking-[0.2em] font-black opacity-60">Synchronisation des 200 profils les plus performants...</p>
                       </div>
                    </div>
                  ) : (
                    <ScatterContent 
                      players={players} 
                      metricsList={metricsList} 
                      onPlayerClick={handlePlayerClick} 
                    />
                  )
                )}
                {dashboardView === 'TRENDS' && (
                  <TrendsDashboard metricsList={metricsList} />
                )}
                {dashboardView === 'VERSUS' && (
                  <div className="flex-1 bg-[#131313] border border-white/10 rounded-[4px] p-20 flex flex-col items-center justify-center gap-12 relative overflow-hidden">
                    {/* Background Texture */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3cffd0 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                    
                    <div className="relative group">
                      <div className="absolute -inset-8 bg-[#3cffd0]/10 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-24 h-24 bg-[#131313] border border-[#3cffd0]/30 flex items-center justify-center relative z-10">
                         <Users className="text-[#3cffd0]" size={48} />
                      </div>
                    </div>

                    <div className="text-center space-y-4">
                      <span className="verge-kicker text-[#3cffd0] block">Ready for analysis</span>
                      <h2 className="verge-h1 text-white">MODE VERSUS ACTIVÉ</h2>
                      <p className="verge-label-mono text-[#949494] text-[10px] tracking-[0.3em]">DEUX JOUEURS SÉLECTIONNÉS POUR COMPARAISON</p>
                    </div>

                    <button 
                      onClick={() => setView('MATCHUP')}
                      className="btn-verge-primary px-16 py-6 text-base shadow-[0_0_50px_rgba(60,255,208,0.2)]"
                    > 
                      Lancer la comparaison 
                    </button>
                  </div>
                )}
              </main>
            </div>
          </motion.div>
        ) : view === 'RADAR' ? (
          <div key="radar" className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen flex flex-col">
             <button onClick={() => setView('EXPLORATION')} className="verge-label-mono text-[#3860be] hover:text-white flex items-center gap-2 mb-8 group self-start">
               <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Intelligence Hub
             </button>
             <RadarDashboard players={players} metricsList={metricsList} activeFilters={activeFilters} initialSelectedPlayer={selectedPlayer || (selectedPlayersToCompare.length > 0 ? selectedPlayersToCompare[0] : null)} />
          </div>
        ) : view === 'TEAMBUILDER' ? (
          <div key="teambuilder" className="w-full px-4 md:px-8 min-h-screen flex flex-col">
             <div className="max-w-[1700px] mx-auto w-full flex flex-col flex-1">
                <button onClick={() => setView('EXPLORATION')} className="verge-label-mono text-[#3860be] hover:text-white flex items-center gap-2 mt-8 mb-4 md:mb-8 group self-start">
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Intelligence Hub
                </button>
                <TeamBuilderDashboard activeFilters={activeFilters} onPlayerClick={handlePlayerClick} filterProps={{ openSection, setOpenSection, pendingFilters, setPendingFilters, competitionsList, positionsList, teamsList, seasonsList, metricsList, handleResetFilters, handleApplyFilters, hasChanges: JSON.stringify(pendingFilters) !== JSON.stringify(activeFilters) }} />
             </div>
          </div>
        ) : view === 'LAB' ? (
          <div key="lab" className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen flex flex-col">
             <button onClick={() => setView('EXPLORATION')} className="verge-label-mono text-[#3860be] hover:text-white flex items-center gap-2 mb-8 group self-start">
               <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Intelligence Hub
             </button>
             <LabDashboard activeFilters={activeFilters} metricsList={metricsList} onPlayerClick={handlePlayerClick} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        ) : null}
      </AnimatePresence>

      <footer className="w-full py-12 border-t border-white/5 bg-[#131313] text-center">
        <span className="verge-label-mono text-[9px] text-[#949494] tracking-[0.4em] font-black uppercase">
          © 2026 THE ANALYST SCOUTING SYSTEM • CLOUD-NATIVE ARCHITECTURE
        </span>
      </footer>

      <ContextualChatBot selectedPlayer={selectedPlayer} players={players} activeFilters={activeFilters} />

      <AnimatePresence>
        {showFilters && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: '-100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-full md:w-[420px] z-[201] shadow-[20px_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="h-full bg-[#131313] border-r border-white/10 flex flex-col">
                 <div className="flex justify-between items-center p-4 border-b border-white/10">
                    <span className="verge-label-mono text-[10px] text-[#3cffd0] font-black uppercase tracking-widest">Configuration Globale</span>
                    <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#949494] hover:text-white">
                       <X size={20} />
                    </button>
                 </div>
                 <div className="flex-1 overflow-hidden">
                    <FilterPanel 
                      openSection={openSection} setOpenSection={setOpenSection}
                      pendingFilters={pendingFilters} setPendingFilters={setPendingFilters}
                      competitionsList={competitionsList} positionsList={positionsList} teamsList={teamsList} seasonsList={seasonsList} metricsList={metricsList}
                      profiles={profiles} loadProfile={loadProfile} onProfileSaved={(newP) => setProfiles(prev => [newP, ...prev])} 
                      onProfileDeleted={(id) => setProfiles(prev => prev.filter(p => p.id !== id))}
                      handleResetFilters={handleResetFilters} 
                      handleApplyFilters={() => { handleApplyFilters(); setShowFilters(false); }}
                      hasChanges={JSON.stringify(pendingFilters) !== JSON.stringify(activeFilters)}
                    />
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button - Visible in all views */}
      {true && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setShowFilters(true)}
          className="fixed bottom-10 left-10 z-[150] w-14 h-14 bg-black border border-[#3cffd0]/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(60,255,208,0.2)] hover:scale-110 hover:border-[#3cffd0] transition-all group"
        >
           <SlidersHorizontal size={22} className="text-[#3cffd0] group-hover:rotate-90 transition-transform duration-500" />
           {JSON.stringify(pendingFilters) !== JSON.stringify(activeFilters) && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-[#f43f5e] border-2 border-black rounded-full" />
           )}
        </motion.button>
      )}

      <AnimatePresence>
        {selectedPlayer && (
            <PlayerDashboard 
              playerId={selectedPlayer.id} 
              rowContext={selectedPlayer} 
              onClose={() => setSelectedPlayer(null)} 
              activeFilters={activeFilters} 
              metricsList={metricsList}
              user={user}
              onUpdateUser={setUser}
              onSwitchPlayer={(id) => { 
                const newPlayer = players.find(p => p.id === id) || { id }; 
                setSelectedPlayer(newPlayer); 
              }} 
            />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <SettingsModal 
            isOpen={showSettings} 
            onClose={() => setShowSettings(false)} 
            user={user} 
            initialTab={settingsTab} 
            onUpdateUser={setUser}
            profiles={profiles}
            onProfileDeleted={(id) => {
              fetch(`${API_BASE_URL}/api/profiles/${id}`, { method: 'DELETE' })
                .then(res => res.json())
                .then(() => setProfiles(prev => prev.filter(p => p.id !== id)))
                .catch(err => console.error(err));
            }}
            onPlayerClick={handlePlayerClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;