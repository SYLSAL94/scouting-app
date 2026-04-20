import React from 'react';
import { motion } from 'framer-motion';
import { X, Users, Activity, Zap, TrendingUp, Database, Globe } from 'lucide-react';
import PlayerRadar from '../../PlayerRadar';

const formatNumber = (val) => {
  if (val === null || val === undefined || val === "") return "-";
  const num = Number(val);
  return isNaN(num) ? val : (num % 1 === 0 ? num : num.toFixed(2));
};

const MetricTile = ({ icon, label, value }) => (
  <div className="metric-tile">
    <div className="metric-tile-icon">{icon}</div>
    <div className="metric-tile-value">{formatNumber(value)}</div>
    <div className="metric-tile-label">{label}</div>
  </div>
);

const PlayerModal = ({ player, onClose }) => {
  if (!player) return null;
  const playerName = player.full_name || player.name || player.shortName || "Détails Joueur";
  const teamName = player.last_club_name || player.team || player.team_name || "Club inconnu";
  const position = player.position_category || player.primary_position || "Non renseigné";
  const imageUrl = player.image || player.player_image;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 30, opacity: 0 }} 
        animate={{ scale: 1, y: 0, opacity: 1 }} 
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        className="modal-card"
        onClick={e => e.stopPropagation()}
      >
        <div className="player-hero">
          <button onClick={onClose} className="btn-close-modal">
            <X size={24} />
          </button>
          
          <div className="player-hero-content">
            <div className="player-avatar-large">
               {imageUrl ? (
                 <img src={imageUrl} alt={playerName} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-6xl font-black text-sky-400/20">{playerName[0]}</div>
               )}
            </div>
            <div className="player-main-info">
              <div className="badge-blue mb-2" style={{ width: 'fit-content' }}>PRO SCOUTING PROFILE</div>
              <h2 className="text-white">{playerName}</h2>
              <p className="text-2xl text-sky-400 font-bold tracking-tight">{teamName}</p>
            </div>
          </div>
        </div>
        
        <div className="metrics-grid">
          <MetricTile icon={<Users size={20} />} label="Position Category" value={position} />
          <MetricTile icon={<Activity size={20} />} label="Age" value={`${player.age || '—'} ans`} />
          <MetricTile icon={<Zap size={20} />} label="Impact Score" value={player.note_ponderee || 0} />
          <MetricTile icon={<TrendingUp size={20} />} label="Total Matches" value={player.total_matches || player.appearances || "—"} />
          <MetricTile icon={<Database size={20} />} label="Minutes Played" value={`${player.minutes_on_field || 0} min`} />
          <MetricTile icon={<Globe size={20} />} label="Nationality" value={player.passport_area_name || player.area_name || "—"} />
        </div>

        <div className="px-8 pb-8">
           <PlayerRadar player={player} />
        </div>

        <div className="p-8 pt-0 mt-auto flex justify-end">
          <button className="btn btn-primary px-8" onClick={onClose}>Fermer le profil</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PlayerModal;
