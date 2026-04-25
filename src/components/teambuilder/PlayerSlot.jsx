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

    return (
        <div
            onClick={handleClick}
            className="absolute -translate-x-1/2 cursor-pointer group"
            style={slot.style}
        >
            <div
                className={`relative w-16 md:w-32 h-28 md:h-48 flex flex-col items-center justify-start p-1 transition-all duration-500 transform group-hover:-translate-y-2 rounded-[2px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] ${player ? 'bg-[#131313] border border-white/10' : 'bg-[#131313]/50 border border-dashed border-white/5 hover:border-[#3cffd0]/30 hover:bg-[#131313]'
                    }`}
            >
                {player ? (
                    <>
                        {/* Technical Role Label */}
                        <div className="absolute top-0 right-0 bg-[#2d2d2d] border-l border-b border-white/5 px-2 py-1 z-10">
                            <p className="verge-label-mono text-[6px] md:text-[9px] uppercase text-[#949494] font-black tracking-[0.1em]">{slot.displayRole}</p>
                        </div>

                        <div className="relative w-full aspect-square md:aspect-[1/1.2] mb-2 overflow-hidden bg-[#2d2d2d]">
                            {(player.image && !imgError) ? (
                                <img
                                    src={player.image}
                                    alt={dn}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center verge-label-mono text-xl md:text-4xl font-black text-white/20">
                                    {initials}
                                </div>
                            )}
                            
                            {/* Rating Badge - Sharp */}
                            {rating !== null && (
                                <div className="absolute bottom-0 right-0 bg-[#3cffd0] px-1.5 md:px-2.5 py-1 md:py-1.5 border-t border-l border-black/20 z-20">
                                    <span className="verge-label-mono text-black font-black text-[9px] md:text-[13px] tabular-nums">{rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-center w-full min-w-0 px-2 pb-1">
                            <p className="verge-label-mono font-black text-[7px] md:text-[10px] leading-tight text-white uppercase truncate w-full text-center tracking-tighter" title={dn}>
                                {dn}
                            </p>
                            <div className="hidden md:flex items-center gap-2 mt-2">
                                <div className="h-px w-4 bg-[#3cffd0]/30" />
                                <p className="verge-label-mono text-[8px] font-black text-[#3cffd0] uppercase tracking-widest opacity-60">
                                    {player.season !== 'N/A' ? player.season : '23/24'}
                                </p>
                                <div className="h-px w-4 bg-[#3cffd0]/30" />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Shirt size={24} className="md:w-10 md:h-10" strokeWidth={1} />
                        <div className="flex flex-col items-center">
                            <span className="verge-label-mono font-black text-[7px] md:text-[10px] text-white uppercase tracking-[0.2em]">{slot.displayRole}</span>
                            <span className="verge-label-mono text-[5px] md:text-[7px] text-[#3cffd0] uppercase font-black tracking-widest mt-1">EMPTY_NODE</span>
                        </div>
                    </div>
                )}
                
                {/* Bottom Accent */}
                {player && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3cffd0] opacity-0 group-hover:opacity-100 transition-opacity" />}
            </div>
        </div>
    );
}
