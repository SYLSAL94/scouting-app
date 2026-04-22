// src/components/teambuilder/Field.jsx
import React from 'react';
import PlayerSlot from './PlayerSlot';

export default function Field({ formationLayout, formation, onSlotClick }) {
    if (!formationLayout) {
        return <div className="text-center p-8 text-slate-500">Veuillez sélectionner une formation.</div>;
    }
    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <div className="relative aspect-[7/10] h-full bg-emerald-900/40 rounded-3xl overflow-hidden shadow-2xl border border-white/5 backdrop-blur-sm">
                {/* Pelouse stylisée */}
                <div className="absolute inset-0">
                    <div className="h-full w-full flex flex-col">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}`} />
                        ))}
                    </div>
                </div>
                
                {/* Lignes du terrain */}
                <div className="absolute inset-0 z-0 opacity-20">
                    {/* Ligne médiane */}
                    <div className="absolute top-1/2 left-[5%] right-[5%] h-[2px] bg-white -translate-y-1/2" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25%] aspect-square border-2 border-white rounded-full" />
                    
                    {/* Surfaces de réparation */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[16.5%] border-2 border-white rounded-b-lg border-t-0" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[35%] h-[5.5%] border-2 border-white rounded-b-lg border-t-0" />
                    
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[16.5%] border-2 border-white rounded-t-lg border-b-0" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[35%] h-[5.5%] border-2 border-white rounded-t-lg border-b-0" />
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
            </div>
        </div>
    );
}
