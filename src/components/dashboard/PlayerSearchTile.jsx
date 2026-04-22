import React, { useState, useEffect } from 'react';
import { Search, X, Users } from 'lucide-react';

export const PlayerSearchTile = ({ onSelectPlayer, label = "Player Selection", activeFilters = {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchTerm.trim().length < 3) {
      setResults([]);
      setTotalCount(0);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      setIsSearching(true);
      
      // Construire l'URL avec les filtres actifs
      let url = `https://api-scouting.theanalyst.cloud/api/players?search=${encodeURIComponent(searchTerm)}&limit=10`;
      
      if (activeFilters.competitions?.length > 0) {
        url += `&competitions=${encodeURIComponent(activeFilters.competitions.join(','))}`;
      }
      if (activeFilters.positions?.length > 0) {
        url += `&positions=${encodeURIComponent(activeFilters.positions.join(','))}`;
      }
      if (activeFilters.teams?.length > 0) {
        url += `&teams=${encodeURIComponent(activeFilters.teams.join(','))}`;
      }
      if (activeFilters.seasons?.length > 0) {
        url += `&seasons=${encodeURIComponent(activeFilters.seasons.join(','))}`;
      }
      if (activeFilters.minAge) url += `&min_age=${activeFilters.minAge}`;
      if (activeFilters.maxAge) url += `&max_age=${activeFilters.maxAge}`;
      if (activeFilters.height?.min) url += `&min_height=${activeFilters.height.min}`;
      if (activeFilters.height?.max) url += `&max_height=${activeFilters.height.max}`;
      if (activeFilters.weight?.min) url += `&min_weight=${activeFilters.weight.min}`;
      if (activeFilters.weight?.max) url += `&max_weight=${activeFilters.weight.max}`;
      if (activeFilters.playtime?.min > 0) url += `&min_playtime=${activeFilters.playtime.min}`;
      if (activeFilters.sortBy) url += `&sort_by=${activeFilters.sortBy}`;

      fetch(url)
        .then(res => res.json())
        .then(data => {
          setResults(data.items || []);
          setTotalCount(data.total || 0);
          setIsSearching(false);
        })
        .catch(err => {
          console.error(err);
          setIsSearching(false);
        });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, activeFilters]);

  return (
    <div className="glass-panel border-dashed border-white/20 p-6 flex flex-col relative h-[25rem] group transition-all duration-300 hover:border-sky-500/40">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"></div>
      
      <div className="flex flex-col items-center mb-6">
         <Users className="text-white/30 mb-3 group-hover:text-sky-400/80 transition-colors" size={36} />
         <h3 className="text-[rgb(var(--text-muted))] uppercase tracking-widest text-sm font-black">{label}</h3>
         <p className="text-xs text-white/40 mt-1">
            {searchTerm.length >= 3 && !isSearching 
              ? `${totalCount} joueur(s) correspondant(s) trouvé(s)` 
              : "Recherche live dans la base PostgreSQL..."}
         </p>
      </div>

      <div className="relative w-full z-10 flex-1 flex flex-col min-h-0">
          <div className="relative flex-shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400/50" size={18} />
              <input 
                  type="text" 
                  placeholder="Ex: Mbappé, Messi, Bellingham..." 
                  className="w-full bg-[rgba(11,15,25,0.7)] border border-white/10 rounded-xl pl-12 pr-10 py-4 text-sm font-medium focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-white shadow-inner placeholder-white/30"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                  <button onClick={() => { setSearchTerm(''); setTotalCount(0); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white bg-white/5 rounded-full p-1">
                      <X size={16} />
                  </button>
              )}
          </div>
          
          <div className="mt-4 flex-1 overflow-y-auto styled-scrollbar relative pr-2">
              {isSearching && (
                  <div className="flex flex-col items-center justify-center h-full text-sky-400/50 text-sm gap-3">
                      <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin"></div>
                      Interrogation API...
                  </div>
              )}
              {!isSearching && results.length > 0 && (
                  <div className="flex flex-col gap-2">
                      {results.map((p, idx) => (
                          <div 
                              key={`${p.id || p.unique_id || 'p'}-${idx}`} 
                              className="flex items-center gap-4 p-3 bg-white/5 hover:bg-sky-500/20 rounded-xl cursor-pointer border border-white/5 hover:border-sky-500/30 transition-all shadow-sm"
                              onClick={() => {
                                  onSelectPlayer(p);
                                  setSearchTerm('');
                                  setResults([]);
                                  setTotalCount(0);
                              }}
                          >
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 flex-shrink-0 border border-white/10">
                                  {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : null}
                              </div>
                              <div className="flex flex-col">
                                  <span className="font-bold text-sm text-slate-100">
                                      {p.full_name || p.name} ({p.competition || 'N/A'} - {p.season || 'N/A'})
                                  </span>
                                  <span className="text-xs text-sky-300 font-medium opacity-80">{p.last_club_name} • {p.position_category} • {p.age} ans</span>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
              {!isSearching && searchTerm.length >= 3 && results.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-white/40 text-sm">
                      <X size={32} className="mb-2 opacity-50 text-red-400" />
                      Aucun joueur trouvé.
                  </div>
              )}
           </div>
      </div>
    </div>
  );
};
