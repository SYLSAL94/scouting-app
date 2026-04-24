import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * FavoriteToggle.jsx — Bouton de favoris intelligent
 * Gère l'état visuel du cœur et l'appel API Toggle.
 */
const FavoriteToggle = ({ playerId, user, onUpdateUser }) => {
  const isFavorite = user?.favorites?.includes(playerId);
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
          player_id: playerId
        })
      });
      const data = await res.json();
      
      if (data.success) {
        // Mise à jour optimiste de l'état global
        let newFavorites = [...(user.favorites || [])];
        if (data.action === 'added') {
          newFavorites.push(playerId);
        } else {
          newFavorites = newFavorites.filter(id => id !== playerId);
        }
        onUpdateUser({ ...user, favorites: newFavorites });
      }
    } catch (err) {
      console.error("Favorite toggle error:", err);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={isAnimating ? { scale: [1, 1.4, 1] } : {}}
      onClick={handleToggle}
      className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center border ${
        isFavorite 
          ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-lg shadow-red-500/10' 
          : 'bg-white/5 border-white/10 text-white/20 hover:text-white/40 hover:border-white/20'
      }`}
    >
      <Heart 
        size={24} 
        fill={isFavorite ? "currentColor" : "none"} 
        className={isFavorite ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : ""}
      />
    </motion.button>
  );
};

export default FavoriteToggle;
