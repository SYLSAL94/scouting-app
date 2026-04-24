import React, { useState, useMemo } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ZAxis, Cell, Label, ReferenceLine,
  ReferenceArea
} from 'recharts';
import { Search, Activity, Target, Save } from 'lucide-react';
import Select from 'react-select';

// Utilitaire de formatage
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

const ScatterControls = ({ 
  metricsList, xAxis, setXAxis, yAxis, setYAxis, playersCount, chartData,
  showAvgX, setShowAvgX, showAvgY, setShowAvgY,
  invertX, setInvertX, invertY, setInvertY,
  focusedPlayerIds, setFocusedPlayerIds
}) => {
  const [visualPresets, setVisualPresets] = useState([
    { name: "Volume vs Efficacité", x: "minutes_on_field", y: "note_ponderee" },
    { name: "Création vs xG", x: "xg_assist_avg", y: "xg_shot_avg" },
    { name: "Duels vs Physique", x: "duels_avg", y: "weight" }
  ]);
  const [showSave, setShowSave] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");

  const handleExportPython = () => {
    const pythonScript = `
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

# Données exportées depuis le Scouting Dashboard (The Analyst)
data = ${JSON.stringify(chartData.map(p => ({
  name: p.name,
  team: p.team,
  x: p.x,
  y: p.y,
  role: p.position_category
})), null, 2)}

df = pd.DataFrame(data)

# Configuration du style
plt.style.use('dark_background')
plt.figure(figsize=(14, 10))
sns.set_theme(style="dark", palette="muted")

# Création du Scatter Plot
scatter = sns.scatterplot(
    data=df, x='x', y='y', hue='role', 
    s=100, alpha=0.7, edgecolors='white', linewidth=0.5
)

# Inversion des axes si nécessaire
if ${invertX}: plt.gca().invert_xaxis()
if ${invertY}: plt.gca().invert_yaxis()

# Ajout des lignes de moyennes
if ${showAvgX}: plt.axvline(df['x'].mean(), color='white', linestyle='--', alpha=0.3, label='Moyenne X')
if ${showAvgY}: plt.axhline(df['y'].mean(), color='white', linestyle='--', alpha=0.3, label='Moyenne Y')

# Labels et Titre
plt.title(f"Analyse Scouting : ${xAxis.replace(/_/g, ' ')} vs ${yAxis.replace(/_/g, ' ')}", fontsize=16, pad=20)
plt.xlabel("${xAxis.replace(/_/g, ' ').toUpperCase()}", fontsize=12)
plt.ylabel("${yAxis.replace(/_/g, ' ').toUpperCase()}", fontsize=12)

# Optimisation de la légende
plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left', title="Postes")
plt.tight_layout()

print("Graphique généré avec succès.")
plt.show()
`;

    const blob = new Blob([pythonScript], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scatter_export_${new Date().getTime()}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;
    setVisualPresets([...visualPresets, { name: newPresetName, x: xAxis, y: yAxis }]);
    setNewPresetName("");
    setShowSave(false);
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      background: 'rgba(255, 255, 255, 0.03)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      color: 'white',
      minWidth: '180px',
      fontSize: '11px'
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
      fontSize: '11px'
    }),
    singleValue: (base) => ({ ...base, color: 'white' }),
    multiValue: (base) => ({ ...base, background: 'rgba(56, 189, 248, 0.2)', borderRadius: '6px' }),
    multiValueLabel: (base) => ({ ...base, color: '#38bdf8', fontSize: '10px', fontWeight: 'bold' }),
    multiValueRemove: (base) => ({ ...base, color: '#38bdf8', ':hover': { background: '#38bdf8', color: 'white' } }),
    input: (base) => ({ ...base, color: 'white' }),
    placeholder: (base) => ({ ...base, color: 'white/30' })
  };

  const Toggle = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-[10px] font-bold text-white/50 uppercase">{label}</span>
      <button 
        onClick={() => onChange(!checked)}
        className={`w-8 h-4 rounded-full p-0.5 transition-all ${checked ? 'bg-sky-500' : 'bg-white/10'}`}
      >
        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="flex flex-wrap gap-8 items-start p-6 glass-panel border border-white/5 relative z-[60]">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[9px] text-white/30 uppercase font-black mb-1 ml-1">Axes X / Y</span>
          <div className="flex gap-2">
            <Select 
              options={metricsList}
              value={metricsList.find(m => m.options?.some(o => o.value === xAxis))?.options?.find(o => o.value === xAxis)}
              onChange={(opt) => setXAxis(opt.value)}
              styles={selectStyles}
              isSearchable
            />
            <Select 
              options={metricsList}
              value={metricsList.find(m => m.options?.some(o => o.value === yAxis))?.options?.find(o => o.value === yAxis)}
              onChange={(opt) => setYAxis(opt.value)}
              styles={selectStyles}
              isSearchable
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-[200px]">
        <span className="text-[9px] text-white/30 uppercase font-black mb-1 ml-1">Focus & Highlight</span>
        <Select 
          isMulti
          options={chartData.map(p => ({ value: p.id, label: p.name }))}
          value={chartData.filter(p => focusedPlayerIds.includes(p.id)).map(p => ({ value: p.id, label: p.name }))}
          onChange={(opts) => setFocusedPlayerIds(opts ? opts.map(o => o.value) : [])}
          styles={selectStyles}
          placeholder="Focus on players..."
          className="w-full"
        />
      </div>

      <div className="flex flex-col border-l border-white/10 pl-6 min-w-[150px]">
        <span className="text-[9px] text-white/30 uppercase font-black mb-2 ml-1">Affichage</span>
        <div className="grid grid-cols-1 gap-x-6">
          <Toggle label="Moyenne X" checked={showAvgX} onChange={setShowAvgX} />
          <Toggle label="Moyenne Y" checked={showAvgY} onChange={setShowAvgY} />
          <Toggle label="Inverser X" checked={invertX} onChange={setInvertX} />
          <Toggle label="Inverser Y" checked={invertY} onChange={setInvertY} />
        </div>
      </div>

      <div className="flex items-start gap-6 border-l border-white/10 pl-6">
        <div className="flex flex-col">
          <span className="text-[9px] text-white/30 uppercase font-black mb-1 ml-1">Visual Presets</span>
          <div className="flex items-center gap-2">
            <select 
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white appearance-none outline-none focus:border-sky-500/50 min-w-[120px]"
              onChange={(e) => {
                const preset = visualPresets[e.target.value];
                if (preset) {
                  setXAxis(preset.x);
                  setYAxis(preset.y);
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Load axes...</option>
              {visualPresets.map((p, i) => (
                <option key={i} value={i}>{p.name}</option>
              ))}
            </select>
            <button 
              onClick={() => setShowSave(true)}
              className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-sky-400 hover:border-sky-500/30 transition-all"
            >
              <Save size={14} />
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-[9px] text-white/30 uppercase font-black mb-1 ml-1">Export</span>
          <button 
            onClick={handleExportPython}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl text-[10px] font-black text-indigo-300 uppercase tracking-tighter hover:from-indigo-500/30 hover:to-purple-500/30 transition-all"
          >
            <Activity size={12} />
            Python
          </button>
        </div>
      </div>

      {showSave && (
        <div className="absolute top-full left-0 mt-2 p-4 glass-panel border border-sky-500/30 shadow-2xl z-[70]">
          <input 
            type="text" placeholder="Preset name..." 
            className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white mb-2 block w-full"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={handleSavePreset} className="flex-1 bg-sky-500 text-white text-[10px] font-bold py-2 rounded-lg">Save</button>
            <button onClick={() => setShowSave(false)} className="flex-1 bg-white/5 text-white/40 text-[10px] font-bold py-2 rounded-lg">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

const CustomScatterPoint = (props) => {
  const { cx, cy, fill, payload, focusedPlayerIds } = props;
  if (cx == null || cy == null) return null;

  const isFocused = focusedPlayerIds.includes(payload.id);
  const hasFocusActive = focusedPlayerIds.length > 0;
  
  const opacity = hasFocusActive ? (isFocused ? 1 : 0.15) : 0.8;
  const radius = isFocused ? 8 : 5;
  const stroke = isFocused ? "white" : "rgba(255,255,255,0.1)";
  const strokeWidth = isFocused ? 2 : 1;

  return (
    <g>
      <circle 
        cx={cx} cy={cy} r={radius} 
        fill={fill} opacity={opacity} 
        stroke={stroke} strokeWidth={strokeWidth}
        style={{ 
          filter: isFocused ? 'url(#scatterGlow)' : 'none',
          transition: 'all 0.3s ease'
        }}
      />
      {isFocused && (
        <text 
          x={cx} y={cy - 12} 
          textAnchor="middle" 
          className="text-[10px] font-black fill-white pointer-events-none"
          style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}
        >
          {payload.name}
        </text>
      )}
    </g>
  );
};

const ScatterContent = ({ players, metricsList, onPlayerClick }) => {
  const [xAxis, setXAxis] = useState('minutes_on_field');
  const [yAxis, setYAxis] = useState('note_ponderee');

  const [showAvgX, setShowAvgX] = useState(true);
  const [showAvgY, setShowAvgY] = useState(true);
  const [invertX, setInvertX] = useState(false);
  const [invertY, setInvertY] = useState(false);
  const [focusedPlayerIds, setFocusedPlayerIds] = useState([]);

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

  const { averages, stats } = useMemo(() => {
    if (!chartData.length) return { averages: { x: 0, y: 0 }, stats: [] };
    const xVals = chartData.map(p => p.x);
    const yVals = chartData.map(p => p.y);
    const avgX = xVals.reduce((a, b) => a + b, 0) / chartData.length;
    const avgY = yVals.reduce((a, b) => a + b, 0) / chartData.length;

    const qStats = { q1: 0, q2: 0, q3: 0, q4: 0 };
    chartData.forEach(p => {
      if (p.x >= avgX && p.y >= avgY) qStats.q1++;
      else if (p.x < avgX && p.y >= avgY) qStats.q2++;
      else if (p.x < avgX && p.y < avgY) qStats.q3++;
      else qStats.q4++;
    });

    const total = chartData.length;
    return { 
      averages: { x: avgX, y: avgY }, 
      stats: [
        { label: 'Élite (H/H)', count: qStats.q1, pct: ((qStats.q1/total)*100).toFixed(1), color: 'text-emerald-400' },
        { label: 'Efficace (B/H)', count: qStats.q2, pct: ((qStats.q2/total)*100).toFixed(1), color: 'text-sky-400' },
        { label: 'Volume (H/B)', count: qStats.q4, pct: ((qStats.q4/total)*100).toFixed(1), color: 'text-amber-400' },
        { label: 'Critique (B/B)', count: qStats.q3, pct: ((qStats.q3/total)*100).toFixed(1), color: 'text-rose-400' },
      ]
    };
  }, [chartData]);

  return (
    <div className="flex flex-col h-full space-y-6">
      <ScatterControls 
        metricsList={metricsList}
        xAxis={xAxis} setXAxis={setXAxis}
        yAxis={yAxis} setYAxis={setYAxis}
        playersCount={players.length}
        chartData={chartData}
        showAvgX={showAvgX} setShowAvgX={setShowAvgX}
        showAvgY={showAvgY} setShowAvgY={setShowAvgY}
        invertX={invertX} setInvertX={setInvertX}
        invertY={invertY} setInvertY={setInvertY}
        focusedPlayerIds={focusedPlayerIds} setFocusedPlayerIds={setFocusedPlayerIds}
      />

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-2 border-b border-white/5">
        {Object.entries(ROLE_COLORS).map(([role, color]) => (
          <div key={role} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}40` }} />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{role}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-[500px] glass-panel p-8 relative overflow-hidden border border-white/5">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {showAvgX && showAvgY && (
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
        )}

        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 30 }}>
            <defs>
              <filter id="scatterGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              type="number" dataKey="x" name={xAxis} 
              reversed={invertX}
              stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700 }} 
              axisLine={false} tickLine={false} domain={['auto', 'auto']}
            >
              <Label value={xAxis.replace(/_/g, ' ')} offset={-20} position="insideBottom" fill="rgba(255,255,255,0.2)" fontSize={10} fontWeight="900" style={{ textTransform: 'uppercase' }} />
            </XAxis>
            <YAxis 
              type="number" dataKey="y" name={yAxis} 
              reversed={invertY}
              stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700 }} 
              axisLine={false} tickLine={false} domain={['auto', 'auto']}
            >
              <Label value={yAxis.replace(/_/g, ' ')} angle={-90} offset={-10} position="insideLeft" fill="rgba(255,255,255,0.2)" fontSize={10} fontWeight="900" style={{ textTransform: 'uppercase' }} />
            </YAxis>
            <ZAxis type="number" range={[60, 60]} />
            <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#38bdf8', strokeWidth: 1 }} isAnimationActive={false} />
            
            {showAvgX && showAvgY && averages.x && averages.y && (
              <>
                <ReferenceArea x1={averages.x} y1={averages.y} fill="rgba(34, 197, 94, 0.05)" stroke="none" />
                <ReferenceArea x2={averages.x} y1={averages.y} fill="rgba(56, 189, 248, 0.05)" stroke="none" />
                <ReferenceArea x2={averages.x} y2={averages.y} fill="rgba(244, 63, 94, 0.05)" stroke="none" />
                <ReferenceArea x1={averages.x} y2={averages.y} fill="rgba(245, 158, 11, 0.05)" stroke="none" />
              </>
            )}

            {showAvgX && averages.x && (
              <ReferenceLine x={averages.x} stroke="rgba(255,255,255,0.15)" strokeDasharray="10 5">
                 <Label value={`Moy. X: ${formatNumber(averages.x)}`} position="top" fill="rgba(255,255,255,0.3)" fontSize={9} fontWeight="bold" />
              </ReferenceLine>
            )}
            {showAvgY && averages.y && (
              <ReferenceLine y={averages.y} stroke="rgba(255,255,255,0.15)" strokeDasharray="10 5">
                 <Label value={`Moy. Y: ${formatNumber(averages.y)}`} position="insideLeft" fill="rgba(255,255,255,0.3)" fontSize={9} fontWeight="bold" dx={10} />
              </ReferenceLine>
            )}

            <Scatter 
              name="Players" data={chartData} 
              onClick={(data) => onPlayerClick(data.originalPlayer)} 
              cursor="pointer" isAnimationActive={false}
              shape={<CustomScatterPoint focusedPlayerIds={focusedPlayerIds} />}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.position_category] || ROLE_COLORS['Autres']} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScatterContent;
