import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * FavoriteToggle.jsx — Bouton de favoris hybride
 * Supporte les anciens favoris (ID seul) et les nouveaux (ID + Contexte).
 */
const FavoriteToggle = ({ playerId, season, competition, user, onUpdateUser }) => {
  // Détection Hybride : Match contextuel OU Match ID seul si pas de contexte enregistré
  const isFavorite = user?.favorites?.some(f => {
    const matchId = Number(f.id) === Number(playerId);
    
    // Si le favori en mémoire n'a pas de saison/compétition (ancien format), on valide sur l'ID
    const isOldFormat = !f.season && !f.competition;
    
    // Sinon, on vérifie le match exact du contexte
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
          // Suppression intelligente : on retire tout ce qui match l'ID et le contexte actuel
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
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
      onClick={handleToggle}
      className={`relative group flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300 border ${
        isFavorite 
          ? 'bg-red-500/20 border-red-500/40 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
          : 'bg-white/5 border-white/10 text-white hover:border-white/30 hover:bg-white/10'
      }`}
    >
      <Heart 
        size={20} 
        fill={isFavorite ? "currentColor" : "none"} 
        className={`${isFavorite ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "text-white/40 group-hover:text-white transition-colors"}`}
      />
      <span className={`text-[10px] font-black uppercase tracking-widest ${isFavorite ? 'text-red-400' : 'text-white/40 group-hover:text-white'}`}>
        {isFavorite ? 'Favori' : 'Suivre'}
      </span>
      
      {isFavorite && (
        <div className="absolute inset-0 rounded-2xl bg-red-500/10 blur-xl group-hover:bg-red-500/20 transition-all" />
      )}
    </motion.button>
  );
};

export default FavoriteToggle;
