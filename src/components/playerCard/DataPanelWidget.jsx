import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

const GaugeBar = ({ value }) => {
    const val = Math.min(100, Math.max(0, value));
    let colorClass = "bg-red-500 shadow-red-500/50";
    if (val >= 70) colorClass = "bg-emerald-500 shadow-emerald-500/50";
    else if (val >= 40) colorClass = "bg-yellow-500 shadow-yellow-500/50";

    return (
        <div className="flex items-center gap-2">
            <div className="w-16 md:w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner flex-shrink-0">
                <div 
                    className={`h-full ${colorClass} transition-all duration-700 ease-out shadow-[0_0_8px]`}
                    style={{ width: `${val}%` }}
                />
            </div>
            <span className={`text-[10px] font-black w-6 text-right ${val >= 70 ? 'text-emerald-400' : (val >= 40 ? 'text-yellow-400' : 'text-red-400')}`}>
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

        return items.sort((a, b) => a[0].localeCompare(b[0]));
    }, [player, tab, search]);

    if (!player) return null;

    return (
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5 shadow-2xl flex flex-col h-full backdrop-blur-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                        <span className="w-2 h-2 bg-sky-500 rounded-full"></span> Données Détaillées
                    </h3>
                    <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-[9px] font-black uppercase shadow-inner">
                        {[
                            { id: 'raw', label: 'Brutes' },
                            { id: 'pct', label: 'Percentiles' },
                            { id: 'indices', label: 'Indices' }
                        ].map(t => (
                            <button 
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`px-3 py-1.5 rounded-md transition-all ${tab === t.id ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative w-full md:w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input 
                        type="text" 
                        placeholder="Rechercher..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1.5 pl-9 pr-3 text-xs text-white focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto styled-scrollbar border border-white/5 rounded-lg bg-slate-900/30">
                <table className="w-full text-left border-collapse">
                    <thead className="text-[10px] uppercase font-black text-slate-500 sticky top-0 bg-slate-800/90 backdrop-blur-md z-10">
                        <tr>
                            <th className="py-3 px-4 border-b border-white/5">Statistique</th>
                            <th className="py-3 px-4 border-b border-white/5 text-right">Valeur</th>
                        </tr>
                    </thead>
                    <tbody className="text-[11px]">
                        {metrics.map(([key, val]) => (
                            <tr key={key} className="border-b border-white/5 hover:bg-sky-500/5 transition-colors group">
                                <td className="py-2.5 px-4 text-slate-400 group-hover:text-slate-200 truncate font-medium capitalize">
                                    {key.replace('_percentile', '').replace('_pct', '').replace('Indice_', '').replace(/_/g, ' ')}
                                </td>
                                <td className="py-2.5 px-4 text-right">
                                    {tab === 'raw' ? (
                                        <span className="font-black text-sky-400 group-hover:text-sky-300">
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
                                <td colSpan="2" className="py-10 text-center text-slate-600 italic">Aucune donnée correspondante.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
