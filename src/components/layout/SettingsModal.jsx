import React, { useState, useEffect } from 'react';
import { User, Shield, Bell, Key, X, CheckCircle2, AlertCircle, Loader2, Heart, Filter, Trash2, ChevronRight, Search, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsModal = ({ isOpen, onClose, user, initialTab = 'profile', onUpdateUser, profiles = [], onProfileDeleted, onPlayerClick }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  // États pour la shortlist (favoris)
  const [favoritesList, setFavoritesList] = useState([]);
  const [loadingFavs, setLoadingFavs] = useState(false);

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  // Fetch des détails des favoris quand l'onglet est actif
  useEffect(() => {
    if (isOpen && activeTab === 'favorites' && user?.favorites?.length > 0) {
      fetchFavorites();
    }
  }, [isOpen, activeTab, user?.favorites]);

  const fetchFavorites = async () => {
    setLoadingFavs(true);
    try {
      const res = await fetch('https://api-scouting.theanalyst.cloud/api/players/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user.favorites)
      });
      const data = await res.json();
      setFavoritesList(data);
    } catch (err) {
      console.error("Error fetching favorites:", err);
    } finally {
      setLoadingFavs(false);
    }
  };

  const handleRemoveFavorite = async (e, player) => {
    e.stopPropagation(); // Évite d'ouvrir la fiche joueur lors du clic sur supprimer
    try {
      const res = await fetch('https://api-scouting.theanalyst.cloud/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.id, 
          player_id: player.id,
          season: player.season,
          competition: player.competition
        })
      });
      const data = await res.json();
      if (data.success) {
        const newFavs = user.favorites.filter(f => 
          !(f.id === player.id && f.season === player.season && f.competition === player.competition)
        );
        onUpdateUser({ ...user, favorites: newFavs });
        setFavoritesList(prev => prev.filter(p => 
          !(p.id === player.id && p.season === player.season && p.competition === player.competition)
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setStatus({ ...status, error: "Les nouveaux mots de passe ne correspondent pas" });
      return;
    }
    setStatus({ loading: true, error: null, success: false });
    try {
      const res = await fetch('https://api-scouting.theanalyst.cloud/api/users/update-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, old_password: passwords.old, new_password: passwords.new })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erreur lors de la mise à jour");
      setStatus({ loading: false, error: null, success: true });
      setPasswords({ old: '', new: '', confirm: '' });
      setTimeout(() => setStatus({ ...status, success: false }), 3000);
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: false });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-5xl h-[700px] bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden flex flex-col md:flex-row relative"
      >
        {/* Sidebar */}
        <div className="w-full md:w-72 bg-white/5 border-r border-white/5 p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-8 px-2">
             <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                <Settings className="text-sky-400" size={20} />
             </div>
             <h3 className="text-xl font-black uppercase tracking-tighter text-white">Espace Pro</h3>
          </div>

          <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'profile' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
            <User size={16} /> Profil Administrateur
          </button>
          
          <button onClick={() => setActiveTab('favorites')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'favorites' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
            <Heart size={16} /> Ma Shortlist ({user?.favorites?.length || 0})
          </button>

          <button onClick={() => setActiveTab('profiles')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'profiles' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
            <Filter size={16} /> Filtres Sauvegardés ({profiles.length})
          </button>

          <button onClick={() => setActiveTab('security')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'security' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
            <Shield size={16} /> Sécurité & Accès
          </button>

          <div className="mt-auto p-5 bg-gradient-to-br from-sky-500/20 to-indigo-600/20 border border-white/10 rounded-2xl relative overflow-hidden group">
            <div className="relative z-10">
                <p className="text-[10px] font-black uppercase text-sky-400 mb-1 tracking-widest">Licence Enterprise</p>
                <p className="text-[11px] font-bold text-white mb-3">Accès illimité aux données</p>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-sky-500 rounded-full" />
                </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col relative bg-slate-900/50">
          <button onClick={onClose} className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all z-20 bg-slate-900 border border-white/5 shadow-xl">
            <X size={20} />
          </button>

          <div className="flex-1 overflow-y-auto p-8 md:p-12 styled-scrollbar">
            
            {/* ONGLET FAVORIS */}
            {activeTab === 'favorites' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <h4 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Ma Shortlist</h4>
                        <p className="text-sm text-white/40 font-medium">Favoris liés à une saison et compétition précise.</p>
                    </div>

                    {loadingFavs ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 size={40} className="text-sky-500 animate-spin" />
                            <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Récupération des performances...</p>
                        </div>
                    ) : favoritesList.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {favoritesList.map((player, idx) => (
                                <div 
                                    key={`${player.id}-${idx}`} 
                                    onClick={() => { onPlayerClick(player); onClose(); }}
                                    className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4 group hover:border-sky-500/30 transition-all cursor-pointer relative overflow-hidden"
                                >
                                    <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-white/5 overflow-hidden flex-shrink-0 relative z-10">
                                        {player.image ? <img src={player.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl font-black text-white/20">{player.name[0]}</div>}
                                    </div>
                                    <div className="flex-1 min-w-0 relative z-10">
                                        <p className="text-sm font-bold text-white truncate">{player.name}</p>
                                        <p className="text-[10px] font-bold text-sky-400 uppercase tracking-tighter truncate">{player.competition}</p>
                                        <p className="text-[9px] font-medium text-white/30 uppercase tracking-widest">{player.season} • {player.position_category}</p>
                                    </div>
                                    <div className="text-right relative z-10">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-tighter">Note</p>
                                        <p className="text-xl font-black text-sky-400 leading-none">{Math.round(player.note_ponderee)}</p>
                                    </div>
                                    <button 
                                        onClick={(e) => handleRemoveFavorite(e, player)}
                                        className="p-2.5 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 ml-2 relative z-10"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/10"><Heart size={32} /></div>
                            <p className="text-sm text-white/20 font-bold uppercase tracking-widest">Aucune performance sauvegardée</p>
                        </div>
                    )}
                </div>
            )}

            {/* ONGLET PROFILS / FILTRES */}
            {activeTab === 'profiles' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <h4 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Mes Filtres Sauvegardés</h4>
                        <p className="text-sm text-white/40 font-medium">Gérez vos configurations de recherche personnalisées.</p>
                    </div>

                    {profiles.length > 0 ? (
                        <div className="space-y-3">
                            {profiles.map(profile => (
                                <div key={profile.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400"><Filter size={18} /></div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{profile.profile_name}</p>
                                            <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">Filtre Sauvegardé</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onProfileDeleted(profile.id)}
                                        className="p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/10"><Filter size={32} /></div>
                            <p className="text-sm text-white/20 font-bold uppercase tracking-widest">Aucun filtre sauvegardé</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h4 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Profil Administrateur</h4>
                  <p className="text-sm text-white/40 font-medium">Détails de votre compte professionnel.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-1">
                    <label className="text-[10px] font-black uppercase text-sky-400 tracking-widest">Nom d'utilisateur</label>
                    <p className="text-lg font-bold text-white">{user?.username}</p>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-1">
                    <label className="text-[10px] font-black uppercase text-sky-400 tracking-widest">Email Associé</label>
                    <p className="text-lg font-bold text-white">{user?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h4 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Sécurité</h4>
                  <p className="text-sm text-white/40 font-medium">Mise à jour du mot de passe.</p>
                </div>
                <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Mot de passe actuel</label>
                    <input type="password" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-sky-500/50 transition-all" value={passwords.old} onChange={(e) => setPasswords({...passwords, old: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Nouveau mot de passe</label>
                    <input type="password" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-sky-500/50 transition-all" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Confirmer</label>
                    <input type="password" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-sky-500/50 transition-all" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
                  </div>
                  {status.error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-3"><AlertCircle size={16} /> {status.error}</div>}
                  {status.success && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-bold flex items-center gap-3"><CheckCircle2 size={16} /> Succès !</div>}
                  <button type="submit" disabled={status.loading} className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-3">
                    {status.loading ? <Loader2 size={18} className="animate-spin" /> : "Sauvegarder"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;
