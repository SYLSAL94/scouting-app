import React from 'react';

export default function PositionDistributionWidget({ player, onSelectPosition }) {
    if (!player) return null;

    // Extraction dynamique des postes joués
    const positions = [
        { label: player.primary_position, value: player.primary_position_percent, color: 'bg-jelly-mint' },
        { label: player.secondary_position, value: player.secondary_position_percent, color: 'bg-verge-ultraviolet' },
        { label: player.third_position, value: player.third_position_percent, color: 'bg-hazard-white/40' }
    ].filter(p => p.label && p.value > 0);

    return (
        <div className="bg-canvas-black border border-hazard-white/10 rounded-[4px] p-6">
            <h3 className="verge-label-mono text-[10px] uppercase tracking-widest text-hazard-white mb-6 flex items-center gap-2">
                <span className="w-1 h-3 bg-jelly-mint"></span> Répartition Postes
            </h3>
            <div className="space-y-5">
                {positions.map((pos) => (
                    <div 
                        key={pos.label}
                        onClick={() => onSelectPosition && onSelectPosition(pos.label)}
                        className="group cursor-pointer"
                    >
                        <div className="flex justify-between verge-label-mono text-[9px] font-black uppercase text-secondary-text mb-2 group-hover:text-hazard-white transition-colors">
                            <span>{pos.label}</span>
                            <span>{pos.value}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-slate rounded-full overflow-hidden border border-hazard-white/5 transition-all">
                            <div 
                                className={`h-full ${pos.color} transition-all duration-1000`}
                                style={{ width: `${pos.value}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
