import React from 'react';

export default function DetailsPanelWidget({ player }) {
    if (!player) return null;

    const infoItems = [
        { label: 'Âge', value: player.age, unit: 'ans' },
        { label: 'Taille', value: player.height, unit: 'cm' },
        { label: 'Poids', value: player.weight, unit: 'kg' },
        { label: 'Temps Jeu', value: Number(player.playtime_percent || 0).toFixed(1), unit: '%' },
        { label: 'Minutes', value: player.minutes_on_field, unit: 'min' },
        { label: 'Valeur', value: player.market_value || '0', unit: '€' }
    ];

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
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-lg backdrop-blur-md">
            <h3 className="text-sm font-black uppercase tracking-widest text-sky-400 mb-5 flex items-center gap-2">
                <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse"></span> Details & Contexte
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
                {infoItems.map((item, idx) => (
                    <div key={idx} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 hover:border-sky-500/30 transition-all">
                        <div className="text-[10px] uppercase font-black text-slate-500 mb-1 tracking-tighter">{item.label}</div>
                        <div className="text-sm font-black text-white">{item.value || 'N/A'} <span className="text-[10px] text-slate-400 font-medium">{item.unit}</span></div>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-white/5 pb-2">Profils du poste — Affinité</div>
                <div className="flex gap-2">
                    {affinityProfiles.length > 0 ? (
                        affinityProfiles.map((profile, i) => (
                            <div key={profile.role} className={`flex-1 bg-slate-800/60 p-2 rounded-lg border ${i===0?'border-yellow-500/30':i===1?'border-slate-400/30':'border-orange-500/30'} text-center shadow-inner`}>
                                <div className={`text-[8px] font-black uppercase ${i===0?'text-yellow-500':i===1?'text-slate-300':'text-orange-400'}`}>
                                    {i===0?'🥇 OR':i===1?'🥈 ARGENT':'🥉 BRONZE'}
                                </div>
                                <div className="text-[10px] font-black truncate mt-1 text-white" title={profile.role}>{profile.role}</div>
                                <div className="text-[9px] font-bold text-slate-500">{profile.pct.toFixed(1)}%</div>
                            </div>
                        ))
                    ) : (
                        <div className="w-full text-center py-2 text-[10px] text-slate-500 italic">Aucune affinité calculée pour ce profil.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
