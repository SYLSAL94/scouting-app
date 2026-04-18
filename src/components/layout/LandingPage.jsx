import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Database, Zap, BarChart2 } from 'lucide-react';

const FeatureItem = ({ icon, title, text }) => (
  <div className="landing-feature-card">
    <div>{icon}</div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-sm text-[rgb(var(--text-muted))]">{text}</p>
  </div>
);

const LandingPage = ({ onEnter }) => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="landing-container"
  >
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px] animate-pulse" />
    
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="hero-section">
      <div className="badge-blue">NEXT GEN SCOUTING INTELLIGENCE</div>
      <h1 className="landing-title">
        Dominez le Terrain par <br /> <span className="text-highlight">l'Analyse de Données</span>
      </h1>
      <p className="landing-subtitle">
        Accédez aux statistiques Wyscout enrichies. <br /> 
        Interface connectée en temps-réel à votre infrastructure VPS.
      </p>
      <button onClick={onEnter} className="btn btn-primary px-10 py-5 text-lg">
        Accéder au Dashboard <ArrowRight size={22} />
      </button>
    </motion.div>

    <div className="features-grid">
      <FeatureItem icon={<Database className="text-sky-400" />} title="API V2.3" text="Navigation paginée et support complet du profilage détaillé." />
      <FeatureItem icon={<Zap className="text-amber-400" />} title="Cloud-Native" text="Génération automatique des menus déroulants depuis PostgreSQL." />
      <FeatureItem icon={<BarChart2 className="text-emerald-400" />} title="Performance" text="Filtrage SQL ultra-rapide et gestion de la charge PM2." />
    </div>
  </motion.div>
);

export default LandingPage;
