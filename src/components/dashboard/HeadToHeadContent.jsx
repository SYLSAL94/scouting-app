import React, { useMemo } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Activity, Zap, Shield, Target } from 'lucide-react';

const COLORS = ['#3cffd0', '#5200ff', '#ffffff', '#ff3366', '#949494'];

export const HeadToHeadContent = ({ selectedPlayersToCompare = [], selectedMetrics = [] }) => {
  const chartData = useMemo(() => {
    if (selectedPlayersToCompare.length === 0) return [];

    const metricKeys = selectedMetrics.length > 0 
      ? selectedMetrics 
      : Object.keys(selectedPlayersToCompare[0]).filter(key => 
          key.toLowerCase().startsWith('indice_') || 
          key.toLowerCase().endsWith('_pct')
        ).slice(0, 8);

    return metricKeys.map(key => {
      const cleanMetric = key
        .replace(/_avg_pct|_pct|indice_/gi, '')
        .replace(/_/g, ' ')
        .toUpperCase()
        .trim();

      const dataPoint = { metric: cleanMetric };
      
      selectedPlayersToCompare.forEach(p => {
        const name = `${p.full_name || p.name || 'Inconnu'}`;
        const val = Number(p[key]) || 0;
        
        // Si c'est une métrique de percentile (_pct) ou un Indice, on prend la valeur telle quelle (déjà en 0-100)
        // Sinon (valeurs brutes), on garde aussi la valeur réelle (pas de transformation)
        const isNormalized = key.toLowerCase().endsWith('_pct') || 
                             key.toLowerCase().startsWith('indice_');
                             
        dataPoint[name] = val;
      });
      return dataPoint;
    });
  }, [selectedPlayersToCompare, selectedMetrics]);

  if (selectedPlayersToCompare.length < 2) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center bg-canvas-black rounded-[4px] border border-dashed border-hazard-white/10 relative overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3cffd0 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        <div className="p-10 bg-canvas-black border border-jelly-mint/20 rounded-[2px] mb-8 relative group">
          <div className="absolute -inset-4 bg-jelly-mint/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          <Activity size={64} className="text-jelly-mint relative z-10" />
        </div>
        <h3 className="verge-h3 text-hazard-white mb-4">SÉLECTION INSUFFISANTE</h3>
        <p className="verge-label-mono text-[11px] font-black text-secondary-text tracking-[0.2em] uppercase text-center max-w-sm px-6 leading-relaxed">
          Veuillez sélectionner au moins <span className="text-jelly-mint">deux joueurs</span> dans le tableau pour activer la comparaison directe.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-canvas-black rounded-[4px] p-4 md:p-12 lg:p-16 border border-hazard-white/10 space-y-8 md:space-y-16 relative overflow-hidden">
      {/* Editorial Watermark */}
      <div className="hidden md:block absolute top-0 right-0 w-64 h-64 border-t border-r border-jelly-mint/5 pointer-events-none" />
      <div className="hidden md:block absolute bottom-0 left-0 w-64 h-64 border-b border-l border-verge-ultraviolet/5 pointer-events-none" />

      {/* Header Layout */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-hazard-white/10 pb-6 md:pb-12">
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="w-8 md:w-12 h-[2px] bg-jelly-mint" />
            <span className="verge-kicker text-[10px] md:text-[19px] text-jelly-mint">Versus System</span>
          </div>
          <h2 className="verge-h2 md:verge-h1 text-hazard-white text-2xl md:text-6xl m-0">COMPARAISON</h2>
          <div className="flex flex-wrap items-center gap-4 mt-2 md:mt-4">
             {selectedPlayersToCompare.map((p, i) => (
               <div key={p.id} className="flex items-center gap-2">
                 <div className="w-2 h-2 md:w-3 md:h-3" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                 <span className="verge-label-mono text-[8px] md:text-[10px] text-hazard-white font-black">{`${p.full_name || p.name}`.toUpperCase()}</span>
               </div>
             ))}
          </div>
        </div>
        
        <div className="hidden md:flex flex-col items-end gap-2">
          <div className="px-6 py-3 bg-surface-slate border border-hazard-white/10 text-hazard-white verge-label-mono text-[10px] font-black tracking-[0.3em] rounded-[2px] uppercase">
            ZERO-DISQUE NODE v.4.0
          </div>
          <span className="verge-label-mono text-[9px] text-secondary-text">LATENCY: 12MS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 lg:gap-16">
        
        {/* Radar Chart Card */}
        <div className="bg-canvas-black rounded-[4px] p-4 md:p-10 border border-hazard-white/10 relative group flex flex-col h-[400px] md:h-[600px]">
          <div className="absolute top-4 left-4 md:top-6 md:left-6 verge-label-mono text-[8px] md:text-[10px] text-jelly-mint font-black tracking-[0.3em] uppercase">
            01 / RADIAL
          </div>
          <div className="flex-1 mt-8 md:mt-12">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius={window.innerWidth < 768 ? "65%" : "80%"} data={chartData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{ fill: '#949494', fontSize: 8, fontWeight: '900', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip 
                  cursor={{ stroke: '#3cffd0', strokeWidth: 1 }}
                  contentStyle={{ 
                    backgroundColor: '#131313', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '2px', 
                    color: '#fff',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                    padding: '12px'
                  }}
                />
                {selectedPlayersToCompare.map((p, i) => (
                  <Radar
                    key={p.id || i}
                    name={`${p.full_name || p.name}`.toUpperCase()}
                    dataKey={`${p.full_name || p.name || 'Inconnu'}`}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={3}
                    fill={COLORS[i % COLORS.length]}
                    fillOpacity={0.15}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 border-t border-hazard-white/5 pt-6 flex justify-between items-center">
            <span className="verge-label-mono text-[9px] text-secondary-text uppercase tracking-widest">Performance Radar Mapping</span>
            <Target size={14} className="text-jelly-mint opacity-50" />
          </div>
        </div>

        {/* Bar Chart Card */}
        <div className="bg-canvas-black rounded-[4px] p-4 md:p-10 border border-hazard-white/10 relative group flex flex-col h-[400px] md:h-[600px]">
          <div className="absolute top-4 left-4 md:top-6 md:left-6 verge-label-mono text-[8px] md:text-[10px] text-verge-ultraviolet font-black tracking-[0.3em] uppercase">
            02 / BAR_CHART
          </div>
          <div className="flex-1 mt-8 md:mt-12">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" horizontal={false} vertical={true} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  dataKey="metric" 
                  type="category" 
                  width={window.innerWidth < 768 ? 80 : 140} 
                  tick={{ fill: '#ffffff', fontSize: 8, fontWeight: '900', fontFamily: 'JetBrains Mono, monospace' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                  contentStyle={{ 
                    backgroundColor: '#131313', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '2px', 
                    color: '#fff',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    padding: '12px'
                  }}
                />
                {selectedPlayersToCompare.map((p, i) => (
                  <Bar 
                    key={p.id || i}
                    name={`${p.full_name || p.name}`.toUpperCase()}
                    dataKey={`${p.full_name || p.name || 'Inconnu'}`} 
                    fill={COLORS[i % COLORS.length]} 
                    radius={[0, 2, 2, 0]}
                    barSize={12}
                    animationDuration={1500}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 border-t border-hazard-white/5 pt-6 flex justify-between items-center">
            <span className="verge-label-mono text-[9px] text-secondary-text uppercase tracking-widest">Comparative Bar Analysis</span>
            <Zap size={14} className="text-verge-ultraviolet opacity-50" />
          </div>
        </div>

      </div>

      {/* Security Footer Note */}
      <div className="hidden md:flex items-center justify-center gap-4 py-8 border-t border-hazard-white/5 opacity-30">
        <Shield size={12} className="text-secondary-text" />
        <span className="verge-label-mono text-[8px] text-secondary-text tracking-[0.5em] uppercase">
          Secured Data Feed / Analysis Node
        </span>
      </div>
    </div>
  );
};
