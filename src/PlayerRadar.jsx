import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { NOTES_PONDEREE_CONFIG } from './config/performanceConfig';

const PlayerRadar = ({ player }) => {
    if (!player || !player.position_category) return null;
    
    // 1. Récupération du groupe de poste (ex: 'Avant-centre', 'Gardien', etc.)
    const pos = player.position_category;
    
    // 2. Récupération de la configuration des indices pour ce poste
    // (Si le poste précis n'est pas dans la config, on tente un fallback vers 'field_player')
    const config = NOTES_PONDEREE_CONFIG[pos] || NOTES_PONDEREE_CONFIG['field_player'];

    if (!config) {
        return (
            <div className="w-full h-64 md:h-80 flex items-center justify-center text-slate-500 font-mono text-sm text-center px-4 bg-white/5 rounded-3xl border border-white/10">
                Aucune configuration radar pour le poste : {pos}
            </div>
        );
    }

    // 3. Construction dynamique des axes basée strictement sur la constante NOTES_PONDEREE_CONFIG
    const radarData = Object.keys(config).map((indiceKey) => {
        // Formatage visuel : "Indice_Acc_Offensive" -> "Acc Offensive"
        const cleanSubject = indiceKey.replace('Indice_', '').replace(/_/g, ' ');
        
        // Lecture de la donnée brute API (sur 100)
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
        <div className="w-full h-64 md:h-80 bg-white/5 rounded-3xl p-4 border border-white/5 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-4 left-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-[10px] uppercase font-black tracking-widest text-sky-400/70">Dynamic Tactical Mapping</span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="55%" outerRadius="65%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.2)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 700 }} />
                    
                    {/* Échelle verrouillée fermement sur 100 */}
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                            borderColor: 'rgba(56, 189, 248, 0.3)', 
                            color: '#fff',
                            borderRadius: '12px',
                            backdropFilter: 'blur(8px)',
                            fontSize: '12px'
                        }} 
                        itemStyle={{ color: '#38bdf8' }}
                        formatter={(value) => [`${value} / 100`, 'Score']}
                    />
                    
                    <Radar 
                        name="Performance" 
                        dataKey="score" 
                        stroke="#38bdf8" 
                        strokeWidth={2}
                        fill="#38bdf8" 
                        fillOpacity={0.6} 
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PlayerRadar;
