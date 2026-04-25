// src/components/teambuilder/Field.jsx
import React from 'react';
import PlayerSlot from './PlayerSlot';

export default function Field({ formationLayout, formation, onSlotClick }) {
    if (!formationLayout) {
        return <div className="verge-label-mono text-center p-12 text-[#949494] uppercase tracking-widest text-xs">Veuillez sélectionner une formation.</div>;
    }
    return (
        <div className="w-full h-full flex items-center justify-center p-8 bg-[#131313]">
            <div className="relative aspect-[7/10] h-full w-auto mx-auto bg-[#1a1a1a] rounded-[4px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)] border border-white/10">
                {/* Pelouse stylisée - Grille Technique */}
                <div className="absolute inset-0">
                    <div className="h-full w-full grid grid-cols-6 grid-rows-10">
                        {[...Array(60)].map((_, i) => (
                            <div key={i} className="border-[0.5px] border-white/[0.02]" />
                        ))}
                    </div>
                </div>
                
                {/* Lignes du terrain - Haute Précision */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                    {/* Ligne médiane */}
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white -translate-y-1/2" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25%] aspect-square border border-white" />
                    
                    {/* Surfaces de réparation - Sharp */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[16.5%] border border-white border-t-0" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-[5.5%] border border-white border-t-0" />
                    
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[16.5%] border border-white border-b-0" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-[5.5%] border border-white border-b-0" />
                </div>

                {/* Slots tactiques */}
                <div className="relative z-10 w-full h-full">
                    {(formationLayout || []).map((slot) => (
                        <PlayerSlot
                            key={slot.id}
                            slot={slot}
                            player={formation[slot.id]}
                            onClick={() => onSlotClick?.(slot.id)}
                        />
                    ))}
                </div>

                {/* Corner Markers */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#3cffd0]/30" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#3cffd0]/30" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#3cffd0]/30" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#3cffd0]/30" />
            </div>
        </div>
    );
}
