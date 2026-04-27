import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { NOTES_PONDEREE_CONFIG } from './config/performanceConfig';

const PlayerRadar = ({ player }) => {
    if (!player || !player.position_category) return null;
    
    const pos = player.position_category;
    const config = NOTES_PONDEREE_CONFIG[pos] || NOTES_PONDEREE_CONFIG['field_player'];

    if (!config) {
        return (
            <div className="w-full h-64 md:h-80 flex items-center justify-center text-secondary-text verge-label-mono text-[10px] text-center px-4 bg-canvas-black border border-hazard-white/10 rounded-[2px]">
                AUCUNE CONFIGURATION RADAR : {pos}
            </div>
        );
    }

    const radarData = Object.keys(config).map((indiceKey) => {
        const cleanSubject = indiceKey.replace('Indice_', '').replace(/_/g, ' ');
        const rawValue = player[indiceKey];
        const score = (rawValue !== undefined && rawValue !== null && rawValue !== "") 
            ? Number(Number(rawValue).toFixed(1)) 
            : 0;

        return {
            subject: cleanSubject,
            score: score,
            fullMark: 100
        };
    });

    return (
        <div className="w-full h-[400px] bg-transparent relative overflow-visible">
            {/* Legend / Status */}
            <div className="absolute top-0 left-0 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-jelly-mint" />
                <span className="verge-label-mono text-[9px] uppercase font-black tracking-[0.2em] text-jelly-mint">Dynamic Tactical Mapping</span>
            </div>

            <ResponsiveContainer width="100%" height="100%" key={`${player.id}-${player.note_ponderee}`}>
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                    <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#949494', fontSize: 8, fontWeight: 900, fontFamily: 'verge-label-mono' }} 
                    />
                    
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#131313', 
                            border: '1px solid rgba(60, 255, 208, 0.3)', 
                            color: '#fff',
                            borderRadius: '0px',
                            fontSize: '10px',
                            fontFamily: 'verge-label-mono',
                            textTransform: 'uppercase'
                        }} 
                        itemStyle={{ color: '#3cffd0' }}
                        formatter={(value) => [`${value}%`, 'Score']}
                    />
                    
                    <Radar 
                        name="Performance" 
                        dataKey="score" 
                        stroke="#3cffd0" 
                        strokeWidth={1}
                        fill="#3cffd0" 
                        fillOpacity={0.4} 
                        animationDuration={1000}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PlayerRadar;
