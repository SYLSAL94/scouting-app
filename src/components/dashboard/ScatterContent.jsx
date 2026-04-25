import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ZAxis, Cell, Label, ReferenceLine,
  ReferenceArea, LabelList
} from 'recharts';
import { Activity, Target, Save, Users, Download, Trash2, X as CloseIcon } from 'lucide-react';
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
      <div className="bg-[#131313] p-3 md:p-5 border border-white/20 rounded-[4px] min-w-[160px] md:min-w-[220px] shadow-2xl">
        <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 pb-3 md:pb-4 border-b border-white/10">
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-[2px] bg-[#2d2d2d] border border-white/10 overflow-hidden shrink-0">
            {data.image ? (
              <img src={data.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/10 text-base md:text-xl font-black">
                {data.name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-base md:text-lg font-black text-white truncate uppercase leading-tight">{data.name}</div>
            <div className="verge-label-mono text-[7px] md:text-[8px] text-[#3cffd0] uppercase truncate">{data.team}</div>
          </div>
        </div>
        <div className="space-y-2 md:space-y-3">
          <div className="flex justify-between items-center">
            <span className="verge-label-mono text-[7px] md:text-[8px] text-[#949494] uppercase">X</span>
            <span className="verge-label-mono text-[8px] md:text-[10px] text-white bg-white/5 px-1.5 md:px-2 py-0.5 md:py-1 border border-white/10">
              {formatNumber(data.x)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="verge-label-mono text-[7px] md:text-[8px] text-[#949494] uppercase">Y</span>
            <span className="verge-label-mono text-[8px] md:text-[10px] text-[#3cffd0] bg-[#3cffd0]/10 px-1.5 md:px-2 py-0.5 md:py-1 border border-[#3cffd0]/20">
              {formatNumber(data.y)}
            </span>
          </div>
        </div>
        <div className="hidden md:block mt-4 pt-3 border-t border-white/10 text-center">
          <div className="verge-label-mono text-[7px] text-[#949494] uppercase">
            Click: Focus • 2x Click: Profile
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const ROLE_COLORS = {
  'Gardien': '#facc15',
  'Defenseurs centraux': '#3cffd0',
  'Latéraux': '#5200ff',
  'Milieux defensifs': '#22c55e',
  'Milieux centraux': '#10b981',
  'Milieux offensifs': '#a855f7',
  'Ailiers': '#f59e0b',
  'Avant-centre': '#f97316',
  'Autres': '#94a3b8'
};

const CustomScatterPoint = (props) => {
  const { cx, cy, fill, payload, focusedPlayerIds = [], setFocusedPlayerIds, labeledPlayerIds = [], onPlayerClick } = props;
  if (cx == null || cy == null || isNaN(cx) || isNaN(cy)) return null;

  const isFocused = focusedPlayerIds.length > 0 ? focusedPlayerIds.includes(payload.id) : false;
  const isLabeled = (labeledPlayerIds && labeledPlayerIds.includes(payload.id)) || isFocused;
  const hasFocusActive = focusedPlayerIds.length > 0;
  
  const opacity = hasFocusActive ? (isFocused ? 1 : 0.1) : 0.8;
  const radius = isFocused ? 10 : 6;
  const stroke = isFocused ? "white" : "rgba(255,255,255,0.3)";
  const strokeWidth = isFocused ? 2 : 1;

  return (
    <g 
      style={{ cursor: 'pointer' }}
      onClick={(e) => {
        const target = e.currentTarget;
        const now = Date.now();
        const lastClick = target._lastClick || 0;
        target._lastClick = now;

        if (now - lastClick < 300) {
          // Double Click : Navigation vers le profil
          if (onPlayerClick && payload?.originalPlayer) {
            onPlayerClick(payload.originalPlayer);
          }
          target._lastClick = 0;
        } else {
          // Single Click : Toggle focus
          setTimeout(() => {
            if (target && target._lastClick === now) {
              if (setFocusedPlayerIds && payload) {
                setFocusedPlayerIds(prev => 
                  prev.includes(payload.id) ? prev.filter(id => id !== payload.id) : [...prev, payload.id]
                );
              }
            }
          }, 300);
        }
      }}
    >
      <circle 
        cx={cx} cy={cy} r={radius} 
        fill={fill} opacity={opacity} 
        stroke={stroke} strokeWidth={strokeWidth}
        style={{ transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
      />
      {isLabeled && payload && (
        <text 
          x={cx} y={cy - (radius + 8)} 
          textAnchor="middle" 
          fill="white"
          fontSize={10}
          fontFamily="PolySans Mono"
          fontWeight="900"
          style={{ pointerEvents: 'none', textShadow: '0 2px 8px rgba(0,0,0,1)' }}
        >
          {payload.name.toUpperCase()}
        </text>
      )}
    </g>
  );
};

const ScatterControls = ({ 
  metricsList, xAxis, setXAxis, yAxis, setYAxis, playersCount, chartData,
  showAvgX, setShowAvgX, showAvgY, setShowAvgY,
  showQuadrant, setShowQuadrant,
  invertX, setInvertX, invertY, setInvertY,
  excludeZeroX, setExcludeZeroX, excludeZeroY, setExcludeZeroY,
  isSwarmMode, setIsSwarmMode,
  focusedPlayerIds, setFocusedPlayerIds,
  labeledPlayerIds, setLabeledPlayerIds
}) => {
  const [savedPresets, setSavedPresets] = useState([]);
  const [showSave, setShowSave] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPresets = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scatter-profiles`);
      if (response.ok) {
        const data = await response.json();
        setSavedPresets(data);
      }
    } catch (error) {
      console.error("❌ Error fetching scatter profiles:", error);
    }
  }, []);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const handleSave = async () => {
    if (!newPresetName.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/scatter-profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_name: newPresetName,
          axes_config: { x: xAxis, y: yAxis }
        })
      });
      if (response.ok) {
        setNewPresetName("");
        setShowSave(false);
        fetchPresets();
      }
    } catch (error) {
      console.error("❌ Error saving scatter profile:", error);
    }
  };

  const handleDelete = async (profileId) => {
    if (!window.confirm("Supprimer ce preset définitivement ?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/scatter-profiles/${profileId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchPresets();
      }
    } catch (error) {
      console.error("❌ Error deleting scatter profile:", error);
    }
  };

  const findMetricLabel = (value) => {
    for (const group of metricsList) {
      const found = group.options?.find(o => o.value === value);
      if (found) return found.label;
    }
    return value;
  };

  const labelX = findMetricLabel(xAxis);
  const labelY = findMetricLabel(yAxis);

  const handleExportPython = () => {
    const pythonScript = `
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
import numpy as np

# Config Style Verge
plt.rcParams['font.family'] = 'monospace'
plt.rcParams['text.color'] = '#949494'
plt.rcParams['axes.labelcolor'] = '#949494'
plt.rcParams['xtick.color'] = '#444444'
plt.rcParams['ytick.color'] = '#444444'
plt.rcParams['axes.edgecolor'] = '#333333'

data = ${JSON.stringify(chartData.map(p => ({
  name: p.name,
  team: p.team,
  x: p.x,
  y: p.y,
  role: p.position_category
})), null, 2)}

df = pd.DataFrame(data)

# Create Figure
fig, ax = plt.subplots(figsize=(16, 11), facecolor='#0d0d0d')
ax.set_facecolor('#0d0d0d')

# Grid & Spines
ax.grid(color='#3cffd0', linestyle='--', alpha=0.05, linewidth=0.5)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_color('#222222')
ax.spines['bottom'].set_color('#222222')

# Scatter Plot
palette = ['#3cffd0', '#5200ff', '#facc15', '#f43f5e', '#ffffff']
scatter = sns.scatterplot(
    data=df, x='x', y='y', hue='role', 
    palette=palette[:len(df['role'].unique())],
    s=200, edgecolor='#0d0d0d', linewidth=1.5, alpha=0.9, ax=ax
)

# Inversions
if ${invertX ? 'True' : 'False'}: ax.invert_xaxis()
if ${invertY ? 'True' : 'False'}: ax.invert_yaxis()

# Labels & Title
plt.title("THE ANALYST // SCATTER INTELLIGENCE", pad=30, loc='left', 
          fontdict={'fontsize': 14, 'fontweight': 'black', 'color': '#ffffff'})
plt.xlabel("${labelX.toUpperCase()}", labelpad=20, fontsize=9, fontweight='black')
plt.ylabel("${labelY.toUpperCase()}", labelpad=20, fontsize=9, fontweight='black')

# Annotations (Top 5 names)
for i, row in df.sort_values(by=['x', 'y'], ascending=False).head(5).iterrows():
    ax.text(row['x'], row['y']+0.2, row['name'].upper(), 
            fontsize=7, fontweight='black', color='white', 
            ha='center', va='bottom', alpha=0.7)

# Legend
legend = ax.legend(frameon=True, facecolor='#1a1a1a', edgecolor='#333333', 
                   fontsize=8, borderpad=1, labelcolor='#949494')
plt.setp(legend.get_title(), color='#3cffd0', fontsize=8, fontweight='black')

plt.tight_layout(pad=5)
plt.show()
`;
    const blob = new Blob([pythonScript], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verge_export_${new Date().getTime()}.py`;
    a.click();
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
    placeholder: (base) => ({ ...base, color: 'rgba(255,255,255,0.2)' }),
    valueContainer: (base) => ({
      ...base,
      maxHeight: '100px',
      overflowY: 'auto',
      padding: '2px 8px'
    })
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
    <div className="flex flex-col md:flex-row flex-wrap gap-6 md:gap-8 items-stretch md:items-start p-5 md:p-8 bg-[#2d2d2d] border border-white/5 rounded-[12px] md:rounded-[24px] relative z-[60]">
      {/* X/Y Mapping */}
      <div className="flex flex-col gap-4">
        <span className="verge-label-mono text-[9px] text-[#3cffd0] uppercase">X / Y Mapping</span>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full md:w-[200px]">
            <Select 
              options={metricsList}
              value={metricsList.find(m => m.options?.some(o => o.value === xAxis))?.options?.find(o => o.value === xAxis)}
              onChange={(opt) => setXAxis(opt.value)}
              styles={selectStyles}
            />
          </div>
          <div className="w-full md:w-[200px]">
            <Select 
              options={metricsList}
              value={metricsList.find(m => m.options?.some(o => o.value === yAxis))?.options?.find(o => o.value === yAxis)}
              onChange={(opt) => setYAxis(opt.value)}
              styles={selectStyles}
              isDisabled={isSwarmMode}
            />
          </div>
        </div>
      </div>

      {/* Subject Focus & Labels */}
      <div className="flex flex-col gap-4 min-w-0 md:w-[280px]">
        <div className="flex flex-col">
          <span className="verge-label-mono text-[9px] text-[#3cffd0] mb-2 uppercase">Subject Focus (Highlight)</span>
          <Select 
            isMulti
            options={chartData.map(p => ({ value: p.id, label: p.name }))}
            value={chartData.filter(p => focusedPlayerIds.includes(p.id)).map(p => ({ value: p.id, label: p.name }))}
            onChange={(opts) => setFocusedPlayerIds(opts ? opts.map(o => o.value) : [])}
            styles={selectStyles}
            placeholder="Select focused..."
          />
        </div>
        <div className="flex flex-col">
          <span className="verge-label-mono text-[9px] text-[#3cffd0] mb-2 uppercase">Subject Name (Labels)</span>
          <Select 
            isMulti
            options={chartData.map(p => ({ value: p.id, label: p.name }))}
            value={chartData.filter(p => labeledPlayerIds.includes(p.id)).map(p => ({ value: p.id, label: p.name }))}
            onChange={(opts) => setLabeledPlayerIds(opts ? opts.map(o => o.value) : [])}
            styles={selectStyles}
            placeholder="Display names..."
          />
        </div>
      </div>

      {/* Display Options */}
      <div className="flex flex-col md:border-l border-white/10 md:pl-8 min-w-0">
        <span className="verge-label-mono text-[9px] text-[#3cffd0] mb-2 uppercase">Display Options</span>
        <div className="grid grid-cols-2 gap-x-8">
          <Toggle label="Mean X" checked={showAvgX} onChange={setShowAvgX} />
          <Toggle label="Mean Y" checked={showAvgY} onChange={setShowAvgY} />
          <Toggle label="Quadrant" checked={showQuadrant} onChange={setShowQuadrant} />
          <Toggle label="Invert X" checked={invertX} onChange={setInvertX} />
          <Toggle label="Invert Y" checked={invertY} onChange={setInvertY} />
          <Toggle label="Exclure 0 (X)" checked={excludeZeroX} onChange={setExcludeZeroX} />
          <Toggle label="Exclure 0 (Y)" checked={excludeZeroY} onChange={setExcludeZeroY} />
          <Toggle label="Mode Essaim" checked={isSwarmMode} onChange={setIsSwarmMode} />
        </div>
      </div>

      {/* Action Bar (Presets) */}
      <div className="flex flex-col md:border-l border-white/10 md:pl-8 min-w-[250px]">
        {/* Presets */}
        <div className="flex flex-col flex-1">
          <span className="verge-label-mono text-[9px] text-[#3cffd0] mb-2 uppercase">Presets & Export</span>
          <div className="flex items-center gap-2">
            <select 
              className="flex-1 bg-[#131313] border border-white/10 rounded-[4px] px-3 h-[44px] verge-label-mono text-[9px] text-white outline-none focus:border-[#3cffd0] min-w-[120px]"
              onChange={(e) => {
                const preset = savedPresets.find(p => String(p.id) === e.target.value);
                if (preset && preset.axes_config) { 
                  setXAxis(preset.axes_config.x); 
                  setYAxis(preset.axes_config.y); 
                }
              }}
              value=""
            >
              <option value="" disabled>Load Preset</option>
              {savedPresets.map((p) => (
                <option key={p.id} value={p.id}>{p.profile_name}</option>
              ))}
            </select>
            <button 
              onClick={() => setIsDeleting(!isDeleting)}
              className={`h-[44px] w-[44px] shrink-0 flex items-center justify-center bg-[#131313] border border-white/10 rounded-[4px] transition-all ${isDeleting ? 'text-red-500 border-red-500/50' : 'text-[#949494] hover:text-red-500'}`}
              title="Gérer les presets"
            >
              <Trash2 size={16} />
            </button>
            <button 
              onClick={() => setShowSave(true)}
              className="h-[44px] w-[44px] shrink-0 flex items-center justify-center bg-[#131313] border border-white/10 rounded-[4px] text-[#949494] hover:text-[#3cffd0] hover:border-[#3cffd0] transition-all"
            >
              <Save size={16} />
            </button>
          </div>
          
          {isDeleting && savedPresets.length > 0 && (
            <div className="mt-3 space-y-1">
              {savedPresets.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-black/40 p-2 rounded-[2px] border border-white/5">
                  <span className="verge-label-mono text-[8px] text-white truncate">{p.profile_name}</span>
                  <button onClick={() => handleDelete(p.id)} className="text-[#949494] hover:text-red-500 p-1">
                    <CloseIcon size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Python Export Button - Moved under Presets */}
          <button 
            onClick={handleExportPython}
            className="mt-4 h-[44px] w-full bg-white text-black rounded-[4px] verge-label-mono text-[9px] font-black hover:bg-[#3cffd0] transition-colors flex items-center justify-center gap-2"
          >
            <Activity size={14} /> PYTHON SCRIPT
          </button>
        </div>
      </div>

      {showSave && (
        <div className="absolute top-full left-0 right-0 md:left-auto md:right-8 mt-4 p-6 bg-[#131313] border border-white/20 rounded-[12px] shadow-2xl z-[70] w-full md:w-[250px]">
          <span className="verge-label-mono text-[8px] text-[#3cffd0] mb-3 block">NEW PRESET NAME</span>
          <input 
            type="text" placeholder="..." 
            className="bg-[#2d2d2d] border border-white/10 rounded-[4px] px-3 py-3 verge-label-mono text-[10px] text-white mb-4 block w-full outline-none focus:border-[#3cffd0]"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 bg-[#3cffd0] text-black verge-label-mono text-[9px] font-black py-3 rounded-[4px]">SAVE</button>
            <button onClick={() => setShowSave(false)} className="flex-1 bg-white/5 text-[#949494] verge-label-mono text-[9px] py-3 rounded-[4px]">CANCEL</button>
          </div>
        </div>
      )}
    </div>
  );
};

const ScatterContent = ({ players = [], metricsList = [], onPlayerClick }) => {
  const [xAxis, setXAxis] = useState('minutes_on_field');
  const [yAxis, setYAxis] = useState('note_ponderee');

  const [showAvgX, setShowAvgX] = useState(true);
  const [showAvgY, setShowAvgY] = useState(true);
  const [showQuadrant, setShowQuadrant] = useState(true);
  const [invertX, setInvertX] = useState(false);
  const [invertY, setInvertY] = useState(false);
  const [focusedPlayerIds, setFocusedPlayerIds] = useState([]);
  
  const [excludeZeroX, setExcludeZeroX] = useState(false);
  const [excludeZeroY, setExcludeZeroY] = useState(false);
  const [isSwarmMode, setIsSwarmMode] = useState(false);
  const [labeledPlayerIds, setLabeledPlayerIds] = useState([]);
  
  // État pour les onglets mobiles
  const [activeMobileTab, setActiveMobileTab] = useState('visionnage');

  const chartData = useMemo(() => {
    const rawData = players.map(p => {
      const xVal = p[xAxis];
      const yVal = p[yAxis];
      return {
        x: (xVal !== undefined && xVal !== null) ? Number(String(xVal).replace(',', '.')) || 0 : 0,
        y: (yVal !== undefined && yVal !== null) ? Number(String(yVal).replace(',', '.')) || 0 : 0,
        name: p.name || p.full_name,
        team: p.last_club_name,
        image: p.image,
        id: p.wyId || p.id,
        position_category: p.position_category,
        originalPlayer: p
      };
    });

    if (!isSwarmMode) return rawData;

    // Logique d'Essaim Structuré (Beeswarm)
    // On trie pour traiter les points de gauche à droite
    const sorted = [...rawData].sort((a, b) => a.x - b.x);
    
    // On définit une "largeur de collision" basée sur l'étendue des données
    const xMin = Math.min(...sorted.map(p => p.x));
    const xMax = Math.max(...sorted.map(p => p.x));
    const xRange = xMax - xMin;
    const binWidth = xRange > 0 ? xRange / 60 : 1; // 60 slots sur l'axe X

    const bins = {};
    
    return sorted.map(p => {
      const binIndex = Math.floor(p.x / binWidth);
      if (!bins[binIndex]) bins[binIndex] = 0;
      
      const count = bins[binIndex];
      bins[binIndex]++;

      // Calcul de la position Y : Centre de gravité à 50
      // 0 -> 50
      // 1 -> 50 + 8
      // 2 -> 50 - 8
      // 3 -> 50 + 16...
      const direction = count % 2 === 0 ? 1 : -1;
      const offset = Math.ceil(count / 2) * 9 * direction;
      
      return { ...p, y: 50 + offset };
    });
  }, [players, xAxis, yAxis, isSwarmMode]);

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

  const renderShape = useCallback((props) => (
    <CustomScatterPoint 
      {...props} 
      focusedPlayerIds={focusedPlayerIds} 
      labeledPlayerIds={labeledPlayerIds}
      setFocusedPlayerIds={setFocusedPlayerIds} 
      onPlayerClick={onPlayerClick} 
    />
  ), [focusedPlayerIds, labeledPlayerIds, onPlayerClick]);

  return (
    <div className="flex flex-col h-full space-y-4 md:space-y-8">
      {/* Switch Mobile */}
      <div className="flex md:hidden bg-[#1a1a1a] p-1 rounded-[4px] border border-white/10 mb-2">
        <button 
          onClick={() => setActiveMobileTab('visionnage')}
          className={`flex-1 py-3 verge-label-mono text-[10px] font-black transition-all ${activeMobileTab === 'visionnage' ? 'bg-[#3cffd0] text-black shadow-[0_0_15px_rgba(60,255,208,0.3)]' : 'text-[#949494]'}`}
        >
          Visionnage
        </button>
        <button 
          onClick={() => setActiveMobileTab('parametres')}
          className={`flex-1 py-3 verge-label-mono text-[10px] font-black transition-all ${activeMobileTab === 'parametres' ? 'bg-[#3cffd0] text-black shadow-[0_0_15px_rgba(60,255,208,0.3)]' : 'text-[#949494]'}`}
        >
          Paramètres
        </button>
      </div>

      <div className={`${activeMobileTab === 'parametres' ? 'block' : 'hidden'} md:block`}>
        <ScatterControls 
          metricsList={metricsList}
          xAxis={xAxis} setXAxis={setXAxis}
          yAxis={yAxis} setYAxis={setYAxis}
          playersCount={players.length}
          chartData={chartData}
          showAvgX={showAvgX} setShowAvgX={setShowAvgX}
          showAvgY={showAvgY} setShowAvgY={setShowAvgY}
          showQuadrant={showQuadrant} setShowQuadrant={setShowQuadrant}
          invertX={invertX} setInvertX={setInvertX}
          invertY={invertY} setInvertY={setInvertY}
          excludeZeroX={excludeZeroX} setExcludeZeroX={setExcludeZeroX}
          excludeZeroY={excludeZeroY} setExcludeZeroY={setExcludeZeroY}
          isSwarmMode={isSwarmMode} setIsSwarmMode={setIsSwarmMode}
          focusedPlayerIds={focusedPlayerIds} setFocusedPlayerIds={setFocusedPlayerIds}
          labeledPlayerIds={labeledPlayerIds} setLabeledPlayerIds={setLabeledPlayerIds}
        />
      </div>

      <div className={`${activeMobileTab === 'visionnage' ? 'block' : 'hidden'} md:block space-y-6 md:space-y-8`}>
        <div className="hidden md:flex flex-wrap items-center justify-center gap-x-6 gap-y-3 py-4 border-b border-white/10">
          {Object.entries(ROLE_COLORS).map(([role, color]) => (
            <div key={role} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-[1px]" style={{ backgroundColor: color }} />
              <span className="verge-label-mono text-[8px] text-[#949494] uppercase tracking-wider">{role}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 min-h-[500px] md:min-h-[600px] bg-[#131313] p-4 md:p-10 relative border border-white/10 rounded-[12px] md:rounded-[24px] overflow-hidden">
          {showQuadrant && showAvgX && showAvgY && !isNaN(averages.x) && !isNaN(averages.y) && (
            <div className="absolute top-2 right-2 md:top-10 md:right-10 z-10 w-28 md:w-56 p-2 md:p-6 bg-[#131313]/90 backdrop-blur-md border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
              <div className="verge-label-mono text-[7px] md:text-[9px] text-[#3cffd0] uppercase mb-2 md:mb-4 font-black">Stats</div>
              <div className="space-y-2 md:space-y-4">
                {stats.map(item => (
                  <div key={item.label} className="flex flex-col gap-0.5 md:gap-1">
                    <div className="flex justify-between items-center">
                      <span className={`verge-label-mono text-[6px] md:text-[8px] uppercase font-bold ${item.color}`}>{item.label.split(' ')[0]}</span>
                      <span className="verge-label-mono text-[8px] md:text-[10px] text-white font-black">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ResponsiveContainer width="100%" height={window.innerWidth < 768 ? 450 : 600}>
            <ScatterChart margin={{ top: 20, right: 10, bottom: 40, left: 0 }}>
              <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.05)" vertical horizontal />
              <XAxis 
                type="number" dataKey="x" name={xAxis} 
                reversed={invertX}
                stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'PolySans Mono' }} 
                axisLine tickLine={false} domain={excludeZeroX ? ['dataMin', 'dataMax'] : [0, 'auto']}
              >
                <Label value={xAxis.replace(/_/g, ' ').toUpperCase()} offset={-25} position="insideBottom" fill="#3cffd0" fontSize={8} fontFamily="PolySans Mono" fontWeight="900" />
              </XAxis>
              <YAxis 
                type="number" dataKey="y" name={isSwarmMode ? "Distribution" : yAxis} 
                reversed={invertY}
                stroke="rgba(255,255,255,0.2)" tick={{ fill: isSwarmMode ? 'transparent' : 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'PolySans Mono' }} 
                axisLine={!isSwarmMode} tickLine={false} domain={isSwarmMode ? [0, 100] : (excludeZeroY ? ['dataMin', 'dataMax'] : [0, 'auto'])}
              >
                <Label value={isSwarmMode ? "DENSITÉ (ESSAIM)" : yAxis.replace(/_/g, ' ').toUpperCase()} angle={-90} offset={10} position="insideLeft" fill="#3cffd0" fontSize={8} fontFamily="PolySans Mono" fontWeight="900" />
              </YAxis>
              <ZAxis type="number" range={[60, 60]} />
              <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '4 4', stroke: '#3cffd0', strokeWidth: 1 }} />
              
              {showQuadrant && showAvgX && showAvgY && !isNaN(averages.x) && !isNaN(averages.y) && (
                <>
                  <ReferenceArea x1={averages.x} y1={averages.y} fill="rgba(60, 255, 208, 0.03)" stroke="none" />
                  <ReferenceArea x2={averages.x} y2={averages.y} fill="rgba(239, 68, 68, 0.03)" stroke="none" />
                </>
              )}

              {showAvgX && !isNaN(averages.x) && (
                <ReferenceLine x={averages.x} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
              )}
              {showAvgY && !isNaN(averages.y) && (
                <ReferenceLine y={averages.y} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
              )}

              <Scatter 
                name="Players" 
                data={chartData} 
                shape={renderShape}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.position_category] || ROLE_COLORS['Autres']} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ScatterContent;
