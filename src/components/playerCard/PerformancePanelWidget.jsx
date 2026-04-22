import React from 'react';

export default function PerformancePanelWidget({ player }) {
    if (!player) return null;

    // On extrait dynamiquement tous les indices (colonnes commençant par Indice_)
    const indices = Object.entries(player)
        .filter(([key]) => key.startsWith('Indice_'))
        .map(([key, value]) => ({
            label: key.replace('Indice_', '').replace(/_/g, ' '),
            value: Number(value)
        }))
        .sort((a, b) => b.value - a.value);

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-lg backdrop-blur-md h-full">
            <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 mb-5 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Indices de Performance
            </h3>
            <div className="space-y-4 pr-1 max-h-[500px] overflow-y-auto styled-scrollbar">
                {indices.length === 0 ? (
                    <div className="text-slate-500 text-xs italic">Aucun indice de performance disponible.</div>
                ) : (
                    indices.map((idx) => (
                        <div key={idx.label} className="group">
                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1.5 group-hover:text-emerald-400 transition-colors">
                                <span>{idx.label}</span>
                                <span className="text-white">{idx.value.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 shadow-inner p-[1px]">
                                <div 
                                    className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(52,211,153,0.3)]"
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
