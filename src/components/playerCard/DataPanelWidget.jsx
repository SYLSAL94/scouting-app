import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

const GaugeBar = ({ value }) => {
    const val = Math.min(100, Math.max(0, value));
    let barColor = "bg-red-500";
    if (val >= 70) barColor = "bg-jelly-mint";
    else if (val >= 40) barColor = "bg-yellow-400";

    return (
        <div className="flex items-center gap-3 w-full max-w-[140px]">
            <div className="flex-grow h-1.5 bg-surface-slate rounded-full overflow-hidden shrink-0 border border-hazard-white/5">
                <div 
                    className={`h-full ${barColor} transition-all duration-700 ease-out`}
                    style={{ width: `${val}%` }}
                />
            </div>
            <span className={`verge-label-mono text-[9px] font-black w-6 text-right shrink-0 ${val >= 70 ? 'text-jelly-mint' : (val >= 40 ? 'text-yellow-400' : 'text-red-400')}`}>
                {Math.round(val)}
            </span>
        </div>
    );
};

export default function DataPanelWidget({ player }) {
    const [tab, setTab] = useState('raw'); // 'raw', 'pct', 'indices'
    const [search, setSearch] = useState('');

    const metrics = useMemo(() => {
        if (!player) return [];
        let items = [];
        if (tab === 'pct') {
            items = Object.entries(player).filter(([k]) => k.endsWith('_percentile') || k.endsWith('_pct'));
        } else if (tab === 'indices') {
            items = Object.entries(player).filter(([k]) => k.startsWith('Indice_'));
        } else {
            items = Object.entries(player).filter(([k, v]) => 
                typeof v === 'number' && 
                !k.endsWith('_percentile') && 
                !k.endsWith('_pct') && 
                !k.startsWith('Indice_') && 
                !['id', 'wyId', 'age', 'height', 'weight', 'minutes_on_field', 'market_value'].includes(k)
            );
        }

        if (search) {
            items = items.filter(([k]) => k.toLowerCase().includes(search.toLowerCase()));
        }

        return items.sort(([, valA], [, valB]) => Number(valB) - Number(valA));
    }, [player, tab, search]);

    if (!player) return null;

    return (
        <div className="bg-canvas-black border border-hazard-white/10 rounded-[4px] p-6 flex flex-col h-full max-h-[550px]">
            <div className="space-y-5 mb-6">
                <div className="flex justify-between items-center gap-4">
                    <h3 className="verge-label-mono text-[10px] uppercase tracking-widest text-jelly-mint flex items-center gap-2 shrink-0">
                        <span className="w-1 h-3 bg-jelly-mint"></span> 
                        Statistiques
                    </h3>
                    <div className="relative flex-grow max-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" size={12} />
                        <input 
                            type="text" 
                            placeholder="RECHERCHER..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-surface-slate border border-hazard-white/10 rounded-[4px] py-2.5 pl-9 pr-3 verge-label-mono text-[9px] text-hazard-white focus:border-jelly-mint outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex bg-surface-slate p-1 rounded-[4px] border border-hazard-white/10">
                    {[
                        { id: 'raw', label: 'Brutes' },
                        { id: 'pct', label: 'Percentiles' },
                        { id: 'indices', label: 'Indices' }
                    ].map(t => (
                        <button 
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex-1 px-4 py-2 rounded-[2px] verge-label-mono text-[9px] font-black uppercase transition-all ${tab === t.id ? 'bg-jelly-mint text-absolute-black' : 'text-secondary-text hover:text-hazard-white'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto styled-scrollbar border border-hazard-white/5 bg-canvas-black">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead className="verge-label-mono text-[8px] uppercase font-black text-secondary-text sticky top-0 bg-canvas-black z-10 border-b border-hazard-white/10">
                        <tr>
                            <th className="w-[60%] py-4 px-4">Statistique</th>
                            <th className="w-[40%] py-4 px-4 text-right">Valeur</th>
                        </tr>
                    </thead>
                    <tbody className="verge-label-mono text-[10px]">
                        {metrics.map(([key, val]) => (
                            <tr key={key} className="border-b border-hazard-white/5 hover:bg-surface-slate transition-colors group">
                                <td className="py-3 px-4 text-secondary-text group-hover:text-hazard-white truncate uppercase font-bold" title={key.replace(/_/g, ' ')}>
                                    {key.replace('_percentile', '').replace('_pct', '').replace('Indice_', '').replace(/_/g, ' ')}
                                </td>
                                <td className="py-3 px-4 text-right">
                                    {tab === 'raw' ? (
                                        <span className="font-black text-hazard-white group-hover:text-jelly-mint transition-colors">
                                            {typeof val === 'number' ? val.toFixed(2) : val}
                                        </span>
                                    ) : (
                                        <div className="flex justify-end">
                                            <GaugeBar value={Number(val)} />
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {metrics.length === 0 && (
                            <tr>
                                <td colSpan="2" className="py-12 text-center text-secondary-text italic verge-label-mono text-[9px]">Aucune donnée correspondante.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
