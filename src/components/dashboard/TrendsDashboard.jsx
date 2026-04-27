import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Area, AreaChart 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Plus, X, Search, Activity, Calendar, UserPlus, ChevronDown, Check, Star, Target, BarChart, Settings, ArrowUpRight } from 'lucide-react';
import GlobalPlayerSearch from './GlobalPlayerSearch';
import { normalizeString } from '../../utils/stringUtils';

const COLORS = ['#3cffd0', '#5200ff', '#ffffff', '#949494', '#3860be', '#309875', '#3d00bf', '#c2c2c2'];

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
    return m ? m.label : 'IMPACT SCORE';
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
    <div className="flex flex-col gap-8 min-h-screen pb-20">
      {/* Header & Search */}
      <div className="relative z-50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 bg-surface-slate p-8 border border-hazard-white/5 rounded-[4px]">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-jelly-mint rounded-[2px] shadow-[0_0_20px_rgba(60,255,208,0.3)]">
            <TrendingUp size={24} className="text-absolute-black" />
          </div>
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-hazard-white leading-none">Market <span className="text-jelly-mint">Trends</span></h2>
            <p className="verge-label-mono text-[9px] text-jelly-mint tracking-[0.3em] font-black mt-2">ANALYSE COMPARATIVE DES TRAJECTOIRES</p>
          </div>
        </div>

        <div className="w-full xl:w-[500px]">
          <GlobalPlayerSearch onPlayerSelect={addPlayer} placeholder="RECHERCHER UN JOUEUR..." />
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-canvas-black border border-hazard-white/10 p-10 rounded-[4px] relative overflow-hidden">
        {/* Technical Hazard Corner */}
        <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-jelly-mint/20" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMetricMenuOpen(!isMetricMenuOpen)}
              className="flex items-center gap-5 bg-surface-slate border border-hazard-white/10 rounded-[2px] px-6 py-4 hover:border-jelly-mint/50 transition-all min-w-[340px]"
            >
              <BarChart size={18} className="text-jelly-mint" />
              <div className="flex-1 text-left">
                <p className="verge-label-mono text-[8px] text-jelly-mint tracking-[0.2em] font-black mb-1">MÉTRIQUE ACTIVE</p>
                <p className="text-sm font-black text-hazard-white uppercase truncate tracking-tight">{currentMetricLabel}</p>
              </div>
              <ChevronDown size={18} className={`text-secondary-text transition-transform ${isMetricMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isMetricMenuOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-3 w-[400px] max-h-[500px] bg-surface-slate border border-jelly-mint/30 rounded-[2px] shadow-[0_30px_90px_rgba(0,0,0,0.8)] z-50 flex flex-col overflow-hidden"
                >
                  <div className="p-5 border-b border-hazard-white/10 bg-canvas-black">
                    <div className="relative">
                      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
                      <input autoFocus placeholder="RECHERCHER UNE MÉTRIQUE..." className="w-full bg-surface-slate border border-hazard-white/10 rounded-[1px] py-3 pl-11 pr-4 text-[10px] verge-label-mono text-hazard-white outline-none focus:border-jelly-mint transition-all" value={metricSearch} onChange={(e) => setMetricSearch(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 styled-scrollbar">
                    {filteredMetrics.map((group, gIdx) => (
                      <div key={group.label || gIdx} className="mb-6 last:mb-0">
                        <div className="px-3 py-2 verge-label-mono text-[9px] text-jelly-mint tracking-[0.3em] font-black mb-2 flex items-center gap-2 border-l-2 border-jelly-mint">{group.label}</div>
                        {group.options.map(m => (
                          <button key={m.value} onClick={() => { setSelectedMetric(m.value); setIsMetricMenuOpen(false); }}
                            className={`w-full text-left px-4 py-3 rounded-[1px] text-[11px] font-black verge-label-mono flex items-center justify-between transition-all mb-1 ${selectedMetric === m.value ? 'bg-jelly-mint text-absolute-black shadow-[0_0_20px_rgba(60,255,208,0.2)]' : 'text-secondary-text hover:bg-hazard-white/5 hover:text-hazard-white'}`}
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

          <div className="flex flex-wrap gap-3">
            <AnimatePresence>
              {selectedPlayers.map((p, idx) => (
                <motion.div key={p.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-3 bg-surface-slate border border-hazard-white/10 rounded-[2px] px-3 py-2"
                >
                  <div className="w-6 h-6 rounded-full border-2 overflow-hidden" style={{ borderColor: COLORS[idx % COLORS.length] }}>
                    {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-canvas-black flex items-center justify-center text-[8px] font-black text-hazard-white">{p.name.charAt(0)}</div>}
                  </div>
                  <span className="verge-label-mono text-[10px] font-black text-hazard-white truncate max-w-[100px] uppercase">{p.name}</span>
                  <button onClick={() => removePlayer(p.id)} className="text-secondary-text hover:text-[#f43f5e] transition-colors"><X size={14} /></button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="h-[550px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="season" axisLine={false} tickLine={false} tick={{ fill: '#949494', fontSize: 10, fontWeight: 900, fontFamily: 'PolySans Mono' }} dy={15} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#949494', fontSize: 10, fontFamily: 'PolySans Mono' }} width={45} />
              <Tooltip 
                cursor={{ stroke: '#3cffd0', strokeWidth: 1 }}
                contentStyle={{ backgroundColor: '#131313', border: '1px solid #3cffd0', borderRadius: '2px', padding: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                itemStyle={{ fontSize: '11px', fontWeight: '900', fontFamily: 'PolySans Mono', textTransform: 'uppercase' }}
                labelStyle={{ color: '#3cffd0', fontSize: '9px', fontWeight: '900', fontFamily: 'PolySans Mono', marginBottom: '10px', tracking: '0.2em' }}
                formatter={(value) => value !== null ? Number(value).toFixed(2) : '—'}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '40px', fontSize: '9px', textTransform: 'uppercase', fontWeight: '900', fontFamily: 'PolySans Mono', letterSpacing: '0.2em' }} />
              {selectedPlayers.map((p, idx) => (
                <Line key={p.id} name={p.name.toUpperCase()} type="monotone" dataKey={`player_${p.id}`} stroke={COLORS[idx % COLORS.length]} strokeWidth={4} dot={{ r: 4, fill: '#131313', strokeWidth: 2, stroke: COLORS[idx % COLORS.length] }} activeDot={{ r: 6, strokeWidth: 0, fill: COLORS[idx % COLORS.length] }} animationDuration={1000} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <div className="bg-surface-slate border border-jelly-mint/30 rounded-[4px] p-8 text-hazard-white relative overflow-hidden group">
            {/* Corner Hazard */}
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-jelly-mint opacity-40" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-jelly-mint flex items-center justify-center rounded-[2px] shadow-[0_0_15px_rgba(60,255,208,0.3)]">
                  <Activity size={24} className="text-absolute-black" />
                </div>
                <h4 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Analyse de <span className="text-jelly-mint">Momentum</span></h4>
              </div>
              <p className="verge-label-mono text-[10px] text-secondary-text leading-relaxed font-black uppercase tracking-wider mb-10 opacity-70">
                Détectez les ruptures de croissance, les cycles de méforme ou les accélérations de carrière grâce à la corrélation temporelle des trajectoires de performance.
              </p>
              <div className="flex items-center gap-3 verge-label-mono text-[9px] font-black text-jelly-mint tracking-[0.2em] uppercase">
                <ArrowUpRight size={16} /> Synchronisation multi-joueurs active
              </div>
            </div>
         </div>

         <div className="lg:col-span-2 bg-surface-slate border border-hazard-white/5 rounded-[4px] p-8 relative">
            <h4 className="verge-label-mono text-[10px] font-black uppercase tracking-[0.3em] text-jelly-mint mb-8 flex items-center gap-3">
              <Calendar size={14} /> Highlights de performance par joueur
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedPlayers.length === 0 ? (
                <div className="col-span-full py-12 text-center opacity-30 verge-label-mono text-[10px] font-black uppercase tracking-[0.4em]">EN ATTENTE DE SÉLECTION...</div>
              ) : (
                selectedPlayers.map((p, idx) => {
                  const data = allTrendsData[p.id] || [];
                  const last = data[data.length - 1];
                  const val = last ? (last[selectedMetric] !== undefined ? last[selectedMetric] : (last.metrics ? last.metrics[selectedMetric] : null)) : null;
                  
                  return (
                    <div key={p.id} className="flex items-center justify-between p-5 rounded-[2px] bg-canvas-black border border-hazard-white/5 hover:border-jelly-mint/40 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <div className="flex flex-col">
                          <span className="verge-label-mono text-[11px] font-black text-hazard-white truncate max-w-[120px] uppercase">{p.name}</span>
                          <span className="verge-label-mono text-[8px] text-secondary-text font-black tracking-[0.1em]">{last?.season || '—'}</span>
                        </div>
                      </div>
                      <div className="text-lg font-black text-jelly-mint font-mono group-hover:scale-110 transition-transform">
                        {val !== null ? Number(val).toFixed(2) : '—'}
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
