// src/components/teambuilder/PlayerSlot.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Shirt, Footprints } from 'lucide-react';

const displayNameOf = (p) =>
    String(p?.name || p?.full_name || p?.Joueur || p?.player_name || 'Inconnu');

export default function PlayerSlot({ slot, player, onClick }) {
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = String(name).trim().split(/\s+/);
        return parts.length > 1
            ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
            : String(name).substring(0, 2).toUpperCase();
    };

    const getRatingStyle = useCallback((rating) => {
        if (typeof rating !== 'number' || isNaN(rating)) {
            const color = '#64748b'; 
            return { borderColor: color, '--rating-color': color };
        }
        const percent = Math.max(0, Math.min(100, ((rating - 50) / 45) * 100));
        const hue = (percent / 100) * 120; 
        const color = `hsl(${hue}, 80%, 50%)`;
        return { borderColor: color, '--rating-color': color };
    }, []);

    // Extraction robuste de la note (priorité au displayRating, puis pondérée, puis globale)
    const rawRating = player?.displayRating ?? player?.note_ponderee ?? player?.note_globale;
    const rating = (rawRating !== undefined && rawRating !== null) ? Number(rawRating) : null;
    
    const ratingStyle = getRatingStyle(rating);
    const [imgError, setImgError] = useState(false);

    useEffect(() => { setImgError(false); }, [player]);

    const dn = displayNameOf(player); 
    const initials = getInitials(dn);

    const handleClick = (e) => {
        e.stopPropagation();
        onClick?.(player);
    };

    return (
        <div
            onClick={handleClick}
            className="absolute -translate-x-1/2 cursor-pointer group"
            style={slot.style}
        >
            <div
                className={`relative w-16 md:w-28 h-28 md:h-44 flex flex-col items-center justify-start pt-2 md:pt-3 text-center p-1 md:p-2 transition-all duration-300 transform group-hover:-translate-y-1 rounded-xl md:rounded-2xl shadow-2xl ${player ? 'bg-slate-900/60 border border-white/10 backdrop-blur-lg' : 'bg-white/5 border-2 border-dashed border-white/10 backdrop-blur-md hover:bg-white/10'
                    }`}
            >
                {player ? (
                    <>
                        <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-black/50 px-1.5 md:px-2 py-0.5 rounded-full backdrop-blur-sm z-10">
                            <p className="text-[7px] md:text-[10px] uppercase text-slate-200 font-bold tracking-wider">{slot.displayRole}</p>
                        </div>

                        <div className="relative mb-1 md:mb-2 mt-1 md:mt-2">
                            <div
                                className="w-12 h-12 md:w-20 md:h-20 rounded-lg md:rounded-xl border shadow-lg overflow-hidden bg-slate-800/50 flex items-center justify-center transition-shadow duration-300 group-hover:shadow-[0_0_15px_var(--rating-color)]"
                                style={ratingStyle}
                            >
                                {(player.image && !imgError) ? (
                                    <img
                                        src={player.image}
                                        alt={dn}
                                        className="w-full h-full object-contain"
                                        onError={() => setImgError(true)}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                                        <span className="text-lg md:text-3xl font-bold text-white/80">{initials}</span>
                                    </div>
                                )}
                            </div>

                            {rating !== null && (
                                <div 
                                    className="absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center border bg-slate-900 shadow-lg z-20" 
                                    style={{ 
                                        borderColor: ratingStyle.borderColor, 
                                        boxShadow: `0 0 10px ${ratingStyle['--rating-color']}44` 
                                    }}
                                >
                                    <span className="text-white font-black text-[9px] md:text-[13px] tracking-tighter">{rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-center flex-grow justify-center w-full min-w-0">
                            <p className="font-bold text-[8px] md:text-xs leading-tight text-white truncate w-full px-1" title={dn}>
                                {dn}
                            </p>
                            <div className="hidden md:flex items-center gap-1 mt-1">
                                {player.foot && <Footprints size={10} className="text-slate-400" />}
                                {(player.season && player.season !== 'N/A') && (
                                    <p className="text-[9px] font-semibold text-sky-300 bg-sky-900/50 px-1.5 py-0.5 rounded-full">
                                        {player.season}
                                    </p>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-8 h-8 md:w-16 md:h-16 rounded-lg md:rounded-xl bg-white/5 flex items-center justify-center mb-1 md:mb-2">
                            <Shirt className="text-white/20" size={16} md:size={32} />
                        </div>
                        <span className="font-bold text-[8px] md:text-sm text-white/60">{slot.displayRole}</span>
                        <span className="text-[7px] md:text-[10px] text-white/30 uppercase font-black">Choisir</span>
                    </>
                )}
            </div>
        </div>
    );
}
