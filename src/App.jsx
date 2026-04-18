import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Activity, Users, ArrowLeft, BarChart2 } from 'lucide-react';

// Import des composants factorisés
import LandingPage from './components/layout/LandingPage';
import ExplorationPath from './components/layout/ExplorationPath';
import FilterPanel from './components/dashboard/FilterPanel';
import RankingTable from './components/dashboard/RankingTable';
import PlayerModal from './components/modals/PlayerModal';

function App() {
  const [view, setView] = useState('LANDING'); 
  const [players, setPlayers] = useState([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [competitionsList, setCompetitionsList] = useState([]);
  const [positionsList, setPositionsList] = useState([]);
  
  // États des Filtres Actifs
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [minAge, setMinAge] = useState(16);
  const [maxAge, setMaxAge] = useState(40);
  const [minPlaytime, setMinPlaytime] = useState(0);

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
  }, []);

  const fetchPlayers = useCallback(() => {
    setLoading(true);
    const offset = (currentPage - 1) * pageSize;
    let url = `https://api-scouting.theanalyst.cloud/api/players?limit=${pageSize}&offset=${offset}`;

    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
    if (selectedCompetition) url += `&competition=${encodeURIComponent(selectedCompetition)}`;
    if (selectedPosition) url += `&position_category=${encodeURIComponent(selectedPosition)}`;
    url += `&min_age=${minAge}&max_age=${maxAge}`;
    if (minPlaytime > 0) url += `&min_playtime=${minPlaytime}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setPlayers(data.items || []);
        setTotalPlayers(data.total || 0);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [currentPage, searchTerm, selectedCompetition, selectedPosition, minAge, maxAge, minPlaytime]);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedCompetition, selectedPosition, minAge, maxAge, minPlaytime]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCompetition('');
    setSelectedPosition('');
    setMinAge(16);
    setMaxAge(40);
    setMinPlaytime(0);
    setCurrentPage(1);
  };

  const handlePlayerClick = async (playerId) => {
    try {
      const response = await fetch(`https://api-scouting.theanalyst.cloud/api/players/${playerId}`);
      if (!response.ok) throw new Error("Erreur");
      const data = await response.json();
      setSelectedPlayer(Array.isArray(data) ? data[0] : data);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen text-[rgb(var(--text-main))] font-sans relative">
      <AnimatePresence mode="wait">
        {view === 'LANDING' ? (
          <LandingPage key="landing" onEnter={() => setView('EXPLORATION')} />
        ) : view === 'EXPLORATION' ? (
          <ExplorationPath key="exploration" onSelectPath={setView} onBack={() => setView('LANDING')} />
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
              <div className="relative w-full md:w-[450px]">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-sky-400/50" size={20} />
                <input 
                  type="text" placeholder="Search by name, team or role..." 
                  className="search-input w-full pl-14 pr-6 py-4 text-lg"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="dashboard-layout gap-10">
              <FilterPanel 
                openSection={openSection} setOpenSection={setOpenSection}
                selectedCompetition={selectedCompetition} setSelectedCompetition={setSelectedCompetition} competitionsList={competitionsList}
                selectedPosition={selectedPosition} setSelectedPosition={setSelectedPosition} positionsList={positionsList}
                minAge={minAge} setMinAge={setMinAge} maxAge={maxAge} setMaxAge={setMaxAge}
                minPlaytime={minPlaytime} setMinPlaytime={setMinPlaytime}
                handleResetFilters={handleResetFilters} fetchPlayers={fetchPlayers}
              />
              <main className="ranking-content-panel flex-1">
                <RankingTable 
                  players={players} loading={loading} error={error} 
                  currentPage={currentPage} pageSize={pageSize} totalPlayers={totalPlayers} 
                  totalPages={Math.ceil(totalPlayers / pageSize)}
                  setCurrentPage={setCurrentPage} handlePlayerClick={handlePlayerClick}
                />
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