import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, BarChart2, TrendingUp, Activity, Users, Shield, Zap } from 'lucide-react';

const PathCard = ({ icon, title, desc, onClick, large }) => (
  <motion.div
    whileHover={{ y: -5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`path-card ${large ? 'path-card-large' : ''}`}
  >
    <div className="path-card-icon">
      {React.cloneElement(icon, { size: 24, className: "text-white" })}
    </div>
    <div className="path-card-arrow transition-transform group-hover:translate-x-2">
      <ArrowRight size={24} />
    </div>
    
    <div style={{ marginTop: large ? 'auto' : '0' }}>
      <h3 className="path-card-title">{title}</h3>
      <p className="path-card-desc">{desc}</p>
    </div>
  </motion.div>
);

const ExplorationPath = ({ onSelectPath, onBack }) => {
  const [activeTab, setActiveTab] = useState('analysis');

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="exploration-container"
    >
      <button onClick={onBack} className="btn-back">
        <ArrowLeft size={16} /> Back to welcome
      </button>

      <div className="badge-blue">
        <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
        Intelligence Hub v2.3
      </div>
      
      <h1 className="page-title leading-tight">
        Next-gen <br />
        <span className="text-highlight">Exploration</span> Hub
      </h1>
      
      <div className="tabs-selector mb-12">
        <button 
          className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >Analysis <span className="tab-tag">Core</span></button>
        <button 
          className={`tab-btn ${activeTab === 'comparisons' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparisons')}
        >Comparisons <span className="tab-tag">Match-up</span></button>
        <button 
          className={`tab-btn ${activeTab === 'experimental' ? 'active' : ''}`}
          onClick={() => setActiveTab('experimental')}
        >Experimental <span className="tab-tag">Beta</span></button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'analysis' && (
          <motion.div 
            key="analysis" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="path-grid"
          >
            <PathCard 
              icon={<BarChart2 />} title="Global Rankings" 
              desc="Comprehensive leaderboards powered by enriched performance metrics." 
              onClick={() => onSelectPath('DASHBOARD')}
            />
             <PathCard 
              icon={<TrendingUp />} title="Scatter Analysis" 
              desc="Correlate metrics (Age vs Impact) to find outliers and undervalued talents." 
              onClick={() => onSelectPath('SCATTER')} 
            />
            <div className="path-grid-full">
              <PathCard 
                icon={<Activity />} title="Radar Analysis" 
                desc="Deep dive into calculated tactical profiles with multi-axis overlays." 
                large onClick={() => onSelectPath('RADAR')} 
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'comparisons' && (
          <motion.div 
            key="comparisons" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="path-grid"
          >
            <PathCard 
              icon={<Users />} title="Head-to-Head" 
              desc="Compare two players side-by-side across all technical percentiles." 
              onClick={() => onSelectPath('MATCHUP')} 
            />
            <PathCard 
              icon={<Shield />} title="Squad Mapping" 
              desc="Analyze your team composition against target league averages." 
              onClick={() => onSelectPath('TEAMBUILDER')} 
            />
          </motion.div>
        )}

        {activeTab === 'experimental' && (
          <motion.div 
            key="experimental" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="path-grid"
          >
            <PathCard 
              icon={<Zap />} title="Lab : Expérimentation" 
              desc="Créez vos propres scores pondérés pour dénicher des pépites hors-radar." 
              onClick={() => onSelectPath('LAB')} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ExplorationPath;
