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
      <div className="bg-[#131313] p-5 border border-white/20 rounded-[4px] min-w-[220px] shadow-2xl">
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-[2px] bg-[#2d2d2d] border border-white/10 overflow-hidden">
            {data.image ? (
              <img src={data.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/10 verge-h3 text-xl">
                {data.name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="verge-h3 text-sm text-white truncate uppercase">{data.name}</div>
            <div className="verge-label-mono text-[8px] text-[#3cffd0] uppercase truncate">{data.team}</div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="verge-label-mono text-[8px] text-[#949494] uppercase">Metric X</span>
            <span className="verge-label-mono text-[10px] text-white bg-white/5 px-2 py-1 border border-white/10">
              {formatNumber(data.x)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="verge-label-mono text-[8px] text-[#949494] uppercase">Metric Y</span>
            <span className="verge-label-mono text-[10px] text-[#3cffd0] bg-[#3cffd0]/10 px-2 py-1 border border-[#3cffd0]/20">
              {formatNumber(data.y)}
            </span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <div className="verge-label-mono text-[7px] text-[#949494] uppercase">
            Click: Focus • Double Click: Profile
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const ROLE_COLORS = {
  'Gardien': '#facc15',
  'Defenseurs centraux': '#3cffd0', // Jelly Mint
  'Latéraux': '#5200ff', // Ultraviolet
  'Milieux defensifs': '#22c55e',
  'Milieux centraux': '#10b981',
  'Milieux offensifs': '#a855f7',
  'Ailiers': '#f59e0b',
  'Avant-centre': '#f97316',
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

# Data exported from Scouting App (Verge UI)
data = ${JSON.stringify(chartData.map(p => ({
  name: p.name,
  team: p.team,
  x: p.x,
  y: p.y,
  role: p.position_category
})), null, 2)}

df = pd.DataFrame(data)
plt.style.use('dark_background')
plt.figure(figsize=(14, 10))
sns.scatterplot(data=df, x='x', y='y', hue='role', s=100)
if ${invertX}: plt.gca().invert_xaxis()
if ${invertY}: plt.gca().invert_yaxis()
plt.show()
`;
    const blob = new Blob([pythonScript], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verge_export_${new Date().getTime()}.py`;
    a.click();
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
      background: '#131313',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '4px',
      color: 'white',
      minHeight: '44px',
      fontSize: '10px',
      fontFamily: 'PolySans Mono, monospace',
      textTransform: 'uppercase'
    }),
    menu: (base) => ({
      ...base,
      background: '#131313',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '4px',
      zIndex: 100
    }),
    option: (base, state) => ({
      ...base,
      background: state.isFocused ? '#3cffd0' : 'transparent',
      color: state.isFocused ? 'black' : 'white',
      fontSize: '9px',
      fontFamily: 'PolySans Mono, monospace',
      textTransform: 'uppercase'
    }),
    singleValue: (base) => ({ ...base, color: 'white' }),
    multiValue: (base) => ({ ...base, background: '#3cffd0', borderRadius: '2px' }),
    multiValueLabel: (base) => ({ ...base, color: 'black', fontSize: '9px', fontWeight: '900' }),
    multiValueRemove: (base) => ({ ...base, color: 'black', ':hover': { background: 'black', color: '#3cffd0' } }),
    input: (base) => ({ ...base, color: 'white' }),
    placeholder: (base) => ({ ...base, color: 'rgba(255,255,255,0.2)' })
  };

  const Toggle = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="verge-label-mono text-[8px] text-[#949494] uppercase">{label}</span>
      <button 
        onClick={() => onChange(!checked)}
        className={`w-9 h-4 p-0.5 transition-all rounded-[2px] ${checked ? 'bg-[#3cffd0]' : 'bg-white/10'}`}
      >
        <div className={`w-3 h-3 transition-transform rounded-[1px] ${checked ? 'bg-black translate-x-5' : 'bg-[#949494] translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="flex flex-wrap gap-8 items-start p-8 bg-[#2d2d2d] border border-white/5 rounded-[24px] relative z-[60]">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="verge-label-mono text-[9px] text-[#3cffd0] mb-2 uppercase">X / Y Mapping</span>
          <div className="flex gap-3">
            <div className="w-[200px]">
              <Select 
                options={metricsList}
                value={metricsList.find(m => m.options?.some(o => o.value === xAxis))?.options?.find(o => o.value === xAxis)}
                onChange={(opt) => setXAxis(opt.value)}
                styles={selectStyles}
                isSearchable
              />
            </div>
            <div className="w-[200px]">
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
      </div>

      <div className="flex flex-col flex-1 min-w-[250px]">
        <span className="verge-label-mono text-[9px] text-[#3cffd0] mb-2 uppercase">Subject Focus</span>
        <Select 
          isMulti
          options={chartData.map(p => ({ value: p.id, label: p.name }))}
          value={chartData.filter(p => focusedPlayerIds.includes(p.id)).map(p => ({ value: p.id, label: p.name }))}
          onChange={(opts) => setFocusedPlayerIds(opts ? opts.map(o => o.value) : [])}
          styles={selectStyles}
          placeholder="Select profiles..."
        />
      </div>

      <div className="flex flex-col border-l border-white/10 pl-8 min-w-[150px]">
        <span className="verge-label-mono text-[9px] text-[#3cffd0] mb-2 uppercase">Display Options</span>
        <div className="grid grid-cols-1">
          <Toggle label="Mean X" checked={showAvgX} onChange={setShowAvgX} />
          <Toggle label="Mean Y" checked={showAvgY} onChange={setShowAvgY} />
          <Toggle label="Invert X" checked={invertX} onChange={setInvertX} />
          <Toggle label="Invert Y" checked={invertY} onChange={setInvertY} />
        </div>
      </div>

      <div className="flex items-start gap-8 border-l border-white/10 pl-8">
        <div className="flex flex-col">
          <span className="verge-label-mono text-[9px] text-[#3cffd0] mb-2 uppercase">Presets</span>
          <div className="flex items-center gap-2">
            <select 
              className="bg-[#131313] border border-white/10 rounded-[4px] px-3 h-[44px] verge-label-mono text-[9px] text-white outline-none focus:border-[#3cffd0] min-w-[140px]"
              onChange={(e) => {
                const preset = visualPresets[e.target.value];
                if (preset) { setXAxis(preset.x); setYAxis(preset.y); }
              }}
              defaultValue=""
            >
              <option value="" disabled>Load Preset</option>
              {visualPresets.map((p, i) => (
                <option key={i} value={i}>{p.name}</option>
              ))}
            </select>
            <button 
              onClick={() => setShowSave(true)}
              className="h-[44px] w-[44px] flex items-center justify-center bg-[#131313] border border-white/10 rounded-[4px] text-[#949494] hover:text-[#3cffd0] hover:border-[#3cffd0] transition-all"
            >
              <Save size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="verge-label-mono text-[9px] text-[#3cffd0] mb-2 uppercase">Export</span>
          <button 
            onClick={handleExportPython}
            className="h-[44px] px-6 bg-white text-black rounded-[4px] verge-label-mono text-[9px] font-black hover:bg-[#3cffd0] transition-colors flex items-center gap-2"
          >
            <Activity size={14} /> PYTHON SCRIPT
          </button>
        </div>
      </div>

      {showSave && (
        <div className="absolute top-full right-8 mt-4 p-6 bg-[#131313] border border-white/20 rounded-[12px] shadow-2xl z-[70] w-[250px]">
          <span className="verge-label-mono text-[8px] text-[#3cffd0] mb-3 block">NEW PRESET NAME</span>
          <input 
            type="text" placeholder="..." 
            className="bg-[#2d2d2d] border border-white/10 rounded-[4px] px-3 py-3 verge-label-mono text-[10px] text-white mb-4 block w-full outline-none focus:border-[#3cffd0]"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={handleSavePreset} className="flex-1 bg-[#3cffd0] text-black verge-label-mono text-[9px] font-black py-3 rounded-[4px]">SAVE</button>
            <button onClick={() => setShowSave(false)} className="flex-1 bg-white/5 text-[#949494] verge-label-mono text-[9px] py-3 rounded-[4px]">CANCEL</button>
          </div>
        </div>
      )}
    </div>
  );
};

const CustomScatterPoint = (props) => {
  const { cx, cy, fill, payload, focusedPlayerIds, setFocusedPlayerIds, onPlayerClick } = props;
  if (cx == null || cy == null) return null;

  const isFocused = focusedPlayerIds.includes(payload.id);
  const hasFocusActive = focusedPlayerIds.length > 0;
  
  const opacity = hasFocusActive ? (isFocused ? 1 : 0.1) : 0.8;
  const radius = isFocused ? 10 : 6;
  const stroke = isFocused ? "white" : "none";
  const strokeWidth = 2;

  const handleClick = (e) => {
    e.stopPropagation();
    if (e.detail === 2) {
      onPlayerClick(payload.originalPlayer);
    } else {
      setTimeout(() => {
        if (e.detail === 1) {
           setFocusedPlayerIds(prev => 
            prev.includes(payload.id) ? prev.filter(id => id !== payload.id) : [...prev, payload.id]
          );
        }
      }, 200);
    }
  };

  return (
    <g onClick={handleClick} cursor="pointer">
      <circle 
        cx={cx} cy={cy} r={radius} 
        fill={fill} opacity={opacity} 
        stroke={stroke} strokeWidth={strokeWidth}
        style={{ transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
      />
      {isFocused && (
        <text 
          x={cx} y={cy - 16} 
          textAnchor="middle" 
          className="verge-label-mono text-[10px] fill-white pointer-events-none uppercase font-black"
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
        { label: 'High Performers', count: qStats.q1, pct: ((qStats.q1/total)*100).toFixed(1), color: 'text-[#3cffd0]' },
        { label: 'Efficiency Bias', count: qStats.q2, pct: ((qStats.q2/total)*100).toFixed(1), color: 'text-[#5200ff]' },
        { label: 'Volume Bias', count: qStats.q4, pct: ((qStats.q4/total)*100).toFixed(1), color: 'text-[#facc15]' },
        { label: 'Underperformers', count: qStats.q3, pct: ((qStats.q3/total)*100).toFixed(1), color: 'text-red-500' },
      ]
    };
  }, [chartData]);

  return (
    <div className="flex flex-col h-full space-y-8">
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

      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-4 border-b border-white/10">
        {Object.entries(ROLE_COLORS).map(([role, color]) => (
          <div key={role} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-[1px]" style={{ backgroundColor: color }} />
            <span className="verge-label-mono text-[9px] text-[#949494] uppercase tracking-widest">{role}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-[600px] bg-[#131313] p-10 relative border border-white/10 rounded-[24px] overflow-hidden">
        {showAvgX && showAvgY && (
          <div className="absolute top-10 right-10 z-10 w-56 p-6 bg-[#131313] border border-white/20 shadow-2xl">
            <div className="verge-label-mono text-[9px] text-[#3cffd0] uppercase mb-4 font-black">Quadrant Distribution</div>
            <div className="space-y-4">
              {stats.map(item => (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className={`verge-label-mono text-[8px] uppercase font-bold ${item.color}`}>{item.label}</span>
                    <span className="verge-label-mono text-[10px] text-white font-black">{item.count}</span>
                  </div>
                  <div className="w-full h-1 bg-white/5">
                    <div className="h-full bg-white/20" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 30 }}>
            <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.05)" vertical={true} horizontal={true} />
            <XAxis 
              type="number" dataKey="x" name={xAxis} 
              reversed={invertX}
              stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'PolySans Mono' }} 
              axisLine={true} tickLine={false} domain={['auto', 'auto']}
            >
              <Label value={xAxis.replace(/_/g, ' ').toUpperCase()} offset={-25} position="insideBottom" fill="#3cffd0" fontSize={9} fontFamily="PolySans Mono" fontWeight="900" />
            </XAxis>
            <YAxis 
              type="number" dataKey="y" name={yAxis} 
              reversed={invertY}
              stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'PolySans Mono' }} 
              axisLine={true} tickLine={false} domain={['auto', 'auto']}
            >
              <Label value={yAxis.replace(/_/g, ' ').toUpperCase()} angle={-90} offset={-15} position="insideLeft" fill="#3cffd0" fontSize={9} fontFamily="PolySans Mono" fontWeight="900" />
            </YAxis>
            <ZAxis type="number" range={[60, 60]} />
            <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '4 4', stroke: '#3cffd0', strokeWidth: 1 }} />
            
            {showAvgX && showAvgY && averages.x && averages.y && (
              <>
                <ReferenceArea x1={averages.x} y1={averages.y} fill="rgba(60, 255, 208, 0.03)" stroke="none" />
                <ReferenceArea x2={averages.x} y2={averages.y} fill="rgba(239, 68, 68, 0.03)" stroke="none" />
              </>
            )}

            {showAvgX && averages.x && (
              <ReferenceLine x={averages.x} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
            )}
            {showAvgY && averages.y && (
              <ReferenceLine y={averages.y} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
            )}

            <Scatter 
              name="Players" data={chartData} 
              shape={<CustomScatterPoint 
                focusedPlayerIds={focusedPlayerIds} 
                setFocusedPlayerIds={setFocusedPlayerIds}
                onPlayerClick={onPlayerClick}
              />}
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
