import React, { useMemo, useState, useRef, useEffect } from 'react';
import { MetricSelectionPanel } from './MetricSelectionPanel';
import { Activity } from 'lucide-react';

const ROW_H = 50; 
const OVERSCAN = 10;
const FIRST_COL_PCT = 30;

// Utilitaire de formatage premium pour les labels de Data Science
const formatDSLabel = (label) => {
    if (!label) return "";
    return label
        .replace('_avg_norm', '')
        .replace('_norm', '')
        .replace(/_/g, ' ')
        .replace('xg', 'xG')
        .toUpperCase();
};

const FaceToFaceComparison = ({ player1, player2, metrics, availableMetrics }) => {
    return (
        <div className="space-y-6">
            {metrics.map((metricId) => {
                const opt = availableMetrics.find(m => m.value === metricId);
                const metricLabel = opt ? opt.label : formatDSLabel(metricId);
                const v1 = Number(player1[metricId] || 0);
                const v2 = Number(player2[metricId] || 0);

                const isP1Winner = v1 > v2;
                const isP2Winner = v2 > v1;

                const isPercentile = metricId.includes('norm') || metricId.includes('_pct') || metricLabel.toLowerCase().includes('percentile');
                // Les variables _norm sont déjà sur une base 0-100 ou 0-1
                // On assume ici une base 0-100 pour les graphiques de barres
                const denominator = isPercentile ? 100 * 1.05 : (Math.max(v1, v2) * 1.2 || 1);

                return (
                    <div key={metricId} className="group flex flex-col items-center">
                        <div className="w-full flex justify-between items-end mb-2 px-1">
                            <span className={`text-lg font-bold tabular-nums transition-all ${isP1Winner ? 'text-sky-500 scale-110' : 'text-slate-400'}`}>
                                {v1.toFixed(2)}
                            </span>
                            <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-tighter mb-1 px-4 text-center">
                                {metricLabel}
                            </span>
                            <span className={`text-lg font-bold tabular-nums transition-all ${isP2Winner ? 'text-amber-500 scale-110' : 'text-slate-400'}`}>
                                {v2.toFixed(2)}
                            </span>
                        </div>
                        <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex relative shadow-inner">
                            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 z-10"></div>
                            <div className="w-1/2 flex justify-end">
                                <div
                                    className={`h-full transition-all duration-700 ease-out ${isP1Winner ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    style={{ width: `${Math.min(100, (v1 / denominator) * 100)}%` }}
                                ></div>
                            </div>
                            <div className="w-1/2 flex justify-start">
                                <div
                                    className={`h-full transition-all duration-700 ease-out ${isP2Winner ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    style={{ width: `${Math.min(100, (v2 / denominator) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const ComparisonTable = ({ players, metrics, availableMetrics }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });

    const metricsToCompare = useMemo(
        () => metrics.map((metricId) => {
            const opt = availableMetrics.find(m => m.value === metricId);
            return {
                id: metricId,
                label: opt ? opt.label : formatDSLabel(metricId),
            };
        }),
        [metrics, availableMetrics]
    );

    const handleSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
        setSortConfig({ key, direction });
    };

    const isMetricSortActive = useMemo(() => metricsToCompare.some((m) => m.id === sortConfig.key), [metricsToCompare, sortConfig.key]);
    const isPlayerSortActive = useMemo(() => players.some((p) => (p.id || p.unique_id) === sortConfig.key), [players, sortConfig.key]);

    const sortedPlayers = useMemo(() => {
        if (!isMetricSortActive) return players;
        return [...players].sort((a, b) => {
            const va = Number(a[sortConfig.key] || 0);
            const vb = Number(b[sortConfig.key] || 0);
            if (va < vb) return sortConfig.direction === 'asc' ? -1 : 1;
            if (va > vb) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [players, sortConfig, isMetricSortActive]);

    const sortedMetrics = useMemo(() => {
        if (!isPlayerSortActive) return metricsToCompare;
        const p = players.find((pl) => (pl.id || pl.unique_id) === sortConfig.key);
        if (!p) return metricsToCompare;
        return [...metricsToCompare].sort((a, b) => {
            const va = Number(p[a.id] || 0);
            const vb = Number(p[b.id] || 0);
            if (va < vb) return sortConfig.direction === 'asc' ? -1 : 1;
            if (va > vb) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [metricsToCompare, players, sortConfig, isPlayerSortActive]);

    const scrollRef = useRef(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [vh, setVh] = useState(600);
    useEffect(() => {
        const onResize = () => {
            if (scrollRef.current) setVh(scrollRef.current.clientHeight || 600);
        };
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    const total = sortedMetrics.length;
    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN);
    const visible = Math.ceil(vh / ROW_H) + 2 * OVERSCAN;
    const endIndex = Math.min(total, startIndex + visible);
    const topPad = startIndex * ROW_H;
    const bottomPad = (total - endIndex) * ROW_H;

    const playersCount = Math.max(1, sortedPlayers.length);
    const metricColStyle = { width: `${FIRST_COL_PCT}%` };
    const playerColStyle = { width: `${(100 - FIRST_COL_PCT) / playersCount}%` };

    return (
        <div ref={scrollRef} className="h-[75vh] overflow-y-auto styled-scrollbar rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl" onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
            <table className="w-full table-fixed text-sm text-left border-collapse">
                <thead className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
                    <tr>
                        <th style={metricColStyle} className="p-4 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                            Métrique DS
                        </th>
                        {sortedPlayers.map((p) => (
                            <th
                                key={p.id || p.unique_id}
                                style={playerColStyle}
                                className="p-4 font-bold text-slate-800 dark:text-white text-center cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                onClick={() => handleSort(p.id || p.unique_id)}
                            >
                                <div className="flex flex-col items-center gap-1">
                                    <span className="truncate w-full">{p.full_name || p.name}</span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                                        {p.competition || 'N/A'} - {p.season || 'N/A'}
                                    </span>
                                    {sortConfig.key === (p.id || p.unique_id) && <span className="text-xs text-sky-500">{sortConfig.direction === 'desc' ? '▼' : '▲'}</span>}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {topPad > 0 && <tr style={{ height: topPad }}><td colSpan={1 + sortedPlayers.length} /></tr>}

                    {sortedMetrics.slice(startIndex, endIndex).map((metric) => {
                        const values = sortedPlayers.map((p) => Number(p[metric.id] || 0));
                        const min = values.length ? Math.min(...values) : 0;
                        const max = values.length ? Math.max(...values) : 0;

                        const getColorForValue = (value, mn, mx) => {
                            if (mn === mx) return 'hsla(210, 20%, 50%, 0.3)';
                            const pct = (value - mn) / (mx - mn);
                            const alpha = 0.3 + (pct * 0.7);
                            return `rgba(14, 165, 233, ${alpha})`;
                        };

                        return (
                            <tr key={metric.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" style={{ height: ROW_H }}>
                                <td style={metricColStyle} className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold text-[10px] md:text-xs cursor-pointer hover:text-sky-600 dark:hover:text-sky-400" onClick={() => handleSort(metric.id)}>
                                    {metric.label}
                                    {sortConfig.key === metric.id && <span className="ml-1 text-[10px]">{sortConfig.direction === 'desc' ? '▼' : '▲'}</span>}
                                </td>
                                {sortedPlayers.map((p) => {
                                    const v = Number(p[metric.id] || 0);
                                    const isMax = v === max && v !== min;
                                    return (
                                        <td key={p.id || p.unique_id} style={playerColStyle} className="px-2 py-2 text-center relative">
                                            <div className={`w-full h-8 rounded-lg flex items-center justify-center font-bold text-xs md:text-sm transition-all ${isMax ? 'text-white shadow-md scale-105 z-10' : 'text-slate-700 dark:text-slate-300'}`}
                                                style={{ backgroundColor: getColorForValue(v, min, max) }}>
                                                {v.toFixed(2)}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}

                    {bottomPad > 0 && <tr style={{ height: bottomPad }}><td colSpan={1 + sortedPlayers.length} /></tr>}
                </tbody>
            </table>
        </div>
    );
};

export const VersusComparison = ({
    selectedPlayers,
    selectedMetrics,
    selectedTemplateLabels,
    handleTemplateToggle,
    metricDisplayMode,
    setMetricDisplayMode,
    metricOptions,
    handleMetricToggle,
    customTemplates,
    saveCustomTemplate,
    deleteCustomTemplate,
    applyCustomTemplate,
    onResetMetrics,
    availableMetrics
}) => {
    const activeMetrics = useMemo(() => {
        if (metricDisplayMode === 'standard') {
            return selectedMetrics.map(m => m.replace(/_norm$|_pct$/, ''));
        }
        return selectedMetrics;
    }, [selectedMetrics, metricDisplayMode]);

    return (
        <div className="flex-shrink-0 pt-8 mt-8 border-t border-slate-200 dark:border-white/10">
            <div className="flex flex-col xl:flex-row gap-8 items-start">
                <div className="w-full xl:w-1/4">
                    <h2 className="text-xl font-bold text-center lg:text-left mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-1 h-6 bg-sky-500 rounded-full"></span>
                        Analyse Tactique (DS)
                    </h2>
                    <div className="h-[75vh] overflow-y-auto styled-scrollbar p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[rgba(11,15,25,0.7)] shadow-sm">
                        <MetricSelectionPanel
                            cat={'joueurs'}
                            selectedTemplateLabels={selectedTemplateLabels}
                            onTemplateToggle={handleTemplateToggle}
                            metricDisplayMode={metricDisplayMode}
                            onMetricModeChange={setMetricDisplayMode}
                            metricOptions={metricOptions}
                            selectedMetrics={selectedMetrics}
                            onMetricToggle={handleMetricToggle}
                            MIN_METRICS={1}
                            customTemplates={customTemplates}
                            saveCustomTemplate={saveCustomTemplate}
                            deleteCustomTemplate={deleteCustomTemplate}
                            applyCustomTemplate={applyCustomTemplate}
                            onResetMetrics={onResetMetrics}
                            selectedPlayersToCompare={selectedPlayers}
                        />
                    </div>
                </div>
                <div className="w-full xl:w-3/4">
                    {selectedPlayers.length < 2 ? (
                        <div className="h-[500px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10">
                            <div className="p-6 bg-slate-100 dark:bg-white/5 rounded-full mb-4">
                                <Activity size={48} className="opacity-50" />
                            </div>
                            <p className="font-medium text-lg">Sélectionnez au moins 2 joueurs pour comparer.</p>
                        </div>
                    ) : activeMetrics.length > 0 ? (
                        <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-white/5 shadow-xl">
                            {selectedPlayers.length === 2 ? (
                                <div className="max-h-[75vh] overflow-y-auto styled-scrollbar pr-2">
                                    <FaceToFaceComparison player1={selectedPlayers[0]} player2={selectedPlayers[1]} metrics={activeMetrics} availableMetrics={availableMetrics} />
                                </div>
                            ) : (
                                <ComparisonTable players={selectedPlayers} metrics={activeMetrics} availableMetrics={availableMetrics} />
                            )}
                        </div>
                    ) : (
                        <div className="h-[500px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10">
                            <p>Sélectionnez un Modèle Tactique pour décomposer les sous-variables.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
