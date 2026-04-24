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
        <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/20 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700/50 p-8 transition-all hover:border-sky-500/50 dark:hover:border-sky-500/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 group relative min-h-[420px]">
            <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl"></div>
            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner z-10">
                <PlusCircle size={32} className="text-slate-400 dark:text-slate-500 group-hover:text-sky-500/80 transition-colors" />
            </div>
            <div className="w-full max-w-sm relative group/search z-10">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within/search:text-sky-500 transition-colors" />
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ajouter un joueur..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all shadow-sm"
                />
                {isOpen && (
                    <div
                        ref={listRef}
                        className="absolute top-full mt-2 w-full max-h-72 overflow-y-auto styled-scrollbar z-50 p-1.5 rounded-xl shadow-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 backdrop-blur-xl"
                    >
                        {isSearching ? (
                            <div className="p-3 text-sm text-sky-500 text-center">Recherche...</div>
                        ) : results.length > 0 ? (
                            results.map((opt, index) => (
                                <div
                                    key={`${opt.id || opt.unique_id}-${index}`}
                                    onMouseDown={() => handleSelect(opt)}
                                    onMouseOver={() => setHighlightedIndex(index)}
                                    className={`px-3 py-2.5 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${Math.max(0, highlightedIndex) === index ? 'bg-sky-50 dark:bg-sky-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                >
                                    <div className="flex flex-col min-w-0">
                                        <span className={`text-sm font-semibold truncate ${Math.max(0, highlightedIndex) === index ? 'text-sky-700 dark:text-sky-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {displayNameOf(opt)}
                                        </span>
                                        {opt.full_name && opt.name && opt.full_name !== opt.name && (
                                            <span className="text-[10px] text-slate-500 opacity-70 truncate -mt-0.5">
                                                {opt.full_name}
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-500 dark:text-slate-500 truncate">
                                            {opt.competition || 'N/A'} - {opt.season || 'N/A'} • {opt.last_club_name}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-3 text-sm text-slate-500 text-center">
                                {query.length >= 3 ? `Aucun joueur trouvé` : "Tapez 3 lettres min..."}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <p className="mt-4 text-xs text-slate-400 dark:text-slate-600 font-medium z-10">
                {placeholder}
            </p>
        </div>
    );
};

const PlayerCard = ({ player, onClear, rank, score, points }) => {
    const isWinner = rank === 1;

    const getCardTheme = () => {
        if (rank === 1) return {
            border: 'border-amber-500/50 dark:border-amber-400/50',
            bg: 'bg-gradient-to-b from-amber-50/80 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-950/30',
            shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
            text: 'text-amber-700 dark:text-amber-400',
            badge: 'bg-amber-400 text-amber-950'
        };
        return {
            border: 'border-slate-200 dark:border-slate-700',
            bg: 'bg-white dark:bg-slate-800/40',
            shadow: 'shadow-lg',
            text: 'text-slate-500 dark:text-slate-400',
            badge: 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
        };
    };

    const theme = getCardTheme();
    const dn = displayNameOf(player);
    const initial = dn ? dn.charAt(0) : '?';

    return (
        <div className={`h-full group relative flex flex-col items-center rounded-3xl p-1 border-2 ${theme.border} ${theme.bg} ${theme.shadow} backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] overflow-hidden min-h-[420px]`}>
            {isWinner && <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />}

            <div className="w-full flex justify-between items-start p-4 z-10">
                {isWinner ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-bold shadow-sm animate-fade-in">
                        <Trophy size={12} fill="currentColor" />
                        <span>MVP</span>
                    </div>
                ) : <div className="w-12" />}

                <button
                    onClick={onClear}
                    className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Retirer ce joueur"
                >
                    <IconX size={18} />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center w-full px-6 pb-6 z-10">
                <div className="relative mb-6 transform transition-transform duration-500 group-hover:-translate-y-1">
                    <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 ${isWinner ? 'bg-amber-400' : 'bg-sky-400'}`}></div>
                    <div className="w-32 h-32 relative rounded-2xl overflow-hidden border-2 border-white/20 dark:border-white/10 shadow-2xl bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                        <img
                            src={player.image}
                            alt={dn}
                            className="w-full h-full object-cover mix-blend-normal"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://placehold.co/128x128/1e293b/ffffff?text=${encodeURIComponent(initial)}`;
                            }}
                        />
                    </div>
                    {rank && (
                        <div className={`absolute -bottom-3 -right-3 w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm shadow-lg border-2 border-white dark:border-slate-800 ${theme.badge}`}>
                            #{rank}
                        </div>
                    )}
                </div>

                <div className="text-center mb-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-1">
                        {dn}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-0.5">
                        <span>{player.last_club_name}</span>
                        <span className="text-xs font-semibold text-sky-500">{player.competition || 'N/A'} - {player.season || 'N/A'}</span>
                    </p>
                </div>

                <div className="w-full grid grid-cols-2 gap-3 mb-6">
                    <div className="flex flex-col items-center p-2 rounded-xl bg-white/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/50">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Âge</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{player.age ?? '-'}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-xl bg-white/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/50">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Mins</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{player.minutes_on_field ?? '-'}</span>
                    </div>
                </div>
            </div>
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
            <div className={`grid gap-6 ${selectedPlayers.length === 0 ? 'grid-cols-1 max-w-md mx-auto min-h-[420px]' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'}`}>
                {selectedPlayers.map((player, index) => {
                    const id = player.id || player.unique_id || index;
                    return (
                        <div key={id} className="h-full min-h-[420px] relative">
                            <PlayerCard
                                player={player}
                                onClear={() => onRemovePlayer(player.id || player.unique_id)}
                            />
                            {selectedPlayers.length === 2 && index === 0 && (
                                <div className="hidden md:flex absolute -right-9 top-1/2 -translate-y-1/2 z-20 flex-col items-center justify-center animate-bounce-slow pointer-events-none">
                                    <div className="w-12 h-12 rounded-full bg-slate-900 border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-xl z-20 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black z-0"></div>
                                        <span className="font-black text-white text-xs italic z-10 relative">VS</span>
                                    </div>
                                    <div className="w-0.5 h-16 bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-700 to-transparent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 rotate-90 md:rotate-0"></div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {showAddButton && (
                    <div className="h-full min-h-[420px]">
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
