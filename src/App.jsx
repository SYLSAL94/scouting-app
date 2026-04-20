import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Activity, Users, ArrowLeft, BarChart2 } from 'lucide-react';

// Import des composants factorisés
import LandingPage from './components/layout/LandingPage';
import ExplorationPath from './components/layout/ExplorationPath';
import LoginScreen from './components/layout/LoginScreen';
import FilterPanel from './components/dashboard/FilterPanel';
import RankingTable from './components/dashboard/RankingTable';
import ScatterContent from './components/dashboard/ScatterContent';
import PlayerModal from './components/modals/PlayerModal';

function App() {
  // --- NOUVEAUX ÉTATS DE SÉCURITÉ ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const [view, setView] = useState('LANDING'); 
  const [dashboardView, setDashboardView] = useState('TABLE'); // 'TABLE' or 'SCATTER'
  const [players, setPlayers] = useState([]);

  const [totalPlayers, setTotalPlayers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [competitionsList, setCompetitionsList] = useState([]);
  const [positionsList, setPositionsList] = useState([]);
  const [teamsList, setTeamsList] = useState([]);
  const [seasonsList, setSeasonsList] = useState([]);
  const [metricsList, setMetricsList] = useState([]);
  
  // États des Filtres Actifs
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
    onLoan: 'all'
  };

  const [activeFilters, setActiveFilters] = useState(defaultFilters);
  const [pendingFilters, setPendingFilters] = useState(defaultFilters);

  // État de l'accordéon local
  const [openSection, setOpenSection] = useState('ligues');

  // Pagination Server-side
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // 1. Chargement des métadonnées
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
  }, []);

  const fetchPlayers = useCallback(() => {
    setLoading(true);
    
    // Détermination de la limite dynamique (Mass-Fetching Asymétrique)
    const currentLimit = dashboardView === 'SCATTER' ? 1000 : pageSize;
    
    let url = `https://api-scouting.theanalyst.cloud/api/players?limit=${currentLimit}&page=${currentPage}`;

    if (activeFilters.search) url += `&search=${encodeURIComponent(activeFilters.search)}`;
    
    if (activeFilters.competitions.length > 0) {
      url += `&competitions=${encodeURIComponent(activeFilters.competitions.join(','))}`;
    }
    
    if (activeFilters.positions.length > 0) {
      url += `&positions=${encodeURIComponent(activeFilters.positions.join(','))}`;
    }

    if (activeFilters.teams.length > 0) {
      url += `&teams=${encodeURIComponent(activeFilters.teams.join(','))}`;
    }

    if (activeFilters.seasons.length > 0) {
      url += `&seasons=${encodeURIComponent(activeFilters.seasons.join(','))}`;
    }

    url += `&min_age=${activeFilters.minAge}&max_age=${activeFilters.maxAge}`;
    
    if (activeFilters.playtime.min > 0) {
      url += `&min_playtime=${activeFilters.playtime.min}`;
    }
    
    url += `&sort_by=${activeFilters.sortBy}`;

    console.log("🌐 Appel de l'API vers :", url);

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("🚨 RÉPONSE API BRUTE :", data);
        if (!data.items || data.items.length === 0) {
          console.warn("⚠️ Attention : Le tableau 'items' est vide ou non reconnu dans la réponse.");
        }
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
  };

  const handleResetFilters = () => {
    setPendingFilters(defaultFilters);
    setActiveFilters(defaultFilters);
    setCurrentPage(1);
  };

  const handlePlayerClick = async (playerData) => {
    // Gestion robuste : est-ce un objet joueur ou juste un ID ?
    const player = typeof playerData === 'object' ? playerData : { id: playerData };
    const playerId = player.id || player.unique_id;

    console.log("🎯 Clic joueur :", { id: playerId, player });

    // 1. Ouverture immédiate (UX)
    setSelectedPlayer(player);
    
    if (!playerId) {
      console.warn("⚠️ Impossible de trouver un ID pour ce joueur.");
      return;
    }

    // 2. Enrichissement API
    try {
      const response = await fetch(`https://api-scouting.theanalyst.cloud/api/players/${playerId}`);
      if (!response.ok) throw new Error(`Erreur API : ${response.status}`);
      const data = await response.json();
      setSelectedPlayer(Array.isArray(data) ? data[0] : data);
    } catch (err) { 
      console.error("❌ Échec de l'enrichissement :", err);
    }
  };

  // --- LE BOUCLIER (Placé après tous les hooks) ---
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
               else setView(p);
            }} 
            onBack={() => setView('LANDING')} 
          />
        ) : view === 'DASHBOARD' ? (
          <motion.div 
            key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-8 max-w-[1700px] mx-auto min-h-screen flex flex-col"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
              <div>
                <button onClick={() => setView('EXPLORATION')} className="btn-back" style={{ marginBottom: '8px' }}>
                  <ArrowLeft size={14} /> Back to paths
                </button>
                <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
                  Player <span className="text-highlight">Rankings</span>
                </h1>
              </div>
              <div className="flex items-center gap-6">
                {/* View Selector Toggle */}
                <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5 h-fit">
                    <button 
                        onClick={() => setDashboardView('TABLE')}
                        className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${dashboardView === 'TABLE' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-white/40 hover:text-white'}`}
                    >
                        Table Analysis
                    </button>
                    <button 
                        onClick={() => setDashboardView('SCATTER')}
                        className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${dashboardView === 'SCATTER' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-white/40 hover:text-white'}`}
                    >
                        Scatter Plot
                    </button>
                </div>

                <div className="relative w-full md:w-[400px]">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-sky-400/50" size={20} />
                    <input 
                        type="text" placeholder="Search by name, team or role..." 
                        className="search-input w-full pl-14 pr-6 py-4 text-lg"
                        value={pendingFilters.search} 
                        onChange={(e) => setPendingFilters({...pendingFilters, search: e.target.value})}
                    />
                </div>
              </div>
            </div>

            <div className="dashboard-layout gap-10">
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
              <main className="ranking-content-panel flex-1">
                {dashboardView === 'TABLE' ? (
                    <RankingTable 
                        players={players} loading={loading} error={error} 
                        currentPage={currentPage} pageSize={pageSize} totalPlayers={totalPlayers} 
                        totalPages={Math.ceil(totalPlayers / pageSize)}
                        setCurrentPage={setCurrentPage} handlePlayerClick={handlePlayerClick}
                        selectedSortBy={pendingFilters.sortBy}
                    />
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
          <div className="p-8 max-w-[1200px] mx-auto min-h-screen">
             <button onClick={() => setView('EXPLORATION')} className="btn-back mb-8">
                <ArrowLeft size={14} /> Intelligence Hub
             </button>
             <h1 className="text-5xl font-black mb-12 uppercase tracking-tighter">Radar <span className="text-highlight">Profiling</span></h1>
             <div className="glass-panel p-20 text-center">
                <Activity className="text-sky-400 mx-auto mb-6" size={64} />
                <h3 className="text-2xl font-bold mb-4">Radar Visualization Engine</h3>
                <p className="text-[rgb(var(--text-muted))] mb-8 max-w-md mx-auto">Select a player to generate a tactical profile.</p>
                <button onClick={() => setView('DASHBOARD')} className="btn btn-primary">Go to Rankings</button>
             </div>
          </div>
        ) : view === 'SCATTER' ? (
          <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
             <button onClick={() => setView('EXPLORATION')} className="btn-back mb-8">
                <ArrowLeft size={14} /> Intelligence Hub
             </button>
             <h1 className="text-5xl font-black mb-12 uppercase tracking-tighter">Scatter <span className="text-highlight">Analysis</span></h1>
             <div className="flex gap-8 h-[600px]">
                <aside className="w-72 glass-panel p-6">
                   <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Chart Controls</h3>
                   <div className="filter-group"><label className="filter-label">X-Axis</label><select className="filter-select"><option>Age</option></select></div>
                   <div className="filter-group"><label className="filter-label">Y-Axis</label><select className="filter-select"><option>Impact</option></select></div>
                   <button onClick={() => setView('DASHBOARD')} className="btn btn-primary w-full mt-auto">Sync with Rankings</button>
                </aside>
                <div className="flex-1 glass-panel flex flex-col items-center justify-center border-dashed">
                   <BarChart2 className="text-sky-400/20 mb-8" size={120} />
                   <h2 className="text-3xl font-black mb-2">Visualizing Correlation</h2>
                   <p className="text-[rgb(var(--text-muted))] max-w-sm text-center">Engine initialized. Correlate metrics to find outliers.</p>
                </div>
             </div>
          </div>
        ) : view === 'MATCHUP' ? (
          <div className="p-8 max-w-[1200px] mx-auto min-h-screen">
             <button onClick={() => setView('EXPLORATION')} className="btn-back mb-8">
                <ArrowLeft size={14} /> Intelligence Hub
             </button>
             <h1 className="text-5xl font-black mb-12 uppercase tracking-tighter">Match-up <span className="text-highlight">Simulator</span></h1>
             <div className="grid grid-cols-2 gap-8 h-96">
                <div className="glass-panel border-dashed flex flex-col items-center justify-center">
                   <Users className="text-white/20 mb-4" size={48} /><p className="text-[rgb(var(--text-muted))]">Player 1 Selection</p>
                </div>
                <div className="glass-panel border-dashed flex flex-col items-center justify-center">
                   <Users className="text-white/20 mb-4" size={48} /><p className="text-[rgb(var(--text-muted))]">Player 2 Selection</p>
                </div>
             </div>
          </div>
        ) : null}
      </AnimatePresence>

      <footer className="mt-auto py-8 border-t border-white/5 text-center text-[10px] text-[rgb(var(--text-muted))] uppercase tracking-widest">
        © 2026 The Analyst Scouting System • Cloud-Native Architecture
      </footer>

      <AnimatePresence>
        {selectedPlayer && <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
      </AnimatePresence>
    </div>
  );
}

export default App;