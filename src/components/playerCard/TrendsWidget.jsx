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
    <div className="bg-[#131313] border border-white/10 rounded-[4px] p-6 hover:border-[#3cffd0] transition-all group">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp size={14} className="text-[#3cffd0]" />
          <span className="verge-label-mono text-[9px] uppercase tracking-widest text-[#949494]">Évolution</span>
        </div>
        <ArrowRight size={12} className="text-[#949494] group-hover:text-[#3cffd0] transition-colors" />
      </div>

      <div className="h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <Area 
              type="monotone" 
              dataKey="note_ponderee" 
              stroke="#3cffd0" 
              strokeWidth={2} 
              fill="transparent" 
              dot={{ r: 3, fill: '#3cffd0', strokeWidth: 0 }}
            />
            <XAxis dataKey="season" hide />
            <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-between items-end border-t border-white/5 pt-4">
        <div>
          <p className="verge-label-mono text-[8px] text-[#949494] uppercase tracking-tighter">Progression</p>
          <p className="verge-label-mono text-[10px] font-black text-white uppercase italic">HISTORIQUE</p>
        </div>
        <div className="text-right">
          <span className="verge-label-mono text-2xl font-black text-white">
            {Math.round(data[data.length-1]?.note_ponderee || 0)}
          </span>
          <span className="verge-label-mono text-[8px] font-black text-[#3cffd0] ml-2">PTS</span>
        </div>
      </div>
    </div>
  );
};

export default TrendsWidget;
