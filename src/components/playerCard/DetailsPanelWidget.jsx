import React from 'react';

export default function DetailsPanelWidget({ player, onSelectProfile }) {
    if (!player) return null;

    const infoItems = [
        { label: 'Âge', value: player.season_age || player.age, unit: 'ans' },
        { label: 'Taille', value: player.height, unit: 'cm' },
        { label: 'Poids', value: player.weight, unit: 'kg' },
        { label: 'Temps Jeu', value: Number(player.playtime_percent || 0).toFixed(1), unit: '%' },
        { label: 'Minutes', value: player.minutes_on_field, unit: 'min' },
        { label: 'Valeur', value: player.market_value || '0', unit: '€' }
    ];

    const topPercentiles = React.useMemo(() => {
        if (!player) return [];
        return Object.entries(player)
            .filter(([key, value]) => (key.endsWith('_percentile') || key.endsWith('_pct')) && value != null)
            .map(([key, value]) => {
                const metricKey = key.replace('_percentile', '').replace('_pct', '');
                return {
                    label: metricKey.replace(/_/g, ' '),
                    percentile: parseFloat(value),
                    rawValue: player[metricKey]
                };
            })
            .sort((a, b) => b.percentile - a.percentile)
            .slice(0, 4);
    }, [player]);

    const affinityProfiles = React.useMemo(() => {
        if (!player) return [];
        return Object.entries(player)
            .filter(([key, value]) => key.startsWith('profile_affinity_') && value != null && value !== "")
            .map(([key, value]) => ({
                role: key.replace('profile_affinity_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                pct: parseFloat(value)
            }))
            .sort((a, b) => b.pct - a.pct)
            .slice(0, 3);
    }, [player]);

    return (
        <div className="bg-canvas-black border border-hazard-white/10 rounded-[4px] p-6">
            <h3 className="verge-label-mono text-jelly-mint mb-6 flex items-center gap-2">
                <span className="w-1 h-3 bg-jelly-mint"></span> Details & Contexte
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-8">
                {infoItems.map((item, idx) => (
                    <div key={idx} className="bg-surface-slate p-4 border border-hazard-white/5 hover:border-jelly-mint transition-all duration-300 group rounded-[2px]">
                        <div className="verge-label-mono text-[8px] mb-2 text-secondary-text group-hover:text-jelly-mint transition-colors uppercase tracking-widest">{item.label}</div>
                        <div className="text-sm font-black text-hazard-white flex items-baseline gap-1">
                            {item.value || '—'} 
                            <span className="verge-label-mono text-[8px] text-secondary-text uppercase">{item.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-4 mb-8">
                <div className="verge-label-mono text-[9px] text-hazard-white/40 border-b border-hazard-white/10 pb-2 uppercase tracking-widest">Points Forts — Stats Brutes</div>
                <div className="grid grid-cols-2 gap-3">
                    {topPercentiles.map((stat, idx) => (
                        <div key={idx} className="bg-canvas-black p-3 border border-hazard-white/10 group hover:border-jelly-mint transition-all rounded-[2px]">
                            <div className="verge-label-mono text-[7px] text-secondary-text mb-1 truncate uppercase" title={stat.label}>{stat.label}</div>
                            <div className="flex items-baseline justify-between">
                                <div className="text-[11px] font-black text-hazard-white">
                                    {typeof stat.rawValue === 'number' ? stat.rawValue.toFixed(2) : stat.rawValue || '—'}
                                </div>
                                <div className="verge-label-mono text-[8px] text-jelly-mint">P{Math.round(stat.percentile)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="verge-label-mono text-[9px] text-hazard-white/40 border-b border-hazard-white/10 pb-2 uppercase tracking-widest">Profils du poste — Affinité</div>
                <div className="grid grid-cols-3 gap-3">
                    {affinityProfiles.length > 0 ? (
                        affinityProfiles.map((profile, i) => (
                            <div 
                                key={profile.role} 
                                onClick={() => onSelectProfile && onSelectProfile(profile.role)}
                                className={`bg-surface-slate p-3 border cursor-pointer transition-all duration-300 hover:bg-jelly-mint hover:text-absolute-black group rounded-[2px] ${
                                    i===0?'border-jelly-mint':
                                    i===1?'border-hazard-white/20':
                                    'border-verge-ultraviolet'
                                } text-center flex flex-col justify-between h-[80px]`}
                            >
                                <div className={`verge-label-mono text-[7px] ${i===0?'text-jelly-mint':i===1?'text-secondary-text':'text-verge-ultraviolet'} group-hover:text-absolute-black`}>
                                    {i===0?'01':i===1?'02':'03'}
                                </div>
                                <div className="text-[9px] font-black truncate mt-1 group-hover:text-absolute-black uppercase leading-tight" title={profile.role}>{profile.role}</div>
                                <div className="verge-label-mono text-[8px] text-secondary-text group-hover:text-absolute-black font-black">{profile.pct.toFixed(1)}%</div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-2 verge-label-mono text-[9px] italic">Aucune affinité calculée.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
