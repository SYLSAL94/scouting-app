import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Database, BrainCircuit, History, Zap, ShieldCheck, Globe } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, text, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="group relative p-8 bg-[#2d2d2d] border border-white/5 hover:border-[#3cffd0]/30 transition-all duration-300 rounded-[4px] overflow-hidden"
  >
    {/* Hazard Corner */}
    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#3cffd0]/0 group-hover:border-[#3cffd0]/40 transition-all" />
    
    <div className="relative z-10">
      <div className="mb-10 w-12 h-12 bg-[#131313] border border-white/10 flex items-center justify-center group-hover:border-[#3cffd0] transition-colors rounded-[2px]">
        <Icon size={22} className="text-[#949494] group-hover:text-[#3cffd0] transition-colors" />
      </div>
      <h3 className="verge-label-mono text-white text-[12px] mb-4 font-black tracking-widest">{title}</h3>
      <p className="verge-label-mono text-[10px] text-[#949494] leading-relaxed lowercase italic opacity-60">{text}</p>
    </div>
  </motion.div>
);

const LandingPage = ({ onEnter }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#131313] text-white selection:bg-[#3cffd0]/30 overflow-x-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Navigation */}
      <nav className="relative z-50 flex justify-between items-center px-6 md:px-12 py-10 max-w-[1600px] mx-auto border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#3cffd0] flex items-center justify-center shadow-[0_0_20px_rgba(60,255,208,0.3)] rounded-[2px]">
            <Zap size={20} className="text-black" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">The Analyst <span className="text-[#3cffd0]">Hub</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => onEnter('EXPLORATION')}
            className="px-6 py-2 border border-white/10 hover:border-[#3cffd0] rounded-full verge-label-mono text-[9px] text-[#949494] hover:text-[#3cffd0] transition-all font-black tracking-widest"
          >
            WYSCOUT DATA
          </button>
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          <button 
            onClick={() => onEnter('CLIPMAKER')}
            className="px-6 py-2 border border-white/10 hover:border-[#3cffd0] rounded-full verge-label-mono text-[9px] text-[#949494] hover:text-[#3cffd0] transition-all font-black tracking-widest"
          >
            OPTA VISION
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 pt-20 md:pt-32 pb-32">
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div 
            initial={{ x: -30, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#2d2d2d] border border-white/10 text-[#3cffd0] verge-label-mono text-[9px] font-black tracking-[0.2em] mb-10 rounded-[2px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3cffd0] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3cffd0]"></span>
              </span>
              Intelligence Hub & 10Y Archives
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-[100px] font-black text-white uppercase leading-[0.85] tracking-tighter mb-12">
              Décodez le <br /> 
              <span className="text-[#3cffd0]">Futur du Football</span>
            </h1>
            
            <p className="verge-label-mono text-sm text-[#949494] max-w-xl leading-relaxed mb-16 lowercase italic opacity-80">
              Exploitez 10 ans d'archives multi-sources avec la puissance de l'IA DeepSeek. 
              Choisissez votre univers de données pour commencer l'analyse.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-12">
              <button 
                onClick={() => onEnter('EXPLORATION')} 
                className="w-full sm:w-auto group relative px-12 py-6 bg-[#3cffd0] text-black rounded-full verge-label-mono text-[11px] font-black tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-[0_20px_60px_rgba(60,255,208,0.2)] flex items-center justify-center gap-4"
              >
                WYSCOUT DATA
                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </button>

              <button 
                onClick={() => onEnter('CLIPMAKER')} 
                className="w-full sm:w-auto group relative px-12 py-6 bg-white/5 border border-white/20 text-white rounded-full verge-label-mono text-[11px] font-black tracking-[0.2em] transition-all hover:bg-white/10 hover:border-[#3cffd0]/40 flex items-center justify-center gap-4"
              >
                OPTA VISION
                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#131313] bg-[#2d2d2d] flex items-center justify-center overflow-hidden grayscale hover:grayscale-0 transition-all">
                    <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="user" className="opacity-80" />
                  </div>
                ))}
              </div>
              <div className="verge-label-mono text-[8px] font-black text-[#949494] uppercase tracking-[0.2em]">
                Utilisé par +50 Clubs
              </div>
            </div>
          </motion.div>

          {/* AI Preview Mockup */}
          <motion.div 
            initial={{ x: 30, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-[4px] border border-white/10 bg-[#131313] p-10 overflow-hidden shadow-2xl">
              <div className="flex gap-2 mb-8">
                <div className="w-2 h-2 rounded-full bg-white/10" />
                <div className="w-2 h-2 rounded-full bg-white/10" />
                <div className="w-2 h-2 rounded-full bg-white/10" />
              </div>
              <div className="space-y-6">
                <div className="h-4 bg-[#2d2d2d] rounded-[1px] w-3/4 animate-pulse" />
                <div className="h-24 bg-[#2d2d2d]/50 rounded-[2px] w-full border border-white/5 flex items-center justify-center p-6">
                   <div className="flex items-center gap-4 text-[#3cffd0] verge-label-mono text-[9px] font-black uppercase tracking-widest">
                      <BrainCircuit size={20} className="animate-pulse" /> IA Analyzing 10.432 players...
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="h-40 bg-[#3cffd0]/5 rounded-[2px] border border-[#3cffd0]/20" />
                  <div className="h-40 bg-[#2d2d2d] rounded-[2px] border border-white/5" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-[#3cffd0]/20" />
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
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

      {/* Footer */}
      <footer className="relative z-10 py-16 border-t border-white/5 flex flex-col items-center gap-10">
        <div className="flex items-center gap-8 verge-label-mono text-[9px] font-black uppercase tracking-[0.5em] text-[#949494]">
          <span className="hover:text-white transition-colors">FASTAPI</span>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <span className="hover:text-white transition-colors">POSTGRESQL</span>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <span className="hover:text-white transition-colors">DEEPSEEK</span>
        </div>
        <p className="verge-label-mono text-[8px] text-white/10 uppercase tracking-[0.4em] font-black">
          © 2026 THE ANALYST SCOUTING SYSTEM • CLOUD-NATIVE ARCHITECTURE
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
