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

                if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
                
                const data = await res.json();
                if (data.debug_info) {
                    console.log("🔍 [Radar Debug]", data.debug_info);
                }
                setRadarChartData(data); // { entitiesInfo: [], radarData: [] }
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
                    <div className="p-4 md:px-6 md:pb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {entitiesInfo.map((ent, idx) => {
                                const color = entityColors?.[idx % entityColors.length] || { stroke: '#3cffd0', fill: '#3cffd0' };
                                const strokeColor = color.stroke || '#3cffd0';
                                const label = ent.label || `Entité ${idx + 1}`;
                                const clickable = !ent.isMedian;
                                const isHovered = hoveredEntityIndex === idx;

                                return (
                                    <div
                                        key={`tile-${idx}`}
                                        className={`relative flex items-center gap-3 md:gap-5 p-3 md:p-4 rounded-[2px] border transition-all duration-500 group overflow-hidden ${
                                            clickable ? 'cursor-pointer' : ''
                                        }`}
                                        style={{
                                            backgroundColor: '#131313',
                                            borderColor: isHovered ? strokeColor : 'rgba(255,255,255,0.05)',
                                            boxShadow: isHovered ? `0 0 30px ${strokeColor}15` : 'none',
                                        }}
                                        onClick={() => clickable && onPlayerSelect && onPlayerSelect(ent)}
                                        onMouseEnter={() => setHoveredEntityIndex(idx)}
                                        onMouseLeave={() => setHoveredEntityIndex(null)}
                                    >
                                        {/* Accent Bar */}
                                        <div
                                            className="absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-500"
                                            style={{ 
                                                backgroundColor: strokeColor, 
                                                boxShadow: isHovered ? `0 0 15px ${strokeColor}` : 'none',
                                                opacity: isHovered ? 1 : 0.6
                                            }}
                                        ></div>

                                        {/* Avatar Wrapper */}
                                        <div className="relative shrink-0">
                                            <div
                                                className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-white/10 bg-black/40 overflow-hidden transition-all duration-500 flex items-center justify-center"
                                                style={{ 
                                                    borderColor: isHovered ? strokeColor : 'rgba(255,255,255,0.1)',
                                                    boxShadow: isHovered ? `0 0 20px ${strokeColor}20` : 'none'
                                                }}
                                            >
                                                {ent.image ? (
                                                    <img src={ent.image} alt={label} className="w-full h-full object-contain bg-transparent" />
                                                ) : (
                                                    <div className="verge-label-mono text-[14px] font-black text-white/20">
                                                        {label.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info Wrapper */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                                                <div className="flex justify-between items-center gap-2">
                                                    <span 
                                                        className={`verge-label-mono text-[9px] md:text-[11px] font-black truncate transition-colors uppercase tracking-widest ${
                                                        isHovered ? 'text-white' : 'text-white/80'
                                                    }`} 
                                                    style={{ color: isHovered ? '#fff' : undefined }}
                                                    title={label}
                                                >
                                                    {label}
                                                </span>
                                            </div>
                                            
                                            <div className="flex flex-col gap-0.5">
                                                <div className="verge-label-mono text-[9px] font-black uppercase tracking-wider text-[#3cffd0]/80 truncate">
                                                    {ent.team || '—'}
                                                </div>
                                                <div className="verge-label-mono text-[9px] font-black uppercase tracking-widest text-white/40 truncate">
                                                    {ent.position}
                                                </div>
                                                <div className="verge-label-mono text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mt-1">
                                                    {ent.season || '—'} {ent.competition ? `• ${ent.competition}` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* --- Radar --- */}
                    <div className="w-full h-[350px] sm:h-[450px] md:h-full md:flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" aspect={window.innerWidth < 768 ? 1 : undefined} debounce={100}>
                            <RadarChart cx="50%" cy="50%" outerRadius={window.innerWidth < 768 ? "60%" : "75%"} data={radarChartData.radarData}>
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
                                            <div className="bg-[#131313]/95 backdrop-blur-xl border border-white/10 rounded-[2px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 min-w-[220px] animate-in fade-in zoom-in-95 duration-200">
                                                <div className="mb-4 pb-3 border-b border-white/5">
                                                    <h4 className="verge-label-mono text-[10px] font-black text-white text-center uppercase tracking-[0.2em]">{label}</h4>
                                                </div>
                                                <div className="space-y-3">
                                                    {payload
                                                        .slice()
                                                        .sort((a, b) => b.value - a.value)
                                                        .map((entry, idx) => {
                                                            const entityIdx = String(entry.dataKey).replace('entity', '');
                                                            const rawValue = entry.payload[`entity${entityIdx}_raw`];
                                                            const plotValue = entry.value;
                                                            const valueToDisplay = metricDisplayMode === 'standard' ? rawValue : plotValue;
                                                            
                                                            return (
                                                                <div key={entry.dataKey || idx} className="flex items-center justify-between gap-6">
                                                                    <div className="flex items-center gap-3 min-w-0">
                                                                        <div 
                                                                            className="w-2 h-2 rounded-full shadow-[0_0_10px_rgba(60,255,208,0.2)] flex-shrink-0" 
                                                                            style={{ backgroundColor: entry.color }} 
                                                                        />
                                                                        <span className="verge-label-mono text-[9px] font-black text-white/70 uppercase truncate tracking-wider" title={entry.name}>
                                                                            {entry.name}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-baseline gap-1 bg-white/5 px-2 py-1 rounded-[1px] border border-white/5">
                                                                        <span className="verge-label-mono text-[10px] font-black text-[#3cffd0]">
                                                                            {Number.isFinite(+valueToDisplay) ? (+valueToDisplay).toFixed(2) : valueToDisplay}
                                                                        </span>
                                                                        {metricDisplayMode === 'percentile' && (
                                                                            <span className="verge-label-mono text-[7px] text-white/30 font-black">%</span>
                                                                        )}
                                                                    </div>
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
