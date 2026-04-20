import React, { useState, useMemo } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ZAxis, Cell, Label, ReferenceLine
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
      originalPlayer: p
    }));
  }, [players, xAxis, yAxis]);

  // Calcul des moyennes pour les lignes de référence
  const averages = useMemo(() => {
    if (!chartData.length) return { x: 0, y: 0 };
    const sumX = chartData.reduce((acc, p) => acc + p.x, 0);
    const sumY = chartData.reduce((acc, p) => acc + p.y, 0);
    return {
      x: sumX / chartData.length,
      y: sumY / chartData.length
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
      {/* Contrôles des axes */}
      <div className="flex flex-wrap gap-4 items-center p-6 glass-panel border border-white/5 relative z-[60]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 rounded-lg"><Target size={16} className="text-sky-400" /></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-white/40 uppercase font-black mb-1">X-Axis Metric</span>
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
            <span className="text-[10px] text-white/40 uppercase font-black mb-1">Y-Axis Metric</span>
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

        <div className="ml-auto text-right">
          <div className="text-[10px] text-white/40 uppercase font-black mb-1">Population size</div>
          <div className="text-xl font-black text-white">{players.length} <span className="text-sky-400">Players</span></div>
        </div>
      </div>

      {/* Zone Graphique */}
      <div className="flex-1 min-h-[500px] glass-panel p-8 relative overflow-hidden border border-white/5">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

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

            <ZAxis type="number" range={[100, 100]} />
            
            <Tooltip 
              content={<ScatterTooltip />} 
              cursor={{ strokeDasharray: '3 3', stroke: '#38bdf8', strokeWidth: 1 }} 
              isAnimationActive={false} // Désactive l'animation du tooltip pour plus de réactivité
            />

            {/* Lignes de Moyenne (Quadrants) */}
            <ReferenceLine x={averages.x} stroke="rgba(255,255,255,0.1)" strokeDasharray="10 5" />
            <ReferenceLine y={averages.y} stroke="rgba(255,255,255,0.1)" strokeDasharray="10 5" />

            <Scatter 
              name="Players" 
              data={chartData} 
              onClick={(data) => onPlayerClick(data.originalPlayer)}
              cursor="pointer"
              isAnimationActive={false} // CRITIQUE : Désactivé pour supporter 1000+ points sans lag
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.x > averages.x && entry.y > averages.y ? '#38bdf8' : 'rgba(255,255,255,0.15)'}
                  stroke={entry.x > averages.x && entry.y > averages.y ? '#7dd3fc' : 'rgba(255,255,255,0.05)'}
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
