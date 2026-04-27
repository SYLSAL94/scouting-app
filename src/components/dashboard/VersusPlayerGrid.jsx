import React, { useState, useEffect, useRef } from 'react';
import { Search, X as IconX, PlusCircle, Trophy } from 'lucide-react';

const displayNameOf = (p) =>
    String(p?.name || p?.full_name || p?.Joueur || p?.player_name || 'Inconnu');

const PlayerSelector = ({ onPlayerSelect, placeholder, excludePlayerIds, activeFilters = {} }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const listRef = useRef(null);

    useEffect(() => {
        if (!isOpen) setHighlightedIndex(-1);
    }, [isOpen]);

    useEffect(() => {
        if (query.trim().length < 3) {
            setResults([]);
            return;
        }
        const delayDebounceFn = setTimeout(() => {
            setIsSearching(true);
            
            let url = `https://api-scouting.theanalyst.cloud/api/players?search=${encodeURIComponent(query)}&limit=15`;
            
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
            if (activeFilters.playtime?.min > 0) url += `&min_playtime=${activeFilters.playtime.min}`;

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    const filtered = (data.items || []).filter(p => !excludePlayerIds.includes(p.id));
                    setResults(filtered);
                    setIsSearching(false);
                })
                .catch(err => {
                    console.error(err);
                    setIsSearching(false);
                });
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [query, excludePlayerIds, activeFilters]);

    const handleSelect = (player) => {
        onPlayerSelect(player);
        setQuery('');
        setIsOpen(false);
    };

    const handleKeyDown = (e) => {
        if (!isOpen || results.length === 0) return;
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex > -1 && results[highlightedIndex]) {
                    handleSelect(results[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
            default: break;
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center bg-canvas-black rounded-[4px] border border-dashed border-hazard-white/10 p-10 transition-all hover:border-jelly-mint/50 hover:bg-hazard-white/[0.02] group relative min-h-[460px]">
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-hazard-white/10 group-hover:border-jelly-mint/30 transition-colors" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-hazard-white/10 group-hover:border-jelly-mint/30 transition-colors" />
            
            <div className="p-6 bg-surface-slate border border-hazard-white/5 rounded-[1px] mb-8 group-hover:scale-105 transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                <PlusCircle size={40} className="text-secondary-text group-hover:text-jelly-mint transition-colors" />
            </div>
            
            <div className="w-full max-w-[280px] relative z-10">
                <div className={`relative transition-all duration-300 border-b ${isOpen ? 'border-jelly-mint' : 'border-hazard-white/10'}`}>
                    <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-secondary-text" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                        onKeyDown={handleKeyDown}
                        placeholder="AJOUTER UN JOUEUR..."
                        className="w-full bg-transparent verge-label-mono py-4 pl-8 pr-4 text-[10px] font-black text-hazard-white focus:outline-none placeholder-[#949494]/30 uppercase tracking-[0.1em]"
                    />
                </div>
                
                {isOpen && (
                    <div
                        ref={listRef}
                        className="absolute top-full left-0 right-0 mt-2 max-h-72 overflow-y-auto styled-scrollbar z-50 p-2 rounded-[2px] shadow-[0_30px_90px_rgba(0,0,0,0.8)] bg-surface-slate border border-jelly-mint/20"
                    >
                        {isSearching ? (
                            <div className="p-4 verge-label-mono text-[9px] text-jelly-mint text-center font-black animate-pulse">RECHERCHE EN COURS...</div>
                        ) : results.length > 0 ? (
                            results.map((opt, index) => (
                                <div
                                    key={`${opt.id || opt.unique_id}-${index}`}
                                    onMouseDown={() => handleSelect(opt)}
                                    onMouseOver={() => setHighlightedIndex(index)}
                                    className={`px-4 py-3 rounded-[1px] cursor-pointer flex items-center justify-between transition-all ${Math.max(0, highlightedIndex) === index ? 'bg-jelly-mint text-absolute-black' : 'hover:bg-hazard-white/5 text-secondary-text'}`}
                                >
                                    <div className="flex flex-col min-w-0">
                                        <span className={`verge-label-mono text-[10px] font-black uppercase truncate ${Math.max(0, highlightedIndex) === index ? 'text-absolute-black' : 'text-hazard-white'}`}>
                                            {displayNameOf(opt)}
                                        </span>
                                        <span className={`verge-label-mono text-[8px] font-black opacity-60 uppercase truncate ${Math.max(0, highlightedIndex) === index ? 'text-absolute-black/70' : 'text-secondary-text'}`}>
                                            {opt.competition || 'N/A'} • {opt.season || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 verge-label-mono text-[9px] text-secondary-text text-center font-black">
                                {query.length >= 3 ? `AUCUN RÉSULTAT` : "TAPEZ 3 LETTRES MIN..."}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <p className="mt-8 verge-label-mono text-[9px] text-secondary-text font-black tracking-[0.2em] uppercase opacity-40">
                {placeholder}
            </p>
        </div>
    );
};

const PlayerCard = ({ player, onClear, rank, score, points }) => {
    const isWinner = rank === 1;
    const dn = displayNameOf(player);
    const initial = dn ? dn.charAt(0) : '?';

    return (
        <div className={`h-full group relative flex flex-col bg-canvas-black border border-hazard-white/10 rounded-[4px] overflow-hidden transition-all duration-500 hover:border-jelly-mint/30 min-h-[460px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}>
            {/* Status Header */}
            <div className="w-full flex justify-between items-center p-4 border-b border-hazard-white/5 bg-hazard-white/[0.02]">
                {isWinner ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-jelly-mint text-absolute-black verge-label-mono text-[9px] font-black tracking-[0.2em]">
                        <Trophy size={10} fill="currentColor" />
                        <span>MVP</span>
                    </div>
                ) : <div className="verge-label-mono text-[9px] text-secondary-text font-black tracking-[0.1em] px-2 opacity-50 uppercase">Simulateur</div>}

                <button
                    onClick={onClear}
                    className="p-1.5 text-secondary-text hover:text-hazard-white transition-all opacity-0 group-hover:opacity-100"
                    title="Retirer ce joueur"
                >
                    <IconX size={14} />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center w-full p-8">
                {/* Image Section */}
                <div className="relative mb-10 w-full flex justify-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-jelly-mint/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="w-36 h-36 relative rounded-[2px] overflow-hidden border border-hazard-white/10 shadow-[0_25px_50px_rgba(0,0,0,0.4)] bg-surface-slate">
                        <img
                            src={player.image}
                            alt={dn}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://placehold.co/144x144/1e293b/ffffff?text=${encodeURIComponent(initial)}`;
                            }}
                        />
                        {rank && (
                            <div className={`absolute bottom-0 right-0 px-2 py-1 bg-absolute-black/80 backdrop-blur-md verge-label-mono text-[10px] font-black text-jelly-mint border-t border-l border-hazard-white/10`}>
                                #{rank}
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Section */}
                <div className="text-center w-full mb-8">
                    <h3 className="text-xl font-black text-hazard-white leading-tight mb-2 tracking-tight uppercase">
                        {dn}
                    </h3>
                    <div className="flex flex-col items-center gap-1">
                        <span className="verge-label-mono text-[10px] font-black text-secondary-text tracking-[0.1em] uppercase">{player.last_club_name}</span>
                        <div className="h-px w-8 bg-jelly-mint/30 my-1" />
                        <span className="verge-label-mono text-[9px] font-black text-jelly-mint uppercase tracking-widest">{player.competition || 'N/A'} • {player.season || 'N/A'}</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="w-full grid grid-cols-2 gap-px bg-hazard-white/5 border border-hazard-white/5">
                    <div className="flex flex-col items-center p-4 bg-canvas-black">
                        <span className="verge-label-mono text-[8px] text-secondary-text font-black tracking-[0.2em] mb-1">ÂGE</span>
                        <span className="text-sm font-black text-hazard-white tabular-nums">{player.age ?? '-'}</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-canvas-black">
                        <span className="verge-label-mono text-[8px] text-secondary-text font-black tracking-[0.2em] mb-1">MINS</span>
                        <span className="text-sm font-black text-hazard-white tabular-nums">{player.minutes_on_field ?? '-'}</span>
                    </div>
                </div>
            </div>
            
            {/* Bottom Accent */}
            <div className={`h-1 w-full transition-all duration-500 ${isWinner ? 'bg-jelly-mint' : 'bg-hazard-white/5 group-hover:bg-jelly-mint/30'}`} />
        </div>
    );
};

export const VersusPlayerGrid = ({
    selectedPlayers,
    onAddPlayer,
    onRemovePlayer,
    MAX_PLAYERS,
    activeFilters = {}
}) => {
    const showAddButton = selectedPlayers.length < MAX_PLAYERS;

    return (
        <div className="w-full relative">
            <div className={`grid gap-8 ${selectedPlayers.length === 0 ? 'grid-cols-1 max-w-lg mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'}`}>
                {selectedPlayers.map((player, index) => {
                    const id = player.id || player.unique_id || index;
                    return (
                        <div key={id} className="h-full min-h-[460px] relative">
                            <PlayerCard
                                player={player}
                                onClear={() => onRemovePlayer(player.id || player.unique_id)}
                            />
                            {selectedPlayers.length === 2 && index === 0 && (
                                <div className="hidden md:flex absolute -right-10 top-1/2 -translate-y-1/2 z-20 items-center justify-center pointer-events-none">
                                    <div className="w-12 h-12 bg-absolute-black border border-jelly-mint/30 flex items-center justify-center shadow-[0_0_20px_rgba(60,255,208,0.2)] z-20 relative">
                                        <span className="verge-label-mono font-black text-jelly-mint text-xs italic tracking-tighter">VS</span>
                                    </div>
                                    <div className="w-10 h-px bg-gradient-to-r from-[#3cffd0]/30 to-transparent absolute left-12"></div>
                                    <div className="w-10 h-px bg-gradient-to-l from-[#3cffd0]/30 to-transparent absolute right-12"></div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {showAddButton && (
                    <div className="h-full min-h-[460px]">
                        <PlayerSelector
                            onPlayerSelect={onAddPlayer}
                            placeholder={`Ajouter (${selectedPlayers.length}/${MAX_PLAYERS})`}
                            excludePlayerIds={selectedPlayers.map(p => p.id || p.unique_id)}
                            activeFilters={activeFilters}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
