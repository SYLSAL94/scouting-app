import React from 'react';

export default function PositionDistributionWidget({ player, onSelectPosition }) {
    if (!player) return null;

    // Extraction dynamique des postes joués
    const positions = [
        { label: player.primary_position, value: player.primary_position_percent, color: 'bg-sky-500' },
        { label: player.secondary_position, value: player.secondary_position_percent, color: 'bg-emerald-500' },
        { label: player.third_position, value: player.third_position_percent, color: 'bg-amber-500' }
    ].filter(p => p.label && p.value > 0);

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-lg backdrop-blur-md">
            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-sky-400 rounded-full"></span> Répartition des Postes
            </h3>
            <div className="space-y-4">
                {positions.map((pos) => (
                    <div 
                        key={pos.label}
                        onClick={() => onSelectPosition && onSelectPosition(pos.label)}
                        className="group cursor-pointer"
                    >
                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1.5 group-hover:text-sky-400 transition-colors">
                            <span>{pos.label}</span>
                            <span>{pos.value}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 group-hover:border-sky-500/30 transition-all">
                            <div 
                                className={`h-full ${pos.color} rounded-full transition-all duration-1000 group-hover:brightness-125`}
                                style={{ width: `${pos.value}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
