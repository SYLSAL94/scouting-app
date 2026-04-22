import React, { useMemo } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Activity } from 'lucide-react';

const COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6'];

export const HeadToHeadContent = ({ selectedPlayersToCompare = [], selectedMetrics = [] }) => {
  // 1. Identify comparative metrics (from props or auto-discovery)
  const chartData = useMemo(() => {
    if (selectedPlayersToCompare.length === 0) return [];

    const metricKeys = selectedMetrics.length > 0 
      ? selectedMetrics 
      : Object.keys(selectedPlayersToCompare[0]).filter(key => 
          key.toLowerCase().startsWith('indice_') || 
          key.toLowerCase().endsWith('_pct') ||
          key.toLowerCase().endsWith('_norm')
        ).slice(0, 8);

    return metricKeys.map(key => {
      // Clean label for display: "offensive_volume_avg_norm" -> "OFFENSIVE VOLUME"
      const cleanMetric = key
        .replace(/_avg_norm|_norm|_pct|indice_/gi, '')
        .replace(/_/g, ' ')
        .toUpperCase()
        .trim();

      const dataPoint = { metric: cleanMetric };
      
      // Inject each player's value multiplied by 100
      selectedPlayersToCompare.forEach(p => {
        const name = `${p.full_name || p.name || 'Inconnu'}`;
        // On multiplie par 100 pour l'échelle 0-100 stricte demandée
        dataPoint[name] = (Number(p[key]) || 0) * 100;
      });
      return dataPoint;
    });
  }, [selectedPlayersToCompare, selectedMetrics]);

  // Handle Empty State gracefully
  if (selectedPlayersToCompare.length < 2) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
        <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
          <Activity size={48} className="opacity-50" />
        </div>
        <p className="font-medium text-lg">Sélectionnez au moins 2 joueurs pour la comparaison Head-to-Head.</p>
        <p className="text-sm mt-2 opacity-70">Architecture Zero-Calcul (Cloud-Native)</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-8 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800 dark:text-slate-100">
          <span className="w-3 h-8 bg-gradient-to-b from-sky-400 to-sky-600 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]"></span>
          Comparaison Versus
        </h2>
        <div className="px-3 py-1 bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-bold rounded-full border border-sky-200 dark:border-sky-500/30">
          Zero-Disque Node
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Radar Chart (Overlap Strategy) */}
        <div className="h-[450px] bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 shadow-inner group transition-all duration-300 hover:shadow-lg">
          <h3 className="text-center font-extrabold uppercase tracking-widest text-xs mb-4 text-slate-500 dark:text-slate-400 group-hover:text-sky-500 transition-colors">
            Superposition Radiale
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke="#cbd5e1" className="dark:stroke-slate-700" strokeDasharray="3 3"/>
              <PolarAngleAxis 
                dataKey="metric" 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                  border: '1px solid rgba(56, 189, 248, 0.2)', 
                  borderRadius: '12px', 
                  color: '#f8fafc',
                  backdropFilter: 'blur(8px)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} iconType="circle" />
              {selectedPlayersToCompare.map((p, i) => {
                const name = `${p.full_name || p.name || 'Inconnu'}`;
                return (
                  <Radar
                    key={p.id || i}
                    name={name}
                    dataKey={name}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={3}
                    fill={COLORS[i % COLORS.length]}
                    fillOpacity={0.35}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                  />
                );
              })}
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart (Direct Face-off) */}
        <div className="h-[450px] bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 shadow-inner group transition-all duration-300 hover:shadow-lg">
          <h3 className="text-center font-extrabold uppercase tracking-widest text-xs mb-4 text-slate-500 dark:text-slate-400 group-hover:text-sky-500 transition-colors">
            Face à Face Direct
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700/50" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis 
                dataKey="metric" 
                type="category" 
                width={110} 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(226, 232, 240, 0.4)', strokeWidth: 2 }}
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                  border: '1px solid rgba(56, 189, 248, 0.2)', 
                  borderRadius: '12px', 
                  color: '#f8fafc' 
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} iconType="circle" />
              {selectedPlayersToCompare.map((p, i) => {
                const name = `${p.full_name || p.name || 'Inconnu'}`;
                return (
                  <Bar 
                    key={p.id || i}
                    name={name}
                    dataKey={name} 
                    fill={COLORS[i % COLORS.length]} 
                    radius={[0, 4, 4, 0]}
                    barSize={12}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};
