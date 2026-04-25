import React, { useState, useEffect } from 'react';
import { Search, X, Users } from 'lucide-react';

export const PlayerSearchTile = ({ onSelectPlayer, label = "SÉLECTION JOUEUR", activeFilters = {} }) => {
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
      
      let url = `https://api-scouting.theanalyst.cloud/api/players?search=${encodeURIComponent(searchTerm)}&limit=10`;
      
      if (activeFilters.competitions?.length > 0) url += `&competitions=${encodeURIComponent(activeFilters.competitions.join(','))}`;
      if (activeFilters.positions?.length > 0) url += `&positions=${encodeURIComponent(activeFilters.positions.join(','))}`;
      if (activeFilters.teams?.length > 0) url += `&teams=${encodeURIComponent(activeFilters.teams.join(','))}`;
      if (activeFilters.seasons?.length > 0) url += `&seasons=${encodeURIComponent(activeFilters.seasons.join(','))}`;
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
    <div className="flex flex-col gap-4">
      <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
              <Search className={`${searchTerm ? 'text-[#3cffd0]' : 'text-[#949494]'} transition-colors duration-300`} size={16} />
          </div>
          
          <input 
              type="text" 
              placeholder="Mbappé, Messi, Bellingham..." 
              className="w-full bg-[#131313] border border-white/5 rounded-[2px] pl-14 pr-12 py-5 text-[11px] verge-label-mono font-black uppercase tracking-[0.1em] focus:border-[#3cffd0]/50 focus:shadow-[0_0_20px_rgba(60,255,208,0.05)] transition-all outline-none text-white placeholder:text-[#949494]/40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (
              <button 
                onClick={() => { setSearchTerm(''); setTotalCount(0); }} 
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#949494] hover:text-[#f43f5e] transition-colors"
              >
                  <X size={16} />
              </button>
          )}
      </div>

      {/* Results Dropdown Style */}
      {(isSearching || results.length > 0 || (searchTerm.length >= 3 && results.length === 0)) && (
          <div className="bg-[#131313] border border-white/10 rounded-[2px] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 max-h-[400px] flex flex-col">
              <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex justify-between items-center">
                  <span className="verge-label-mono text-[9px] text-[#949494] font-black uppercase tracking-widest">Résultats de recherche</span>
                  <span className="verge-label-mono text-[9px] text-[#3cffd0] font-black">{totalCount} trouvé(s)</span>
              </div>

              <div className="overflow-y-auto styled-scrollbar p-2">
                  {isSearching && (
                      <div className="py-12 flex flex-col items-center gap-4">
                          <div className="w-6 h-6 border-2 border-[#3cffd0]/10 border-t-[#3cffd0] rounded-full animate-spin"></div>
                          <span className="verge-label-mono text-[9px] text-[#949494] uppercase font-black">Interrogation Cloud...</span>
                      </div>
                  )}

                  {!isSearching && results.length > 0 && (
                      <div className="flex flex-col gap-1">
                          {results.map((p, idx) => (
                              <div 
                                  key={`${p.id || p.unique_id || 'p'}-${idx}`} 
                                  className="flex items-center gap-5 p-4 hover:bg-[#3cffd0] group cursor-pointer transition-all border border-transparent hover:border-[#3cffd0] rounded-[2px]"
                                  onClick={() => {
                                      onSelectPlayer(p);
                                      setSearchTerm('');
                                      setResults([]);
                                      setTotalCount(0);
                                  }}
                              >
                                  <div className="w-10 h-10 rounded-full overflow-hidden bg-black/40 border border-white/10 group-hover:border-black/20 shrink-0">
                                      {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><Users size={16} /></div>}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                      <span className="verge-label-mono text-[11px] font-black text-white group-hover:text-black uppercase truncate">
                                          {p.name || p.full_name}
                                      </span>
                                      <div className="flex items-center gap-2 mt-1">
                                          <span className="verge-label-mono text-[9px] text-[#3cffd0] group-hover:text-black font-black uppercase opacity-80">{p.competition}</span>
                                          <span className="w-1 h-1 bg-white/20 group-hover:bg-black/20 rounded-full" />
                                          <span className="verge-label-mono text-[9px] text-[#949494] group-hover:text-black font-black uppercase opacity-60">{p.position_category} • {p.age} ans</span>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}

                  {!isSearching && searchTerm.length >= 3 && results.length === 0 && (
                      <div className="py-12 flex flex-col items-center gap-3">
                          <X size={24} className="text-[#f43f5e] opacity-50" />
                          <span className="verge-label-mono text-[9px] text-[#949494] uppercase font-black">Aucun joueur ne correspond à la recherche</span>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};
