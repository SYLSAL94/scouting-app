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
        <div className="space-y-10">
            {metrics.map((metricId) => {
                const opt = availableMetrics.find(m => m.value === metricId);
                const metricLabel = opt ? opt.label : formatDSLabel(metricId);
                const v1 = Number(player1[metricId] || 0);
                const v2 = Number(player2[metricId] || 0);

                const isP1Winner = v1 > v2;
                const isP2Winner = v2 > v1;

                const isPercentile = metricId.includes('norm') || metricId.includes('_pct') || metricLabel.toLowerCase().includes('percentile');
                const denominator = isPercentile ? 100 * 1.05 : (Math.max(v1, v2) * 1.2 || 1);

                return (
                    <div key={metricId} className="group flex flex-col items-center">
                        <div className="w-full flex justify-between items-end mb-3 px-1">
                            <span className={`text-2xl font-black tabular-nums transition-all ${isP1Winner ? 'text-[#3cffd0]' : 'text-[#949494]'}`}>
                                {v1.toFixed(2)}
                            </span>
                            <span className="verge-label-mono text-[9px] text-[#949494] tracking-[0.2em] mb-1 px-6 text-center border-b border-white/5 pb-1">
                                {metricLabel}
                            </span>
                            <span className={`text-2xl font-black tabular-nums transition-all ${isP2Winner ? 'text-[#5200ff]' : 'text-[#949494]'}`}>
                                {v2.toFixed(2)}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-[#2d2d2d] rounded-[1px] overflow-hidden flex relative">
                            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 z-10"></div>
                            <div className="w-1/2 flex justify-end">
                                <div
                                    className={`h-full transition-all duration-700 ease-out ${isP1Winner ? 'bg-[#3cffd0] shadow-[0_0_15px_rgba(60,255,208,0.3)]' : 'bg-[#131313] border-r border-white/5'}`}
                                    style={{ width: `${Math.min(100, (v1 / denominator) * 100)}%` }}
                                ></div>
                            </div>
                            <div className="w-1/2 flex justify-start">
                                <div
                                    className={`h-full transition-all duration-700 ease-out ${isP2Winner ? 'bg-[#5200ff] shadow-[0_0_15px_rgba(82,0,255,0.3)]' : 'bg-[#131313] border-l border-white/5'}`}
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
        <div ref={scrollRef} className="h-[75vh] overflow-y-auto styled-scrollbar rounded-[4px] border border-white/10 bg-[#131313]" onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
            <table className="w-full table-fixed text-sm text-left border-collapse">
                <thead className="sticky top-0 z-20 bg-[#2d2d2d] border-b border-[#3cffd0]/20">
                    <tr>
                        <th style={metricColStyle} className="p-5 verge-label-mono text-[10px] text-[#949494] tracking-[0.2em] font-black">
                            MÉTRIQUE DS
                        </th>
                        {sortedPlayers.map((p) => (
                            <th
                                key={p.id || p.unique_id}
                                style={playerColStyle}
                                className="p-5 font-black text-white text-center cursor-pointer select-none hover:bg-white/5 transition-colors border-l border-white/5"
                                onClick={() => handleSort(p.id || p.unique_id)}
                            >
                                <div className="flex flex-col items-center gap-1">
                                    <span className="verge-label-mono text-[11px] truncate w-full tracking-tight">{p.full_name || p.name}</span>
                                    <span className="verge-label-mono text-[8px] text-[#949494] font-black opacity-60">
                                        {p.competition || 'N/A'} • {p.season || 'N/A'}
                                    </span>
                                    {sortConfig.key === (p.id || p.unique_id) && <span className="text-[10px] text-[#3cffd0] mt-1">{sortConfig.direction === 'desc' ? '▼' : '▲'}</span>}
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
                            if (mn === mx) return 'rgba(255,255,255,0.02)';
                            const pct = (value - mn) / (mx - mn);
                            const alpha = 0.05 + (pct * 0.25);
                            return `rgba(60, 255, 208, ${alpha})`;
                        };

                        return (
                            <tr key={metric.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors" style={{ height: ROW_H }}>
                                <td style={metricColStyle} className="px-5 py-2 verge-label-mono text-[10px] text-[#949494] font-black cursor-pointer hover:text-[#3cffd0]" onClick={() => handleSort(metric.id)}>
                                    {metric.label}
                                    {sortConfig.key === metric.id && <span className="ml-2 text-[#3cffd0]">{sortConfig.direction === 'desc' ? '▼' : '▲'}</span>}
                                </td>
                                {sortedPlayers.map((p) => {
                                    const v = Number(p[metric.id] || 0);
                                    const isMax = v === max && v !== min;
                                    return (
                                        <td key={p.id || p.unique_id} style={playerColStyle} className="px-3 py-2 text-center relative border-l border-white/5">
                                            <div className={`w-full h-8 rounded-[1px] flex items-center justify-center font-black text-xs transition-all ${isMax ? 'text-[#3cffd0] scale-105 z-10 border border-[#3cffd0]/30' : 'text-[#949494]'}`}
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

import { HeadToHeadContent } from './HeadToHeadContent';

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
        <div className="flex-shrink-0 pt-12 mt-12 border-t border-white/10">
            <div className="flex flex-col xl:flex-row gap-12 items-start">
                <div className="w-full xl:w-1/4">
                    <h2 className="verge-label-mono text-[11px] font-black tracking-[0.3em] text-[#3cffd0] mb-8 flex items-center gap-4">
                        <div className="w-2 h-2 bg-[#3cffd0]" />
                        ANALYSE TACTIQUE (DS)
                    </h2>
                    <div className="h-[75vh] overflow-y-auto styled-scrollbar p-6 rounded-[4px] border border-white/10 bg-[#2d2d2d]">
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
                        <div className="h-[600px] flex flex-col items-center justify-center bg-[#2d2d2d] rounded-[4px] border border-dashed border-white/10">
                            <div className="p-8 bg-[#131313] border border-white/10 rounded-[2px] mb-8">
                                <Activity size={56} className="text-[#3cffd0] opacity-50" />
                            </div>
                            <p className="verge-label-mono text-[12px] font-black text-[#949494] tracking-[0.2em] uppercase">Sélectionnez au moins 2 joueurs pour comparer.</p>
                        </div>
                    ) : activeMetrics.length > 0 ? (
                        <div className="bg-[#131313] border border-white/10 rounded-[4px] p-10 relative overflow-hidden">
                             {/* Hazard Corner */}
                             <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#3cffd0]/20" />
                             
                            {selectedPlayers.length === 2 ? (
                                <HeadToHeadContent 
                                    selectedPlayersToCompare={selectedPlayers} 
                                    selectedMetrics={activeMetrics} 
                                />
                            ) : (
                                <ComparisonTable players={selectedPlayers} metrics={activeMetrics} availableMetrics={availableMetrics} />
                            )}
                        </div>
                    ) : (
                        <div className="h-[600px] flex flex-col items-center justify-center bg-[#2d2d2d] rounded-[4px] border border-dashed border-white/10">
                             <p className="verge-label-mono text-[12px] font-black text-[#949494] tracking-[0.2em] uppercase">Sélectionnez un Modèle Tactique pour décomposer les sous-variables.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
