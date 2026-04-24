import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Area, AreaChart, Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Activity, Calendar, BarChart, ChevronDown, Search, Check, Star } from 'lucide-react';

const PlayerTrends = ({ player, metricsList = [] }) => {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('note_ponderee');
  const [isMetricMenuOpen, setIsMetricMenuOpen] = useState(false);
  const [metricSearch, setMetricSearch] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    if (!player?.id) return;
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://api-scouting.theanalyst.cloud/api/players/${player.id}/trends`);
        if (!response.ok) throw new Error('Failed to fetch trend data');
        const data = await response.json();
        setTrendData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [player?.id]);

  // Helper pour extraire toutes les métriques à plat
  const flatMetrics = useMemo(() => {
    const flat = [];
    metricsList.forEach(group => {
      if (group.options) {
        group.options.forEach(opt => flat.push({ ...opt, category: group.label }));
      } else {
        flat.push(group);
      }
    });
    return flat;
  }, [metricsList]);

  // Métriques filtrées pour la recherche
  const filteredMetrics = useMemo(() => {
    if (!metricSearch) return metricsList;
    const search = metricSearch.toLowerCase();
    
    return metricsList.map(group => {
      if (!group.options) return null;
      const matching = group.options.filter(opt => 
        (opt.label || '').toLowerCase().includes(search) || 
        (opt.value || '').toLowerCase().includes(search)
      );
      if (matching.length === 0) return null;
      return { ...group, options: matching };
    }).filter(Boolean);
  }, [metricsList, metricSearch]);

  const currentMetricLabel = useMemo(() => {
    const m = flatMetrics.find(m => m.value === selectedMetric);
    return m ? m.label : 'Impact Score';
  }, [selectedMetric, flatMetrics]);

  const chartData = useMemo(() => {
    return trendData.map(d => {
      const val = d[selectedMetric] !== undefined ? d[selectedMetric] : (d.metrics ? d.metrics[selectedMetric] : null);
      return { ...d, displayValue: val };
    });
  }, [trendData, selectedMetric]);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsMetricMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-white/10 animate-pulse">
      <Activity className="text-sky-400 animate-spin mb-4" size={32} />
      <span className="text-[10px] uppercase tracking-widest text-white/40">Génération du flux...</span>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-500/20 border border-sky-500/30">
            <TrendingUp size={20} className="text-sky-400" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-white leading-none">Évolution <span className="text-sky-400">Temporelle</span></h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-2 mt-1">
               <Calendar size={10} /> {trendData.length} Saisons analysées
            </p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMetricMenuOpen(!isMetricMenuOpen)}
            className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-2 hover:bg-white/10 transition-all min-w-[240px]"
          >
            <BarChart size={14} className="text-sky-400" />
            <div className="flex-1 text-left">
              <p className="text-[8px] text-sky-400 font-black uppercase tracking-widest leading-none mb-1">Métrique</p>
              <p className="text-[11px] font-black text-white uppercase truncate max-w-[150px]">{currentMetricLabel}</p>
            </div>
            <ChevronDown size={14} className={`text-white/20 transition-transform ${isMetricMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isMetricMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 mt-2 w-[280px] max-h-[350px] bg-slate-900/98 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-3xl z-50 flex flex-col overflow-hidden"
              >
                <div className="p-3 border-b border-white/5">
                  <div className="relative">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <input 
                      autoFocus
                      placeholder="Rechercher..."
                      className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 pl-8 pr-3 text-[10px] text-white outline-none"
                      value={metricSearch}
                      onChange={(e) => setMetricSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-1.5 styled-scrollbar">
                  {filteredMetrics.map((group, gIdx) => (
                    <div key={group.label || gIdx} className="mb-2 last:mb-0">
                      <div className="px-2 py-1 text-[8px] font-black text-sky-400 uppercase tracking-widest">{group.label}</div>
                      {group.options.map(m => (
                        <button
                          key={m.value}
                          onClick={() => {
                            setSelectedMetric(m.value);
                            setIsMetricMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold flex items-center justify-between ${selectedMetric === m.value ? 'bg-sky-500 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                        >
                          {m.label}
                          {selectedMetric === m.value && <Check size={12} />}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative h-[450px] w-full bg-slate-900/40 rounded-3xl border border-white/5 p-6 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorMetricPlayer" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="season" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600 }} dy={15} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} width={40} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
              itemStyle={{ color: '#38bdf8', fontSize: '12px', fontWeight: 'bold' }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}
              formatter={(value) => value !== null ? Number(value).toFixed(2) : 'N/A'}
            />
            <Area type="monotone" dataKey="displayValue" stroke="#38bdf8" strokeWidth={4} fillOpacity={1} fill="url(#colorMetricPlayer)" animationDuration={1500} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {chartData.slice(-3).reverse().map((s, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-[8px] font-black text-sky-400">{s.season.split('/')[1] || s.season}</div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase text-white/40 font-bold mb-0.5">{s.season}</span>
                <span className="text-[11px] font-black text-white truncate max-w-[80px]">{s.last_club_name || 'Équipe'}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-white font-mono">{s.displayValue !== null ? Number(s.displayValue).toFixed(2) : 'N/A'}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PlayerTrends;
