import React, { useState, useEffect } from 'react';
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Tooltip as RechartsTooltip,
} from 'recharts';
import { RadarRankingModal } from './RadarRankingModal';

const initialOf = (label) => (label && label.trim() ? label.trim().charAt(0) : '?');

export const RadarChartVisualization = ({ 
    selectedEntities = [], 
    metrics = [], 
    compareWithMedian = false, 
    activeFilters = {}, 
    entityColors = [], 
    metricDisplayMode = 'standard',
    onPlayerSelect,
    onAddPlayer
}) => {
    const [radarChartData, setRadarChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hoveredEntityIndex, setHoveredEntityIndex] = useState(null);
    const [rankingData, setRankingData] = useState({ isOpen: false, metric: '' });

    // Fetch Zéro-Calcul Radar Data
    useEffect(() => {
        if (!selectedEntities?.length || !metrics.length) {
            setRadarChartData(null);
            return;
        }

        const fetchRadarData = async () => {
            setIsLoading(true);
            try {
                const payload = {
                    players: selectedEntities,
                    metrics: metrics,
                    compare_with_median: compareWithMedian,
                    population_filters: activeFilters,
                    display_mode: metricDisplayMode
                };

                const res = await fetch('https://api-scouting.theanalyst.cloud/api/radar/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.debug_info) {
                        console.log("🔍 [Radar Debug]", data.debug_info);
                    }
                    setRadarChartData(data); // { entitiesInfo: [], radarData: [] }
                }
            } catch (err) {
                console.error("Erreur génération radar:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRadarData();
    }, [selectedEntities, metrics, compareWithMedian, activeFilters, metricDisplayMode]);

    const handleMetricClick = (metricName) => {
        // Here metricName is the display name (e.g. "Xg Shot"). We need the technical id if we want to query the API exactly.
        // Wait, the new API maps `subject` to `m.replace('_', ' ').title()`.
        // To query `/api/radar/ranking`, we need the original metric name.
        // Let's find it by doing a reverse match, or we just pass the metric original name if available.
        // In the API, we did: subject_data = {"subject": m.replace('_', ' ').title()}
        // We can reverse it simply by mapping back via `metrics` array, or just passing `m` from radarData if we add it.
        // For now, let's reverse transform assuming simple format, or search in `metrics` array:
        const originalMetric = metrics.find(m => m.replace(/_/g, ' ').title() === metricName || m.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) === metricName) || metricName.toLowerCase().replace(/ /g, '_');
        
        setRankingData({
            isOpen: true,
            metric: originalMetric
        });
    };

    const isDark = true; // Assuming dark mode always or injected via context
    const polarAngleAxisTickColor = '#cbd5e1';
    const polarRadiusAxisTickColor = '#94a3b8';
    const gridStroke = 'rgba(255, 255, 255, 0.1)';

    const entitiesInfo = radarChartData?.entitiesInfo || [];

    return (
        <div className="w-full h-full flex flex-col pt-4 relative">
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-sky-500 text-sm animate-pulse font-bold tracking-widest uppercase">Génération Cloud-Native Zéro-Calcul...</div>
                </div>
            ) : !radarChartData || !radarChartData.radarData || radarChartData.radarData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center p-6 border-2 border-dashed border-white/10 rounded-3xl m-4">
                    <h3 className="text-lg font-bold text-slate-500">Sélectionnez au moins un joueur et une métrique pour générer le radar.</h3>
                </div>
            ) : (
                <>
                    {/* --- Bandeau tuiles --- */}
                    <div className="px-4 pb-3 flex flex-col gap-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {entitiesInfo.map((ent, idx) => {
                                const color = entityColors?.[idx % entityColors.length] || { stroke: '#38bdf8', fill: '#38bdf8' };
                                const strokeColor = color.stroke || '#38bdf8';
                                const label = ent.label || `Entité ${idx + 1}`;
                                const init = initialOf(label);
                                const clickable = !ent.isMedian;
                                const isHovered = hoveredEntityIndex === idx;

                                return (
                                    <div
                                        key={`tile-${idx}`}
                                        className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 group ${clickable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : ''
                                            } ${isHovered ? 'ring-2 ring-offset-2 ring-sky-400' : ''}`}
                                        style={{
                                            backgroundColor: 'rgba(30, 41, 59, 0.7)',
                                            borderColor: isHovered ? strokeColor : `${strokeColor}40`,
                                            boxShadow: (clickable || isHovered) ? `0 4px 20px -12px ${strokeColor}60` : 'none',
                                            transform: isHovered ? 'translateY(-2px)' : 'none'
                                        }}
                                        onClick={() => clickable && onPlayerSelect && onPlayerSelect(ent)}
                                        onMouseEnter={() => setHoveredEntityIndex(idx)}
                                        onMouseLeave={() => setHoveredEntityIndex(null)}
                                    >
                                        <div
                                            className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all duration-300"
                                            style={{ backgroundColor: strokeColor, width: isHovered ? '6px' : '4px' }}
                                        ></div>
                                        <div className="relative pl-2">
                                            <div
                                                className="w-14 h-14 rounded-full border-2 bg-slate-800 overflow-hidden shadow-sm flex-shrink-0 transition-all duration-300"
                                                style={{ borderColor: strokeColor, transform: isHovered ? 'scale(1.05)' : 'none' }}
                                            >
                                                {ent.image ? (
                                                    <img src={ent.image} alt={label} className="w-full h-full object-contain bg-white" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-800 grid place-items-center text-white font-bold text-lg">{init}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                                            <div className="flex justify-between items-center gap-2">
                                                <span className={`text-sm font-bold truncate transition-colors ${clickable ? (isHovered ? 'text-sky-400' : 'text-slate-100') : 'text-slate-300'}`} title={label}>{label}</span>
                                            </div>
                                            <div className="text-xs text-slate-400 truncate flex items-center gap-1">
                                                <span className="font-medium text-slate-300">{ent.team || '—'}</span>
                                                {(ent.team && ent.position) && <span className="text-slate-600">•</span>}
                                                <span>{ent.position}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 truncate">{ent.season || '—'} {ent.competition ? `| ${ent.competition}` : ''}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* --- Radar --- */}
                    <div className="flex-1 min-h-[400px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarChartData.radarData}>
                                <PolarGrid gridType="circle" stroke={gridStroke} />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={({ x, y, textAnchor, payload }) => (
                                        <g className="cursor-pointer group" onClick={() => handleMetricClick(payload.value)}>
                                            <text x={x} y={y} textAnchor={textAnchor} fill={polarAngleAxisTickColor} fontSize={11} fontWeight={700} className="group-hover:fill-sky-400 transition-all duration-200">
                                                {payload.value}
                                            </text>
                                        </g>
                                    )}
                                />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={6} tick={{ fill: polarRadiusAxisTickColor, fontSize: 10 }} axisLine={false} />
                                {entitiesInfo.map((ent, index) => {
                                    const isHovered = hoveredEntityIndex === index;
                                    const isDimmed = hoveredEntityIndex !== null && !isHovered;
                                    return (
                                        <Radar
                                            key={`radar-${index}`}
                                            name={ent.label}
                                            dataKey={`entity${index}`}
                                            stroke={(entityColors[index % entityColors.length] || {}).stroke || '#38bdf8'}
                                            fill={(entityColors[index % entityColors.length] || {}).fill || '#38bdf8'}
                                            fillOpacity={isDimmed ? 0.05 : (isHovered ? 0.6 : 0.25)}
                                            strokeOpacity={isDimmed ? 0.2 : 1}
                                            strokeWidth={isHovered ? 4 : (isDimmed ? 1 : 3)}
                                            activeDot={{ r: 6, strokeWidth: 0, fill: (entityColors[index % entityColors.length] || {}).stroke || '#38bdf8' }}
                                        />
                                    );
                                })}
                                <RechartsTooltip
                                    cursor={false}
                                    content={({ active, payload, label }) => {
                                        if (!active || !payload || !payload.length) return null;
                                        return (
                                            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-xl p-3 min-w-[200px]">
                                                <div className="mb-2 pb-2 border-b border-slate-800"><h4 className="font-bold text-slate-100 text-sm text-center">{label}</h4></div>
                                                <div className="space-y-2">
                                                    {payload
                                                        .slice()
                                                        .sort((a, b) => b.value - a.value)
                                                        .map((entry, _) => {
                                                            const entityIdx = String(entry.dataKey).replace('entity', '');
                                                            const rawValue = entry.payload[`entity${entityIdx}_raw`];
                                                            const plotValue = entry.value;
                                                            const valueToDisplay = metricDisplayMode === 'standard' ? rawValue : plotValue;
                                                            return (
                                                                <div key={entry.dataKey || _} className="flex items-center justify-between gap-4 text-xs">
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <div className="w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0" style={{ backgroundColor: entry.color }} />
                                                                        <span className="text-slate-300 font-medium truncate" title={entry.name}>{entry.name}</span>
                                                                    </div>
                                                                    <span className="font-mono font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded">
                                                                        {Number.isFinite(+valueToDisplay) ? (+valueToDisplay).toFixed(2) : valueToDisplay}
                                                                        {metricDisplayMode === 'percentile' && <span className="text-[10px] ml-0.5">%</span>}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}

            <RadarRankingModal
                isOpen={rankingData.isOpen}
                onClose={() => setRankingData(prev => ({ ...prev, isOpen: false }))}
                metric={rankingData.metric}
                selectedEntityIds={selectedEntities.map(e => e.id)}
                entityColors={entityColors}
                metricDisplayMode={metricDisplayMode}
                onPlayerSelect={onPlayerSelect}
                onAddPlayer={onAddPlayer}
            />
        </div>
    );
};

export default RadarChartVisualization;
