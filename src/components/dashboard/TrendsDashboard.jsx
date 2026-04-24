import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Area, AreaChart 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Plus, X, Search, Activity, Calendar, UserPlus, ChevronDown, Check, Star, Target, BarChart, Settings, ArrowUpRight } from 'lucide-react';
import GlobalPlayerSearch from './GlobalPlayerSearch';
import { normalizeString } from '../../utils/stringUtils';

const COLORS = ['#38bdf8', '#f43f5e', '#22d3ee', '#a78bfa', '#f59e0b', '#4ade80', '#ec4899', '#8b5cf6'];

const TrendsDashboard = ({ metricsList = [] }) => {
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [allTrendsData, setAllTrendsData] = useState({});
  const [loading, setLoading] = useState({});
  const [selectedMetric, setSelectedMetric] = useState('note_ponderee');
  const [isMetricMenuOpen, setIsMetricMenuOpen] = useState(false);
  const [metricSearch, setMetricSearch] = useState('');
  const menuRef = useRef(null);

  const flatMetrics = useMemo(() => {
    const flat = [];
    metricsList.forEach(group => {
      if (group.options) group.options.forEach(opt => flat.push({ ...opt, category: group.label }));
      else flat.push(group);
    });
    return flat;
  }, [metricsList]);

  const filteredMetrics = useMemo(() => {
    if (!metricSearch) return metricsList;
    const search = normalizeString(metricSearch);
    return metricsList.map(group => {
      if (!group.options) return null;
      const matching = group.options.filter(opt => 
        normalizeString(opt.label || '').includes(search) || 
        normalizeString(opt.value || '').includes(search)
      );
      return matching.length === 0 ? null : { ...group, options: matching };
    }).filter(Boolean);
  }, [metricsList, metricSearch]);

  const currentMetricLabel = useMemo(() => {
    const m = flatMetrics.find(m => m.value === selectedMetric);
    return m ? m.label : 'Impact Score';
  }, [selectedMetric, flatMetrics]);

  const addPlayer = async (player) => {
    if (selectedPlayers.find(p => p.id === player.id)) return;
    if (selectedPlayers.length >= 8) return;
    setSelectedPlayers(prev => [...prev, player]);
    setLoading(prev => ({ ...prev, [player.id]: true }));
    try {
      const res = await fetch(`https://api-scouting.theanalyst.cloud/api/players/${player.id}/trends`);
      const data = await res.json();
      setAllTrendsData(prev => ({ ...prev, [player.id]: data }));
    } catch (err) { console.error("Error fetching trends:", err); } finally { setLoading(prev => ({ ...prev, [player.id]: false })); }
  };

  const removePlayer = (playerId) => {
    setSelectedPlayers(prev => prev.filter(p => p.id !== playerId));
    setAllTrendsData(prev => {
      const newData = { ...prev };
      delete newData[playerId];
      return newData;
    });
  };

  const combinedData = useMemo(() => {
    const seasonsMap = {};
    selectedPlayers.forEach(player => {
      const data = allTrendsData[player.id] || [];
      data.forEach(d => {
        if (!seasonsMap[d.season]) seasonsMap[d.season] = { season: d.season };
        const val = d[selectedMetric] !== undefined ? d[selectedMetric] : (d.metrics ? d.metrics[selectedMetric] : null);
        seasonsMap[d.season][`player_${player.id}`] = val;
      });
    });
    return Object.values(seasonsMap).sort((a, b) => a.season.localeCompare(b.season));
  }, [allTrendsData, selectedMetric, selectedPlayers]);

  useEffect(() => {
    const handleClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setIsMetricMenuOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="flex flex-col gap-6 min-h-screen pb-12">
      {/* Header & Search - Elevate z-index for search results */}
      <div className="relative z-50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
            <TrendingUp size={24} className="text-sky-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Market <span className="text-sky-400">Trends</span></h2>
            <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-0.5">Analyse comparative des trajectoires</p>
          </div>
        </div>

        <div className="w-full xl:w-[500px]">
          <GlobalPlayerSearch onPlayerSelect={addPlayer} placeholder="Rechercher un joueur (ex: Mbappe, Haaland...)" />
        </div>
      </div>

      {/* Main Chart Section - 100% WIDTH */}
      <div className="bg-slate-900/40 rounded-[2.5rem] border border-white/5 p-8 backdrop-blur-2xl relative overflow-hidden shadow-3xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMetricMenuOpen(!isMetricMenuOpen)}
              className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 hover:bg-white/10 transition-all min-w-[320px]"
            >
              <BarChart size={16} className="text-sky-400" />
              <div className="flex-1 text-left">
                <p className="text-[8px] text-sky-400 font-black uppercase tracking-[0.2em] mb-0.5">Métrique active</p>
                <p className="text-xs font-black text-white uppercase truncate">{currentMetricLabel}</p>
              </div>
              <ChevronDown size={16} className={`text-white/20 transition-transform ${isMetricMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isMetricMenuOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-3 w-[380px] max-h-[500px] bg-slate-900/98 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-3xl z-50 flex flex-col overflow-hidden"
                >
                  <div className="p-4 border-b border-white/5">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input autoFocus placeholder="Chercher une métrique..." className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white outline-none focus:border-sky-500/30 transition-all" value={metricSearch} onChange={(e) => setMetricSearch(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 styled-scrollbar">
                    {filteredMetrics.map((group, gIdx) => (
                      <div key={group.label || gIdx} className="mb-4 last:mb-0">
                        <div className="px-3 py-2 text-[10px] font-black text-sky-400 uppercase tracking-widest flex items-center gap-2"><Star size={10} /> {group.label}</div>
                        {group.options.map(m => (
                          <button key={m.value} onClick={() => { setSelectedMetric(m.value); setIsMetricMenuOpen(false); }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${selectedMetric === m.value ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                          >
                            {m.label}
                            {selectedMetric === m.value && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {selectedPlayers.map((p, idx) => (
                <motion.div key={p.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-2 py-1.5"
                >
                  <div className="w-5 h-5 rounded-full border overflow-hidden" style={{ borderColor: COLORS[idx % COLORS.length] }}>
                    {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[7px] font-black">{p.name.charAt(0)}</div>}
                  </div>
                  <span className="text-[10px] font-bold text-white truncate max-w-[80px]">{p.name}</span>
                  <button onClick={() => removePlayer(p.id)} className="text-white/20 hover:text-red-400 transition-colors"><X size={10} /></button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="h-[550px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="season" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700 }} dy={15} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} width={45} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', backdropFilter: 'blur(20px)', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8)', padding: '16px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ color: '#38bdf8', fontSize: '10px', fontWeight: '900', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                formatter={(value) => value !== null ? Number(value).toFixed(2) : 'N/A'}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.1em' }} />
              {selectedPlayers.map((p, idx) => (
                <Line key={p.id} name={p.name} type="monotone" dataKey={`player_${p.id}`} stroke={COLORS[idx % COLORS.length]} strokeWidth={4} dot={{ r: 5, fill: '#0f172a', strokeWidth: 2, stroke: COLORS[idx % COLORS.length] }} activeDot={{ r: 8, strokeWidth: 0, fill: COLORS[idx % COLORS.length] }} animationDuration={2000} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Info Cards - BELOW THE CHART */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <div className="bg-gradient-to-br from-sky-500 to-indigo-600 rounded-[2rem] p-6 text-white shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <h4 className="text-lg font-black uppercase tracking-tighter italic">Analyse de Momentum</h4>
              </div>
              <p className="text-xs text-white/80 leading-relaxed font-medium">
                Détectez les ruptures de croissance, les cycles de méforme ou les accélérations de carrière grâce à la corrélation temporelle.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-60">
              <ArrowUpRight size={14} /> Synchronisation Multi-joueurs active
            </div>
         </div>

         <div className="lg:col-span-2 bg-white/5 border border-white/5 rounded-[2rem] p-6 backdrop-blur-md">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-400 mb-6 flex items-center gap-2">
              <Calendar size={12} /> Highlights de performance par joueur
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedPlayers.length === 0 ? (
                <div className="col-span-full py-8 text-center opacity-20 text-[10px] font-black uppercase tracking-[0.2em]">En attente de sélection...</div>
              ) : (
                selectedPlayers.map((p, idx) => {
                  const data = allTrendsData[p.id] || [];
                  const last = data[data.length - 1];
                  const val = last ? (last[selectedMetric] !== undefined ? last[selectedMetric] : (last.metrics ? last.metrics[selectedMetric] : null)) : null;
                  
                  return (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-500/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-white truncate max-w-[120px]">{p.name}</span>
                          <span className="text-[8px] text-white/30 font-bold uppercase">{last?.season || '—'}</span>
                        </div>
                      </div>
                      <div className="text-sm font-black text-sky-400 font-mono">
                        {val !== null ? Number(val).toFixed(2) : 'N/A'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default TrendsDashboard;
