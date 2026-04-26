import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, BarChart2, TrendingUp, Activity, Users, Shield, Zap, Film } from 'lucide-react';

const PathCard = ({ icon, title, desc, onClick, large }) => (
  <motion.div
    whileHover={{ y: -5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`group relative p-8 md:p-12 bg-[#2d2d2d] border border-white/5 hover:border-[#3cffd0]/30 transition-all duration-300 cursor-pointer overflow-hidden rounded-[4px] ${large ? 'lg:col-span-2' : ''}`}
  >
    {/* Hazard Corner */}
    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#3cffd0]/0 group-hover:border-[#3cffd0]/40 transition-all" />
    
    <div className="relative z-10">
      <div className="w-12 h-12 bg-[#131313] border border-white/10 flex items-center justify-center mb-10 group-hover:border-[#3cffd0] transition-colors rounded-[2px]">
        {React.cloneElement(icon, { size: 22, className: "text-[#949494] group-hover:text-[#3cffd0] transition-colors" })}
      </div>
      
      <div className="flex justify-between items-end gap-6">
        <div className="flex-1">
          <h3 className="text-3xl md:text-4xl font-black text-white uppercase leading-none mb-4 tracking-tighter group-hover:text-[#3cffd0] transition-colors">{title}</h3>
          <p className="verge-label-mono text-[10px] text-[#949494] leading-relaxed max-w-[280px] lowercase italic opacity-60">{desc}</p>
        </div>
        <div className="shrink-0 text-[#949494] group-hover:text-[#3cffd0] group-hover:translate-x-2 transition-all">
          <ArrowRight size={28} strokeWidth={1} />
        </div>
      </div>
    </div>
  </motion.div>
);

const ExplorationPath = ({ onSelectPath, onBack }) => {
  const [activeTab, setActiveTab] = useState('analysis');

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen bg-[#131313] p-8 md:p-16 lg:p-24 flex flex-col items-center relative overflow-hidden"
    >
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="relative z-10 w-full max-w-7xl">
        <button 
          onClick={onBack} 
          className="group flex items-center gap-3 verge-label-mono text-[10px] text-[#949494] hover:text-[#3cffd0] transition-colors mb-16"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          BACK TO WELCOME
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-1.5 bg-[#3cffd0]" />
          <div className="verge-label-mono text-[10px] text-[#3cffd0] tracking-[0.3em] font-black uppercase">
            Intelligence Hub v2.3
          </div>
        </div>
        
        <h1 className="text-7xl md:text-8xl lg:text-[120px] font-black text-white uppercase leading-[0.8] tracking-tighter mb-20 max-w-4xl">
          Next-gen <span className="text-[#3cffd0]">Exploration</span> Hub
        </h1>
        
        {/* Tabs Selector - Editorial Style */}
        <div className="flex flex-wrap gap-4 mb-20 border-b border-white/5 pb-8">
          {[
            { id: 'analysis', label: 'Analysis', tag: 'Core' },
            { id: 'comparisons', label: 'Comparisons', tag: 'Match-up' },
            { id: 'experimental', label: 'Experimental', tag: 'Beta' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex items-center gap-3 px-8 py-4 verge-label-mono text-[11px] font-black tracking-widest transition-all rounded-[2px] border ${
                activeTab === tab.id 
                ? 'bg-[#3cffd0] text-black border-[#3cffd0] shadow-[0_0_30px_rgba(60,255,208,0.2)]' 
                : 'bg-[#2d2d2d] text-[#949494] border-white/5 hover:border-white/20'
              }`}
            >
              {tab.label}
              <span className={`text-[8px] px-1.5 py-0.5 rounded-[2px] ${activeTab === tab.id ? 'bg-black text-[#3cffd0]' : 'bg-white/10 text-[#949494]'}`}>
                {tab.tag}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {activeTab === 'analysis' && (
              <>
                <PathCard 
                  icon={<BarChart2 />} title="Global Rankings" 
                  desc="Comprehensive leaderboards powered by enriched performance metrics." 
                  onClick={() => onSelectPath('DASHBOARD')}
                />
                <PathCard 
                  icon={<TrendingUp />} title="Trends Evolution" 
                  desc="Track historical performance and market value across multiple seasons." 
                  onClick={() => onSelectPath('TRENDS')}
                />
                <PathCard 
                  icon={<Activity />} title="Scatter Analysis" 
                  desc="Correlate metrics (Age vs Impact) to find outliers and undervalued talents." 
                  onClick={() => onSelectPath('SCATTER')} 
                />
              </>
            )}

            {activeTab === 'comparisons' && (
              <>
                <PathCard 
                  icon={<Users />} title="Head-to-Head" 
                  desc="Compare two players side-by-side across all technical percentiles." 
                  onClick={() => onSelectPath('MATCHUP')} 
                />
                <PathCard 
                  icon={<Activity />} title="Advanced Radar" 
                  desc="Multi-player visualization with custom population-based normalization." 
                  onClick={() => onSelectPath('RADAR')} 
                />
                <PathCard 
                  icon={<Shield />} title="Squad Mapping" 
                  desc="Analyze your team composition against target league averages." 
                  onClick={() => onSelectPath('TEAMBUILDER')} 
                />
              </>
            )}

            {activeTab === 'experimental' && (
              <>
                <PathCard 
                  icon={<Zap />} title="Lab : Expérimentation" 
                  desc="Créez vos propres scores pondérés pour dénicher des pépites hors-radar." 
                  onClick={() => onSelectPath('LAB')} 
                />
                <PathCard 
                  icon={<Film />} title="ClipMaker" 
                  desc="Générez des clips vidéo automatisés basés sur les données Opta et xT." 
                  onClick={() => onSelectPath('CLIPMAKER')} 
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Decoration */}
      <div className="absolute bottom-12 right-12 verge-label-mono text-[8px] text-white/10 tracking-[0.5em] uppercase">
        Verge Systems / Intelligence Hub v2.3.0
      </div>
    </motion.div>
  );
};

export default ExplorationPath;
