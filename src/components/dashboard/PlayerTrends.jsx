import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Activity, Calendar, BarChart, ChevronDown, Search, Check } from 'lucide-react';

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
    <div className="h-64 flex flex-col items-center justify-center bg-[#131313] border border-white/10 rounded-[4px] animate-pulse">
      <Activity className="text-[#3cffd0] animate-spin mb-4" size={32} />
      <span className="verge-label-mono text-[9px] uppercase tracking-widest text-[#949494]">Initialisation...</span>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-2">
        <div className="flex items-center gap-5">
          <div className="w-1.5 h-6 bg-[#3cffd0]"></div>
          <div>
            <h3 className="verge-label-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#3cffd0] leading-none">Évolution Temporelle</h3>
            <p className="verge-label-mono text-[8px] text-[#949494] uppercase tracking-widest flex items-center gap-2 mt-2">
               <Calendar size={10} /> {trendData.length} Saisons analysées
            </p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMetricMenuOpen(!isMetricMenuOpen)}
            className="flex items-center gap-6 bg-[#2d2d2d] border border-white/10 rounded-[4px] px-5 py-3 hover:border-[#3cffd0] transition-all min-w-[260px]"
          >
            <BarChart size={14} className="text-[#3cffd0]" />
            <div className="flex-1 text-left">
              <p className="verge-label-mono text-[8px] text-[#949494] uppercase tracking-widest leading-none mb-1.5">Métrique</p>
              <p className="verge-label-mono text-[10px] font-black text-white uppercase truncate">{currentMetricLabel}</p>
            </div>
            <ChevronDown size={14} className={`text-[#949494] transition-transform ${isMetricMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isMetricMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                className="absolute top-full right-0 mt-2 w-[300px] max-h-[400px] bg-[#131313] border border-white/10 rounded-[4px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 flex flex-col overflow-hidden"
              >
                <div className="p-4 border-b border-white/10">
                  <div className="relative">
                    <Search size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#949494]" />
                    <input 
                      autoFocus
                      placeholder="RECHERCHER..."
                      className="w-full bg-[#2d2d2d] border border-white/10 rounded-[4px] py-2.5 pl-10 pr-4 verge-label-mono text-[9px] text-white outline-none focus:border-[#3cffd0]"
                      value={metricSearch}
                      onChange={(e) => setMetricSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 styled-scrollbar">
                  {filteredMetrics.map((group, gIdx) => (
                    <div key={group.label || gIdx} className="mb-4 last:mb-0">
                      <div className="px-3 py-1.5 verge-label-mono text-[7px] font-black text-[#3cffd0] uppercase tracking-[0.2em]">{group.label}</div>
                      {group.options.map(m => (
                        <button
                          key={m.value}
                          onClick={() => {
                            setSelectedMetric(m.value);
                            setIsMetricMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-[2px] verge-label-mono text-[9px] font-black flex items-center justify-between uppercase transition-all ${selectedMetric === m.value ? 'bg-[#3cffd0] text-black' : 'text-[#949494] hover:bg-[#2d2d2d] hover:text-white'}`}
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

      <div className="relative h-[480px] w-full bg-[#131313] border border-white/10 p-10 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="season" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#949494', fontSize: 9, fontWeight: 900, fontFamily: 'PolySans Mono' }} 
              dy={20} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#949494', fontSize: 9, fontFamily: 'PolySans Mono' }} 
              width={40} 
            />
            <Tooltip 
              cursor={{ stroke: '#3cffd0', strokeWidth: 1 }}
              contentStyle={{ backgroundColor: '#131313', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '12px' }}
              itemStyle={{ color: '#3cffd0', fontSize: '10px', fontWeight: '900', fontFamily: 'PolySans Mono', textTransform: 'uppercase' }}
              labelStyle={{ color: '#949494', fontSize: '8px', marginBottom: '8px', fontFamily: 'PolySans Mono', textTransform: 'uppercase' }}
              formatter={(value) => value !== null ? Number(value).toFixed(2) : 'N/A'}
            />
            <Area 
              type="monotone" 
              dataKey="displayValue" 
              stroke="#3cffd0" 
              strokeWidth={3} 
              fillOpacity={0.1} 
              fill="#3cffd0" 
              animationDuration={1500} 
              dot={{ r: 4, fill: '#131313', stroke: '#3cffd0', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#3cffd0', stroke: '#131313', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {chartData.slice(-3).reverse().map((s, i) => (
          <div key={i} className="bg-[#2d2d2d] border border-white/5 rounded-[4px] p-6 flex flex-col justify-between group hover:border-[#3cffd0] transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="verge-label-mono text-[9px] font-black text-[#3cffd0] uppercase tracking-widest">
                {s.season}
              </div>
              <div className="verge-label-mono text-2xl font-black text-white leading-none">
                {s.displayValue !== null ? Number(s.displayValue).toFixed(1) : '—'}
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="verge-label-mono text-[10px] font-black text-white truncate uppercase">
                {s.last_club_name || ''}
              </div>
              <div className="verge-label-mono text-[8px] font-black text-[#949494] truncate uppercase tracking-widest">
                {s.competition}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PlayerTrends;
