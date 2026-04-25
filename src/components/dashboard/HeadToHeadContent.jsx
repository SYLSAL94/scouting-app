import React, { useMemo } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Activity } from 'lucide-react';

const COLORS = ['#3cffd0', '#5200ff', '#f43f5e', '#ffffff', '#949494'];

export const HeadToHeadContent = ({ selectedPlayersToCompare = [], selectedMetrics = [] }) => {
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
      const cleanMetric = key
        .replace(/_avg_norm|_norm|_pct|indice_/gi, '')
        .replace(/_/g, ' ')
        .toUpperCase()
        .trim();

      const dataPoint = { metric: cleanMetric };
      
      selectedPlayersToCompare.forEach(p => {
        const name = `${p.full_name || p.name || 'Inconnu'}`;
        dataPoint[name] = (Number(p[key]) || 0) * 100;
      });
      return dataPoint;
    });
  }, [selectedPlayersToCompare, selectedMetrics]);

  if (selectedPlayersToCompare.length < 2) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center bg-[#2d2d2d] rounded-[4px] border border-dashed border-white/10">
        <div className="p-8 bg-[#131313] border border-white/10 rounded-[2px] mb-8">
          <Activity size={56} className="text-[#3cffd0] opacity-50" />
        </div>
        <p className="verge-label-mono text-[12px] font-black text-[#949494] tracking-[0.2em] uppercase text-center max-w-md px-6">Sélectionnez au moins 2 joueurs pour la comparaison Head-to-Head.</p>
        <p className="verge-label-mono text-[9px] mt-4 text-[#3cffd0]/50 tracking-[0.1em] uppercase">Architecture Zero-Calcul (Cloud-Native)</p>
      </div>
    );
  }

  return (
    <div className="bg-[#131313] rounded-[4px] p-10 border border-white/10 space-y-12 relative overflow-hidden">
      {/* Hazard Corner */}
      <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-[#3cffd0]/10" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-2 h-8 bg-[#3cffd0]" />
          <h2 className="verge-label-mono text-xl font-black tracking-[0.2em] text-white uppercase">
            Comparaison Versus
          </h2>
        </div>
        <div className="px-5 py-2 bg-[#2d2d2d] border border-[#3cffd0]/30 text-[#3cffd0] verge-label-mono text-[9px] font-black tracking-[0.3em] rounded-[1px] uppercase">
          Zero-Disque Node
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        
        {/* Radar Chart */}
        <div className="h-[500px] bg-[#2d2d2d] rounded-[4px] p-8 border border-white/5 relative group">
          <div className="absolute top-4 left-4 verge-label-mono text-[9px] text-[#949494] font-black tracking-[0.3em] uppercase opacity-50">01 / RADIAL_MAPPING</div>
          <h3 className="text-center verge-label-mono text-[11px] font-black uppercase tracking-[0.4em] mb-10 text-[#3cffd0]">
            SUPERPOSITION RADIALE
          </h3>
          <ResponsiveContainer width="100%" height="90%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="0" />
              <PolarAngleAxis 
                dataKey="metric" 
                tick={{ fill: '#949494', fontSize: 9, fontWeight: 'black', fontFamily: 'PolySans Mono, monospace' }} 
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#666', fontSize: 8, fontFamily: 'PolySans Mono, monospace' }} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#131313', 
                  border: '1px solid rgba(60, 255, 208, 0.3)', 
                  borderRadius: '2px', 
                  color: '#fff',
                  fontFamily: 'PolySans Mono, monospace',
                  fontSize: '11px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}
                itemStyle={{ padding: '2px 0' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '30px', fontSize: '10px', fontWeight: 'black', fontFamily: 'PolySans Mono, monospace', letterSpacing: '0.1em' }} 
                iconType="square" 
                iconSize={8}
              />
              {selectedPlayersToCompare.map((p, i) => {
                const name = `${p.full_name || p.name || 'Inconnu'}`.toUpperCase();
                return (
                  <Radar
                    key={p.id || i}
                    name={name}
                    dataKey={`${p.full_name || p.name || 'Inconnu'}`}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    fill={COLORS[i % COLORS.length]}
                    fillOpacity={0.2}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                  />
                );
              })}
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="h-[500px] bg-[#2d2d2d] rounded-[4px] p-8 border border-white/5 relative group">
          <div className="absolute top-4 left-4 verge-label-mono text-[9px] text-[#949494] font-black tracking-[0.3em] uppercase opacity-50">02 / DIRECT_FACE_OFF</div>
          <h3 className="text-center verge-label-mono text-[11px] font-black uppercase tracking-[0.4em] mb-10 text-[#3cffd0]">
            FACE À FACE DIRECT
          </h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="0" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis 
                dataKey="metric" 
                type="category" 
                width={120} 
                tick={{ fill: '#949494', fontSize: 9, fontWeight: 'black', fontFamily: 'PolySans Mono, monospace' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                contentStyle={{ 
                  backgroundColor: '#131313', 
                  border: '1px solid rgba(60, 255, 208, 0.3)', 
                  borderRadius: '2px', 
                  color: '#fff',
                  fontFamily: 'PolySans Mono, monospace',
                  fontSize: '11px'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '30px', fontSize: '10px', fontWeight: 'black', fontFamily: 'PolySans Mono, monospace', letterSpacing: '0.1em' }} 
                iconType="square" 
                iconSize={8}
              />
              {selectedPlayersToCompare.map((p, i) => {
                const name = `${p.full_name || p.name || 'Inconnu'}`.toUpperCase();
                return (
                  <Bar 
                    key={p.id || i}
                    name={name}
                    dataKey={`${p.full_name || p.name || 'Inconnu'}`} 
                    fill={COLORS[i % COLORS.length]} 
                    radius={[0, 2, 2, 0]}
                    barSize={10}
                    animationDuration={1500}
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
