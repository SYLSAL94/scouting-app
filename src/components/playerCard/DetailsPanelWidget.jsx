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
        <div className="bg-[#131313] border border-white/10 rounded-[4px] p-6">
            <h3 className="verge-label-mono text-[#3cffd0] mb-6 flex items-center gap-2">
                <span className="w-1 h-3 bg-[#3cffd0]"></span> Details & Contexte
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-8">
                {infoItems.map((item, idx) => (
                    <div key={idx} className="bg-[#2d2d2d] p-4 border border-white/5 hover:border-[#3cffd0] transition-all duration-300 group rounded-[2px]">
                        <div className="verge-label-mono text-[8px] mb-2 text-[#949494] group-hover:text-[#3cffd0] transition-colors uppercase tracking-widest">{item.label}</div>
                        <div className="text-sm font-black text-white flex items-baseline gap-1">
                            {item.value || '—'} 
                            <span className="verge-label-mono text-[8px] text-[#949494] uppercase">{item.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-4 mb-8">
                <div className="verge-label-mono text-[9px] text-white/40 border-b border-white/10 pb-2 uppercase tracking-widest">Points Forts — Stats Brutes</div>
                <div className="grid grid-cols-2 gap-3">
                    {topPercentiles.map((stat, idx) => (
                        <div key={idx} className="bg-[#131313] p-3 border border-white/10 group hover:border-[#3cffd0] transition-all rounded-[2px]">
                            <div className="verge-label-mono text-[7px] text-[#949494] mb-1 truncate uppercase" title={stat.label}>{stat.label}</div>
                            <div className="flex items-baseline justify-between">
                                <div className="text-[11px] font-black text-white">
                                    {typeof stat.rawValue === 'number' ? stat.rawValue.toFixed(2) : stat.rawValue || '—'}
                                </div>
                                <div className="verge-label-mono text-[8px] text-[#3cffd0]">P{Math.round(stat.percentile)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="verge-label-mono text-[9px] text-white/40 border-b border-white/10 pb-2 uppercase tracking-widest">Profils du poste — Affinité</div>
                <div className="grid grid-cols-3 gap-3">
                    {affinityProfiles.length > 0 ? (
                        affinityProfiles.map((profile, i) => (
                            <div 
                                key={profile.role} 
                                onClick={() => onSelectProfile && onSelectProfile(profile.role)}
                                className={`bg-[#2d2d2d] p-3 border cursor-pointer transition-all duration-300 hover:bg-[#3cffd0] hover:text-black group rounded-[2px] ${
                                    i===0?'border-[#3cffd0]':
                                    i===1?'border-white/20':
                                    'border-[#5200ff]'
                                } text-center flex flex-col justify-between h-[80px]`}
                            >
                                <div className={`verge-label-mono text-[7px] ${i===0?'text-[#3cffd0]':i===1?'text-[#949494]':'text-[#5200ff]'} group-hover:text-black`}>
                                    {i===0?'01':i===1?'02':'03'}
                                </div>
                                <div className="text-[9px] font-black truncate mt-1 group-hover:text-black uppercase leading-tight" title={profile.role}>{profile.role}</div>
                                <div className="verge-label-mono text-[8px] text-[#949494] group-hover:text-black font-black">{profile.pct.toFixed(1)}%</div>
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
