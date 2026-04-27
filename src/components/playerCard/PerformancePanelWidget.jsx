import React from 'react';

export default function PerformancePanelWidget({ player, onSelectIndex }) {
    if (!player) return null;

    // On extrait dynamiquement tous les indices (colonnes commençant par Indice_)
    const indices = Object.entries(player)
        .filter(([key]) => key.startsWith('Indice_'))
        .sort(([, valA], [, valB]) => Number(valB) - Number(valA))
        .map(([key, value]) => ({
            label: key.replace('Indice_', '').replace(/_/g, ' '),
            value: Number(value)
        }));

    return (
        <div className="bg-canvas-black border border-hazard-white/10 rounded-[4px] p-6 h-full">
            <h3 className="verge-label-mono text-[10px] uppercase tracking-widest text-jelly-mint mb-6 flex items-center gap-2">
                <span className="w-1 h-3 bg-jelly-mint"></span> Performance Indices
            </h3>
            <div className="space-y-5 pr-1 max-h-[500px] overflow-y-auto styled-scrollbar">
                {indices.length === 0 ? (
                    <div className="verge-label-mono text-secondary-text text-[9px] italic">Aucun indice de performance disponible.</div>
                ) : (
                    indices.map((idx) => (
                        <div 
                            key={idx.label} 
                            onClick={() => onSelectIndex && onSelectIndex(idx.label)}
                            className="group cursor-pointer transition-all duration-200"
                        >
                            <div className="flex justify-between verge-label-mono text-[9px] font-black uppercase text-secondary-text mb-2 group-hover:text-jelly-mint transition-colors">
                                <span>{idx.label}</span>
                                <span className="text-hazard-white group-hover:scale-110 transition-transform">{idx.value.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-surface-slate rounded-full overflow-hidden border border-hazard-white/5 transition-colors">
                                <div 
                                    className="h-full bg-jelly-mint transition-all duration-1000 ease-out"
                                    style={{ width: `${idx.value}%` }}
                                ></div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
