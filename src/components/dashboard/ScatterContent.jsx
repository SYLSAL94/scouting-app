import React, { useState, useMemo } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ZAxis, Cell, Label, ReferenceLine,
  ReferenceArea
} from 'recharts';
import { Search, Activity, Target } from 'lucide-react';
import Select from 'react-select';

// Utilitaire de formatage (identique à celui de PlayerModal)
const formatNumber = (val) => {
  if (val === null || val === undefined || val === "") return "-";
  const num = Number(val);
  return isNaN(num) ? val : (num % 1 === 0 ? num : num.toFixed(2));
};

const ScatterTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-panel p-4 border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
            {data.image && <img src={data.image} alt="" className="w-full h-full object-cover" />}
          </div>
          <div>
            <div className="text-sm font-bold text-white">{data.name}</div>
            <div className="text-[10px] text-sky-400 font-medium uppercase tracking-wider">{data.team}</div>
          </div>
        </div>
        <div className="space-y-1.5 pt-2 border-t border-white/5">
          <div className="flex justify-between gap-4">
            <span className="text-[10px] text-white/40 uppercase font-black">X Axis</span>
            <span className="text-xs font-mono text-sky-400 font-bold">{formatNumber(data.x)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[10px] text-white/40 uppercase font-black">Y Axis</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">{formatNumber(data.y)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const ROLE_COLORS = {
  'Gardien': '#facc15', // Jaune
  'Defenseurs centraux': '#38bdf8', // Sky
  'Latéraux': '#60a5fa', // Blue
  'Milieux defensifs': '#22c55e', // Vert
  'Milieux centraux': '#10b981', // Emeraude
  'Milieux offensifs': '#8b5cf6', // Violet
  'Ailiers': '#f59e0b', // Ambre
  'Avant-centre': '#f97316', // Orange
  'Autres': '#94a3b8'
};

const ScatterContent = ({ players, metricsList, onPlayerClick }) => {
  const [xAxis, setXAxis] = useState('minutes_on_field');
  const [yAxis, setYAxis] = useState('note_ponderee');

  // Préparation des données pour Recharts
  const chartData = useMemo(() => {
    return players.map(p => ({
      x: Number(p[xAxis]) || 0,
      y: Number(p[yAxis]) || 0,
      name: p.name || p.full_name,
      team: p.last_club_name,
      image: p.image,
      id: p.wyId || p.id,
      position_category: p.position_category,
      originalPlayer: p
    }));
  }, [players, xAxis, yAxis]);

  // Calcul des moyennes et statistiques de quadrants
  const { averages, stats, extent } = useMemo(() => {
    if (!chartData.length) return { averages: { x: 0, y: 0 }, stats: [], extent: { xMin: 0, xMax: 1, yMin: 0, yMax: 1 } };
    
    const xVals = chartData.map(p => p.x);
    const yVals = chartData.map(p => p.y);
    const avgX = xVals.reduce((a, b) => a + b, 0) / chartData.length;
    const avgY = yVals.reduce((a, b) => a + b, 0) / chartData.length;

    const qStats = { q1: 0, q2: 0, q3: 0, q4: 0 };
    chartData.forEach(p => {
      if (p.x >= avgX && p.y >= avgY) qStats.q1++; // Top-Right (Elite)
      else if (p.x < avgX && p.y >= avgY) qStats.q2++; // Top-Left
      else if (p.x < avgX && p.y < avgY) qStats.q3++; // Bottom-Left (Critical)
      else qStats.q4++; // Bottom-Right
    });

    const total = chartData.length;
    const breakdown = [
      { label: 'Élite (H/H)', count: qStats.q1, pct: ((qStats.q1/total)*100).toFixed(1), color: 'text-emerald-400' },
      { label: 'Efficace (B/H)', count: qStats.q2, pct: ((qStats.q2/total)*100).toFixed(1), color: 'text-sky-400' },
      { label: 'Volume (H/B)', count: qStats.q4, pct: ((qStats.q4/total)*100).toFixed(1), color: 'text-amber-400' },
      { label: 'Critique (B/B)', count: qStats.q3, pct: ((qStats.q3/total)*100).toFixed(1), color: 'text-rose-400' },
    ];

    return { 
      averages: { x: avgX, y: avgY }, 
      stats: breakdown,
      extent: {
        xMin: Math.min(...xVals),
        xMax: Math.max(...xVals),
        yMin: Math.min(...yVals),
        yMax: Math.max(...yVals)
      }
    };
  }, [chartData]);

  // Styles custom pour react-select (matching FilterPanel)
  const selectStyles = {
    control: (base) => ({
      ...base,
      background: 'rgba(255, 255, 255, 0.03)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      color: 'white',
      minWidth: '220px'
    }),
    menu: (base) => ({
      ...base,
      background: '#0f172a',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      zIndex: 100
    }),
    option: (base, state) => ({
      ...base,
      background: state.isFocused ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
      color: state.isSelected ? '#38bdf8' : 'white',
      fontSize: '12px'
    }),
    singleValue: (base) => ({ ...base, color: 'white' }),
    input: (base) => ({ ...base, color: 'white' }),
    placeholder: (base) => ({ ...base, color: 'white/30' }),
    groupHeading: (base) => ({
        ...base,
        color: '#38bdf8',
        fontWeight: 'bold',
        fontSize: '10px'
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 })
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Contrôles des axes et Légende */}
      <div className="flex flex-wrap gap-4 items-center p-6 glass-panel border border-white/5 relative z-[60]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 rounded-lg"><Target size={16} className="text-sky-400" /></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-white/40 uppercase font-black mb-1">Axe X (Horizontal)</span>
            <Select 
              options={metricsList}
              defaultValue={metricsList.find(m => m.options?.some(o => o.value === xAxis))?.options?.find(o => o.value === xAxis)}
              onChange={(opt) => setXAxis(opt.value)}
              styles={selectStyles}
              isSearchable
              menuPortalTarget={document.body}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg"><Activity size={16} className="text-emerald-400" /></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-white/40 uppercase font-black mb-1">Axe Y (Vertical)</span>
            <Select 
              options={metricsList}
              defaultValue={metricsList.find(m => m.options?.some(o => o.value === yAxis))?.options?.find(o => o.value === yAxis)}
              onChange={(opt) => setYAxis(opt.value)}
              styles={selectStyles}
              isSearchable
              menuPortalTarget={document.body}
            />
          </div>
        </div>

        {/* Légende des Rôles */}
        <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-2 px-4 border-l border-white/10">
          {Object.entries(ROLE_COLORS).map(([role, color]) => (
            <div key={role} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: color }} />
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-tight">{role}</span>
            </div>
          ))}
        </div>

        <div className="ml-auto text-right">
          <div className="text-[10px] text-white/40 uppercase font-black mb-1">Population</div>
          <div className="text-xl font-black text-white">{players.length} <span className="text-sky-400">Joueurs</span></div>
        </div>
      </div>

      {/* Zone Graphique */}
      <div className="flex-1 min-h-[500px] glass-panel p-8 relative overflow-hidden border border-white/5">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Panel de Distribution (Flottant) */}
        <div className="absolute top-8 right-8 z-10 w-48 p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl pointer-events-none">
          <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">Distribution</div>
          <div className="space-y-3">
            {stats.map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase ${item.color}`}>{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white">{item.count}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 font-mono">{item.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            
            <XAxis 
              type="number" 
              dataKey="x" 
              name={xAxis} 
              stroke="rgba(255,255,255,0.2)"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
            >
              <Label value={xAxis.replace(/_/g, ' ')} offset={-20} position="insideBottom" fill="rgba(255,255,255,0.2)" fontSize={10} fontWeight="900" style={{ textTransform: 'uppercase' }} />
            </XAxis>

            <YAxis 
              type="number" 
              dataKey="y" 
              name={yAxis} 
              stroke="rgba(255,255,255,0.2)"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
            >
              <Label value={yAxis.replace(/_/g, ' ')} angle={-90} offset={-10} position="insideLeft" fill="rgba(255,255,255,0.2)" fontSize={10} fontWeight="900" style={{ textTransform: 'uppercase' }} />
            </YAxis>

            <ZAxis type="number" range={[60, 60]} />
            
            <Tooltip 
              content={<ScatterTooltip />} 
              cursor={{ strokeDasharray: '3 3', stroke: '#38bdf8', strokeWidth: 1 }} 
              isAnimationActive={false}
            />

            {/* Zones de Quadrants */}
            {averages.x && averages.y && (
              <>
                <ReferenceArea x1={averages.x} y1={averages.y} fill="rgba(34, 197, 94, 0.05)" stroke="none" /> {/* Elite */}
                <ReferenceArea x2={averages.x} y1={averages.y} fill="rgba(56, 189, 248, 0.05)" stroke="none" /> {/* Top-Left */}
                <ReferenceArea x2={averages.x} y2={averages.y} fill="rgba(244, 63, 94, 0.05)" stroke="none" />  {/* Critical */}
                <ReferenceArea x1={averages.x} y2={averages.y} fill="rgba(245, 158, 11, 0.05)" stroke="none" /> {/* Bottom-Right */}
              </>
            )}

            {/* Lignes de Moyenne */}
            <ReferenceLine x={averages.x} stroke="rgba(255,255,255,0.15)" strokeDasharray="10 5">
               <Label value={`Moy. X: ${formatNumber(averages.x)}`} position="top" fill="rgba(255,255,255,0.3)" fontSize={9} fontWeight="bold" />
            </ReferenceLine>
            <ReferenceLine y={averages.y} stroke="rgba(255,255,255,0.15)" strokeDasharray="10 5">
               <Label value={`Moy. Y: ${formatNumber(averages.y)}`} position="insideLeft" fill="rgba(255,255,255,0.3)" fontSize={9} fontWeight="bold" dx={10} />
            </ReferenceLine>

            <Scatter 
              name="Players" 
              data={chartData} 
              onClick={(data) => onPlayerClick(data.originalPlayer)}
              cursor="pointer"
              isAnimationActive={false}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={ROLE_COLORS[entry.position_category] || ROLE_COLORS['Autres']}
                  fillOpacity={0.8}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={1}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScatterContent;
