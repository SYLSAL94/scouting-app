import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * FavoriteToggle.jsx — Verge Design System Hybrid Toggle
 * Supports legacy and contextual favorites with high-density editorial aesthetic.
 */
const FavoriteToggle = ({ playerId, season, competition, user, onUpdateUser }) => {
  const isFavorite = user?.favorites?.some(f => {
    const matchId = Number(f.id) === Number(playerId);
    const isOldFormat = !f.season && !f.competition;
    const matchContext = (f.season || "").trim() === (season || "").trim() && 
                         (f.competition || "").trim() === (competition || "").trim();
    return matchId && (isOldFormat || matchContext);
  });
  
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (!user?.id) return;

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);

    try {
      const res = await fetch('https://api-scouting.theanalyst.cloud/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          player_id: Number(playerId),
          season: season ? String(season).trim() : null,
          competition: competition ? String(competition).trim() : null
        })
      });
      const data = await res.json();
      
      if (data.success) {
        let newFavorites = [...(user.favorites || [])];
        if (data.action === 'added') {
          newFavorites.push({ id: Number(playerId), season, competition });
        } else {
          newFavorites = newFavorites.filter(f => {
             const matchId = Number(f.id) === Number(playerId);
             const matchCtx = (f.season || "").trim() === (season || "").trim() && 
                              (f.competition || "").trim() === (competition || "").trim();
             const isOld = !f.season && !f.competition;
             return !(matchId && (matchCtx || isOld));
          });
        }
        onUpdateUser({ ...user, favorites: newFavorites });
      }
    } catch (err) {
      console.error("Favorite toggle error:", err);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
      onClick={handleToggle}
      className={`relative group flex items-center gap-3 px-5 py-2.5 rounded-[4px] transition-all duration-300 border ${
        isFavorite 
          ? 'bg-verge-ultraviolet border-verge-ultraviolet text-hazard-white shadow-[0_0_30px_rgba(82,0,255,0.2)]' 
          : 'bg-surface-slate border-hazard-white/10 text-secondary-text hover:border-hazard-white/30 hover:text-hazard-white'
      }`}
    >
      <Heart 
        size={14} 
        fill={isFavorite ? "currentColor" : "none"} 
        className={`${isFavorite ? "text-hazard-white" : "text-secondary-text group-hover:text-hazard-white transition-colors"}`}
      />
      <span className="verge-label-mono text-[9px] font-black uppercase tracking-widest">
        {isFavorite ? 'Enregistré' : 'Suivre'}
      </span>
    </motion.button>
  );
};

export default FavoriteToggle;
