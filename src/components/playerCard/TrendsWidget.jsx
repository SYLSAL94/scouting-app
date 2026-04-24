import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const TrendsWidget = ({ player }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!player?.id) return;
    fetch(`https://api-scouting.theanalyst.cloud/api/players/${player.id}/trends`)
      .then(res => res.json())
      .then(d => {
        setData(d.slice(-5)); // On ne garde que les 5 dernières saisons pour le widget
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [player?.id]);

  if (loading || data.length === 0) return null;

  return (
    <div className="bg-slate-800/40 border border-white/5 rounded-3xl p-5 backdrop-blur-xl hover:border-sky-500/30 transition-all group">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-sky-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Aperçu Évolution</span>
        </div>
        <ArrowRight size={12} className="text-white/20 group-hover:text-sky-400 transition-colors" />
      </div>

      <div className="h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="widgetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="note_ponderee" 
              stroke="#38bdf8" 
              strokeWidth={2} 
              fill="url(#widgetGradient)" 
              dot={{ r: 2, fill: '#38bdf8' }}
            />
            <XAxis dataKey="season" hide />
            <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex justify-between items-end">
        <div>
          <p className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Progression</p>
          <p className="text-xs font-black text-white italic">Dernières Saisons</p>
        </div>
        <div className="text-right">
          <span className="text-xl font-black text-white font-mono">
            {Math.round(data[data.length-1]?.note_ponderee || 0)}
          </span>
          <span className="text-[8px] font-bold text-sky-400 ml-1">PTS</span>
        </div>
      </div>
    </div>
  );
};

export default TrendsWidget;
