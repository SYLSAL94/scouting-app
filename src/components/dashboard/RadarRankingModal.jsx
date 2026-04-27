import React, { useState, useEffect } from 'react';
import { X, Trophy, Plus, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

export const RadarRankingModal = ({
    isOpen,
    onClose,
    metric,
    onPlayerSelect,
    onAddPlayer,
    metricDisplayMode,
    selectedEntityIds = [],
    entityColors = []
}) => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !metric) return;
        
        // Zéro-Calcul : Fetch the top 100 from API
        const fetchRanking = async () => {
            setLoading(true);
            try {
                // Find the technical metric ID if the user clicked the display label
                // For simplicity assuming metric passed is the technical id or we just pass it to API
                // Wait, in RadarChartVisualization, tickProps.payload.value is passed, which is the display label.
                // We need the technical ID. Let's pass the technical ID from the parent component instead!
                const res = await fetch(`https://api-scouting.theanalyst.cloud/api/radar/ranking?metric=${metric}`);
                if (res.ok) {
                    const data = await res.json();
                    setPlayers(data);
                }
            } catch (err) {
                console.error("Failed to fetch ranking", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRanking();
    }, [isOpen, metric]);

    if (!isOpen) return null;

    const modal = (
        <div
            className="fixed inset-0 bg-absolute-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 transition-all duration-300"
            onClick={onClose}
        >
            <div
                className="relative bg-hazard-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <header className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                            <Trophy className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-hazard-white leading-tight">Ranking</h3>
                            <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold truncate max-w-[200px]" title={metric}>
                                {metric}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
                    >
                        <X size={20} />
                    </button>
                </header>

                {/* List */}
                <div className="p-4 space-y-3 overflow-y-auto styled-scrollbar">
                    {loading ? (
                        <div className="text-center p-4 text-sky-500 animate-pulse text-sm font-bold">Chargement du classement...</div>
                    ) : players.map((player, index) => {
                        const isMedian = player.isMedian;
                        // Radar API now returns "value" in the ranking API as "rawValue" (based on our python query AS rawValue)
                        const displayValue = player.rawValue;
                        const radarIdx = selectedEntityIds.indexOf(player.id);
                        const isCurrentlyOnRadar = radarIdx !== -1;
                        const color = isCurrentlyOnRadar ? (entityColors[radarIdx % entityColors.length]?.stroke || '#38bdf8') : '#94a3b8';

                        return (
                            <div
                                key={player.id || index}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${isMedian ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' : 'bg-hazard-white dark:bg-slate-800/30 border-slate-100 dark:border-slate-700/50 hover:border-sky-300 dark:hover:border-sky-500/50 hover:shadow-md'
                                    } ${!isMedian && onPlayerSelect ? 'cursor-pointer' : ''}`}
                                onClick={() => !isMedian && onPlayerSelect && onPlayerSelect({
                                    id: player.id,
                                    name: player.name || player.full_name,
                                    season: player.season,
                                    competition: player.competition
                                })}
                            >
                                {/* Rank */}
                                <div className="w-8 flex justify-center text-lg font-black text-slate-300 dark:text-slate-700 italic">
                                    #{index + 1}
                                </div>

                                {/* Image */}
                                <div className="relative">
                                    <div
                                        className="w-10 h-10 rounded-full border-2 bg-hazard-white dark:bg-slate-900 overflow-hidden shadow-sm"
                                        style={{ borderColor: color }}
                                    >
                                        {player.image ? (
                                            <img src={player.image} alt="" className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 uppercase font-bold text-xs">
                                                {(player.name || player.full_name || '?').charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-hazard-white dark:border-slate-900"
                                        style={{ backgroundColor: color }}
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                                        {player.name || player.full_name}
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                        {player.last_club_name || '—'} {player.season ? `• ${player.season}` : ''}
                                    </div>
                                </div>

                                {/* Value */}
                                <div className="text-right">
                                    <div className="text-sm font-black text-slate-900 dark:text-hazard-white tabular-nums">
                                        {typeof displayValue === 'number' ? displayValue.toFixed(2) : displayValue}
                                    </div>
                                </div>

                                {/* Add Button */}
                                {!isMedian && onAddPlayer && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAddPlayer(player.id);
                                        }}
                                        className={`ml-2 p-2 rounded-lg transition-all duration-200 ${isCurrentlyOnRadar
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                            : 'bg-sky-500 text-hazard-white shadow-lg shadow-sky-500/20 hover:scale-110 active:scale-95'
                                            }`}
                                        title={isCurrentlyOnRadar ? 'Déjà dans la comparaison' : 'Ajouter à la comparaison'}
                                    >
                                        {isCurrentlyOnRadar ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
};

export default RadarRankingModal;
