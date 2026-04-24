import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Database, BrainCircuit, History, Zap, ShieldCheck, Globe } from 'lucide-react';

/**
 * LandingPage.jsx — Version Ultra-Premium & Dynamic Architecture
 * Design inspiré par le "Dark Mode" moderne (Style Linear/Apple).
 */

const FeatureCard = ({ icon: Icon, title, text, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="group relative p-8 rounded-[2rem] bg-[#121214]/50 border border-white/5 backdrop-blur-2xl hover:border-sky-500/30 transition-all duration-500"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />
    <div className="relative z-10">
      <div className="mb-6 p-4 bg-sky-500/10 rounded-2xl w-fit group-hover:scale-110 group-hover:bg-sky-500/20 transition-all duration-500">
        <Icon size={28} className="text-sky-400" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-white/90">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed font-medium">{text}</p>
    </div>
  </motion.div>
);

const LandingPage = ({ onEnter }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#080809] text-white selection:bg-sky-500/30 overflow-x-hidden">
      {/* Background complexe avec maillage et lueurs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-sky-600/10 rounded-full blur-[150px] opacity-50" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-600/10 rounded-full blur-[150px] opacity-50" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      </div>

      {/* Navigation (Header discret) */}
      <nav className="relative z-50 flex justify-between items-center px-6 md:px-12 py-8 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-black tracking-tighter text-xl uppercase">The Analyst <span className="text-sky-500">Scout</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
          <span>Archives v3.0</span>
          <span>DeepSeek Core</span>
          <span>Cloud Infrastructure</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 pt-12 md:pt-24 pb-32">
        {/* Hero Section Repensée */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div 
            initial={{ x: -30, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sky-400 text-[10px] font-black uppercase tracking-widest mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              Intelligence Hub & 10Y Archives
            </div>
            
            <h1 className="text-5xl md:text-7xl xl:text-8xl font-black tracking-tight uppercase leading-[0.9] mb-8">
              Décodez le <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40">Futur du Football</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/40 max-w-xl font-medium leading-relaxed mb-12">
              Exploitez 10 ans d'archives Wyscout avec la puissance de l'IA DeepSeek. 
              Le premier moteur de scouting prédictif conçu pour les clubs de haut niveau.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <button 
                onClick={onEnter} 
                className="w-full sm:w-auto group relative px-10 py-6 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4"
              >
                Lancer l'Analyse
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
              
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#080809] bg-white/10 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="user" className="opacity-80" />
                  </div>
                ))}
                <div className="pl-6 text-[10px] font-bold text-white/30 uppercase tracking-widest self-center">
                  Utilisé par +50 Clubs
                </div>
              </div>
            </div>
          </motion.div>

          {/* Visuel de prévisualisation IA (Mockup stylisé) */}
          <motion.div 
            initial={{ x: 30, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 to-transparent opacity-30" />
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
              </div>
              <div className="space-y-4 relative z-10">
                <div className="h-4 bg-white/10 rounded-full w-3/4 animate-pulse" />
                <div className="h-20 bg-white/5 rounded-2xl w-full border border-white/5 flex items-center justify-center">
                   <div className="flex items-center gap-4 text-sky-400 font-bold text-xs uppercase tracking-widest">
                      <BrainCircuit size={18} className="animate-pulse" /> IA Analyzing 10.432 players...
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 bg-sky-500/10 rounded-2xl border border-sky-500/20" />
                  <div className="h-32 bg-white/5 rounded-2xl border border-white/5" />
                </div>
              </div>
            </div>
            {/* Décoration flottante */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-[60px] animate-pulse" />
          </motion.div>
        </div>

        {/* Features Grid Repensée */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={History} 
            title="Heritage Data" 
            text="Plus de 10 ans de données historiques Wyscout pour identifier les modèles de progression." 
            delay={0.1}
          />
          <FeatureCard 
            icon={BrainCircuit} 
            title="Contextual IA" 
            text="L'intelligence DeepSeek au cœur de vos recherches pour une analyse sémantique du jeu." 
            delay={0.2}
          />
          <FeatureCard 
            icon={ShieldCheck} 
            title="Polarity Engine" 
            text="Algorithmes de scoring avancés neutralisant les biais statistiques pour une vérité terrain." 
            delay={0.3}
          />
          <FeatureCard 
            icon={Globe} 
            title="Global Search" 
            text="Une infrastructure Cloud optimisée pour scanner instantanément tous les championnats mondiaux." 
            delay={0.4}
          />
        </div>
      </main>

      {/* Footer Minimaliste */}
      <footer className="relative z-10 py-20 border-t border-white/5 flex flex-col items-center gap-8">
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
          <span>FastAPI</span>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <span>PostgreSQL</span>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <span>DeepSeek</span>
        </div>
        <p className="text-[10px] text-white/10 uppercase tracking-widest">
          © 2026 THE ANALYST SCOUTING SYSTEM • CLOUD-NATIVE ARCHITECTURE
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
