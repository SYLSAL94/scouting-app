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

    const rawRating = player?.displayRating ?? player?.note_ponderee ?? player?.note_globale;
    const rating = (rawRating !== undefined && rawRating !== null) ? Number(rawRating) : null;
    
    const [imgError, setImgError] = useState(false);
    useEffect(() => { setImgError(false); }, [player]);

    const dn = displayNameOf(player); 
    const initials = getInitials(dn);

    const handleClick = (e) => {
        e.stopPropagation();
        onClick?.(player);
    };

    const ratingColor = rating !== null ? (rating >= 70 ? '#3cffd0' : rating >= 40 ? '#facc15' : '#f43f5e') : '#949494';

    return (
        <div
            onClick={handleClick}
            className="absolute -translate-x-1/2 cursor-pointer group"
            style={slot.style}
        >
            <div
                className={`relative w-14 md:w-32 flex flex-col items-center justify-start p-1 transition-all duration-500 transform group-hover:-translate-y-2 rounded-[1px] shadow-2xl ${player ? 'bg-canvas-black border border-hazard-white/10' : 'bg-canvas-black/30 border border-dashed border-hazard-white/5 hover:border-jelly-mint/30 hover:bg-canvas-black'
                    }`}
            >
                {player ? (
                    <>
                        {/* Technical Role Label - Desktop Only */}
                        <div className="hidden md:block absolute top-0 right-0 bg-surface-slate border-l border-b border-hazard-white/5 px-2 py-1 z-10">
                            <p className="verge-label-mono text-[9px] uppercase text-secondary-text font-black tracking-[0.1em]">{slot.displayRole}</p>
                        </div>

                        <div className="relative w-full aspect-square md:aspect-[1/1.2] overflow-hidden bg-surface-slate">
                            {(player.image && !imgError) ? (
                                <img
                                    src={player.image}
                                    alt={dn}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center verge-label-mono text-lg md:text-4xl font-black text-hazard-white/20">
                                    {initials}
                                </div>
                            )}
                            
                            {/* Rating Badge - Desktop Only with performance color */}
                            {rating !== null && (
                                <div 
                                    className="hidden md:block absolute bottom-0 right-0 px-2.5 py-1.5 border-t border-l border-absolute-black/20 z-20"
                                    style={{ backgroundColor: ratingColor }}
                                >
                                    <span className="verge-label-mono text-absolute-black font-black text-[13px] tabular-nums leading-none">{rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-center w-full min-w-0 px-1 pt-1 pb-1">
                            {/* Mobile: Show Rating with color / Desktop: Show Name */}
                            <p 
                                className="md:hidden verge-label-mono font-black text-[10px] leading-tight uppercase truncate w-full text-center tracking-tighter"
                                style={{ color: ratingColor }}
                            >
                                {rating !== null ? rating.toFixed(1) : '-'}
                            </p>
                            <p className="hidden md:block verge-label-mono font-black text-[10px] leading-tight text-hazard-white uppercase truncate w-full text-center tracking-tighter" title={dn}>
                                {dn}
                            </p>
                            <div className="hidden md:flex items-center gap-2 mt-2">
                                <div className="h-px w-4 bg-jelly-mint/30" />
                                <p className="verge-label-mono text-[8px] font-black text-jelly-mint uppercase tracking-widest opacity-60">
                                    {player.season !== 'N/A' ? player.season : '23/24'}
                                </p>
                                <div className="h-px w-4 bg-jelly-mint/30" />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-4 md:py-10 gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Shirt size={16} className="md:w-10 md:h-10" strokeWidth={1} />
                        <div className="flex flex-col items-center">
                            <span className="verge-label-mono font-black text-[6px] md:text-[10px] text-hazard-white uppercase tracking-widest">{slot.displayRole}</span>
                        </div>
                    </div>
                )}
                
                {/* Bottom Accent */}
                {player && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-jelly-mint opacity-0 group-hover:opacity-100 transition-opacity" />}
            </div>
        </div>
    );
}
