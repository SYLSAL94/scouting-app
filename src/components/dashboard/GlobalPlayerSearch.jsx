import React, { useState, useEffect, useRef } from 'react';
import { Search, User, ChevronRight, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * GlobalPlayerSearch.jsx — Barre de recherche universelle
 * Permet de trouver n'importe quel joueur et d'ouvrir sa fiche instantanément.
 */
const GlobalPlayerSearch = ({ onPlayerSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef(null);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recherche avec Debounce
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://api-scouting.theanalyst.cloud/api/players?search=${encodeURIComponent(query)}&limit=8`);
        const data = await response.json();
        setResults(data.items || []);
        setIsOpen(true);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (player) => {
    onPlayerSelect(player);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen && results.length > 0) {
      if (e.key === 'ArrowDown') setIsOpen(true);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) {
          handleSelect(results[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative group">
        <div className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${isLoading ? 'text-sky-400' : 'text-sky-400/50 group-focus-within:text-sky-400'}`}>
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
        </div>
        
        <input 
          type="text" 
          placeholder="Rechercher un joueur (ex: Mbappé, Haaland...)" 
          className="search-input w-full pl-14 pr-14 py-4 text-base md:text-lg bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/5 transition-all shadow-xl"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(results.length > 0)}
          onKeyDown={handleKeyDown}
        />

        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Résultats Dropdown */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-[1000] left-0 right-0 mt-3 bg-[#0F172A]/95 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl overflow-hidden"
          >
            <div className="p-2 border-b border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 flex justify-between px-4">
              <span>Résultats suggérés</span>
              <span>{results.length} joueurs</span>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto py-2">
              {results.map((player, index) => (
                <div 
                  key={player.id}
                  className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-all ${
                    index === activeIndex ? 'bg-sky-500 text-white' : 'hover:bg-white/5 text-white/70'
                  }`}
                  onClick={() => handleSelect(player)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xl overflow-hidden ${
                      index === activeIndex ? 'ring-2 ring-white/30' : 'bg-sky-500/10 border border-white/5'
                    }`}>
                      {player.image ? (
                        <img 
                          src={player.image} 
                          alt={player.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://api-scouting.theanalyst.cloud/static/default-player.png'; }}
                        />
                      ) : (
                        <User size={20} className={index === activeIndex ? 'text-white' : 'text-sky-400'} />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-sm truncate uppercase tracking-tighter">{player.name}</span>
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className={`text-[9px] font-bold uppercase truncate ${index === activeIndex ? 'text-white/80' : 'text-sky-400'}`}>
                          {player.last_club_name || 'Free Agent'}
                        </span>
                        <span className="text-[9px] text-white/20">•</span>
                        <span className={`text-[9px] uppercase truncate ${index === activeIndex ? 'text-white/60' : 'text-white/40'}`}>
                          {player.position_category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className={`text-[10px] font-black ${index === activeIndex ? 'text-white' : 'text-emerald-400'}`}>
                        {player.note_ponderee?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-[7px] uppercase font-bold tracking-widest opacity-40">Global Score</span>
                    </div>
                    <ChevronRight size={14} className={index === activeIndex ? 'text-white' : 'text-white/10'} />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-3 bg-white/5 border-t border-white/5 text-center">
               <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                 <Search size={10} /> Appuyez sur <span className="px-1.5 py-0.5 bg-white/10 rounded">Entrée</span> pour ouvrir la fiche
               </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalPlayerSearch;
