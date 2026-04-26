import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../config';
import { Search, User, ChevronRight, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { normalizeString } from '../../utils/stringUtils';

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
        const response = await fetch(`${API_BASE_URL}/api/players?search=${encodeURIComponent(query)}&limit=8`);
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
        <div className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${isLoading ? 'text-[#3cffd0]' : 'text-[#949494] group-focus-within:text-[#3cffd0]'}`}>
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
        </div>
        
        <input 
          type="text" 
          placeholder="RECHERCHER UN JOUEUR..." 
          className="verge-label-mono w-full pl-14 pr-14 py-4 text-xs bg-[#2d2d2d] border border-white/10 rounded-full outline-none focus:border-[#3cffd0] transition-all"
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
            className="absolute right-6 top-1/2 -translate-y-1/2 text-[#949494] hover:text-white transition-colors"
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
            className="absolute z-[1000] left-0 right-0 mt-3 bg-[#131313] border border-white/20 rounded-[12px] overflow-hidden"
          >
            <div className="p-3 border-b border-white/10 bg-white/5 flex justify-between px-6">
              <span className="verge-label-mono text-[9px] text-[#949494]">Résultats suggérés</span>
              <span className="verge-label-mono text-[9px] text-[#3cffd0]">{results.length} joueurs</span>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto py-2 styled-scrollbar">
              {results.map((player, index) => (
                <div 
                  key={player.id}
                  className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-all ${
                    index === activeIndex ? 'bg-[#3cffd0] text-black' : 'hover:bg-white/5 text-white'
                  }`}
                  onClick={() => handleSelect(player)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-12 h-12 rounded-[4px] flex items-center justify-center shrink-0 overflow-hidden border ${
                      index === activeIndex ? 'border-black/20' : 'border-white/10 bg-[#2d2d2d]'
                    }`}>
                      {player.image ? (
                        <img 
                          src={player.image} 
                          alt={player.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://api-scouting.theanalyst.cloud/static/default-player.png'; }}
                        />
                      ) : (
                        <User size={20} className={index === activeIndex ? 'text-black' : 'text-[#3cffd0]'} />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="verge-label-mono text-[11px] truncate">
                        {player.name || player.full_name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1 overflow-hidden">
                        <span className={`verge-label-mono text-[8px] truncate ${index === activeIndex ? 'text-black/60' : 'text-[#3cffd0]'}`}>
                          {player.last_club_name || 'Free Agent'}
                        </span>
                        <span className="text-[9px] opacity-20">•</span>
                        <span className={`verge-label-mono text-[8px] truncate ${index === activeIndex ? 'text-black/40' : 'text-[#949494]'}`}>
                          {player.position_category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className={`verge-label-mono text-[10px] ${index === activeIndex ? 'text-black' : 'text-[#3cffd0]'}`}>
                        {player.note_ponderee?.toFixed(1) || '0.0'}
                      </span>
                      <span className="verge-label-mono text-[6px] opacity-40">Score</span>
                    </div>
                    <ChevronRight size={14} className={index === activeIndex ? 'text-black' : 'text-white/20'} />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-white/5 border-t border-white/10 text-center">
               <span className="verge-label-mono text-[8px] text-[#949494] flex items-center justify-center gap-2">
                 Appuyez sur <span className="px-1.5 py-0.5 bg-white/10 rounded text-white">Entrée</span> pour ouvrir
               </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalPlayerSearch;
