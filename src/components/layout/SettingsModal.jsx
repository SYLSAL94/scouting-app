import React, { useState, useEffect } from 'react';
import { User, Shield, X, CheckCircle2, AlertCircle, Loader2, Heart, Filter, Trash2, ChevronRight, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

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
    e.stopPropagation(); 
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
      setStatus({ ...status, error: "LES NOUVEAUX MOTS DE PASSE NE CORRESPONDENT PAS" });
      return;
    }
    setStatus({ loading: true, error: null, success: false });
    try {
      const res = await fetch('https://api-scouting.theanalyst.cloud/api/users/update-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, old_password: passwords.old, new_password: passwords.new })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "ERREUR LORS DE LA MISE À JOUR");
      setStatus({ loading: false, error: null, success: true });
      setPasswords({ old: '', new: '', confirm: '' });
      setTimeout(() => setStatus({ ...status, success: false }), 3000);
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: false });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-absolute-black/90 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
        className="w-full max-w-6xl h-[750px] bg-canvas-black border border-hazard-white/10 rounded-[4px] shadow-[0_60px_120px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row relative"
      >
        {/* Sidebar - Technical Control Panel */}
        <div className="w-full md:w-80 bg-surface-slate border-r border-hazard-white/5 p-8 flex flex-col gap-2 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-jelly-mint/20" />
          
          <div className="flex items-center gap-4 mb-12 px-2">
             <div className="w-12 h-12 bg-canvas-black border border-jelly-mint/30 flex items-center justify-center shadow-2xl">
                <Settings className="text-jelly-mint" size={24} />
             </div>
             <div>
                <h3 className="verge-label-mono text-xl font-black uppercase tracking-[0.1em] text-hazard-white leading-none">Espace Pro</h3>
                <p className="verge-label-mono text-[8px] text-secondary-text font-black uppercase tracking-[0.3em] opacity-40 mt-1.5">Administrative Hub</p>
             </div>
          </div>

          <div className="space-y-1">
            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center justify-between px-5 py-4 rounded-[1px] verge-label-mono text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${activeTab === 'profile' ? 'bg-jelly-mint text-absolute-black border-jelly-mint' : 'text-secondary-text border-transparent hover:bg-hazard-white/5 hover:text-hazard-white'}`}>
              <div className="flex items-center gap-4">
                <User size={16} strokeWidth={2.5} /> PROFIL ADMIN
              </div>
              {activeTab === 'profile' && <ChevronRight size={14} />}
            </button>
            
            <button onClick={() => setActiveTab('favorites')} className={`w-full flex items-center justify-between px-5 py-4 rounded-[1px] verge-label-mono text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${activeTab === 'favorites' ? 'bg-jelly-mint text-absolute-black border-jelly-mint' : 'text-secondary-text border-transparent hover:bg-hazard-white/5 hover:text-hazard-white'}`}>
              <div className="flex items-center gap-4">
                <Heart size={16} strokeWidth={2.5} /> MA SHORTLIST
              </div>
              <span className={`px-2 py-0.5 rounded-[1px] text-[8px] font-black ${activeTab === 'favorites' ? 'bg-absolute-black text-jelly-mint' : 'bg-hazard-white/10 text-hazard-white'}`}>{user?.favorites?.length || 0}</span>
            </button>

            <button onClick={() => setActiveTab('profiles')} className={`w-full flex items-center justify-between px-5 py-4 rounded-[1px] verge-label-mono text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${activeTab === 'profiles' ? 'bg-jelly-mint text-absolute-black border-jelly-mint' : 'text-secondary-text border-transparent hover:bg-hazard-white/5 hover:text-hazard-white'}`}>
              <div className="flex items-center gap-4">
                <Filter size={16} strokeWidth={2.5} /> FILTRES SAUV.
              </div>
              <span className={`px-2 py-0.5 rounded-[1px] text-[8px] font-black ${activeTab === 'profiles' ? 'bg-absolute-black text-jelly-mint' : 'bg-hazard-white/10 text-hazard-white'}`}>{profiles.length}</span>
            </button>

            <button onClick={() => setActiveTab('security')} className={`w-full flex items-center justify-between px-5 py-4 rounded-[1px] verge-label-mono text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${activeTab === 'security' ? 'bg-jelly-mint text-absolute-black border-jelly-mint' : 'text-secondary-text border-transparent hover:bg-hazard-white/5 hover:text-hazard-white'}`}>
              <div className="flex items-center gap-4">
                <Shield size={16} strokeWidth={2.5} /> SÉCURITÉ
              </div>
            </button>
          </div>

          <div className="mt-auto p-6 bg-canvas-black border border-hazard-white/5 rounded-[2px] relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-hazard-white/10" />
            <div className="relative z-10">
                <p className="verge-label-mono text-[8px] font-black uppercase text-jelly-mint mb-2 tracking-[0.3em]">LICENCE ENTERPRISE</p>
                <p className="verge-label-mono text-[10px] font-black text-hazard-white mb-5 uppercase tracking-tight">Accès illimité aux données</p>
                <div className="h-1 w-full bg-hazard-white/5 rounded-[1px] overflow-hidden">
                    <div className="h-full w-3/4 bg-jelly-mint shadow-[0_0_10px_rgba(60,255,208,0.5)]" />
                </div>
            </div>
          </div>
        </div>

        {/* Content Area - Clean Technical Layout */}
        <div className="flex-1 flex flex-col relative bg-canvas-black">
          <button onClick={onClose} className="absolute top-8 right-8 p-3 rounded-[2px] bg-surface-slate border border-hazard-white/10 text-secondary-text hover:text-hazard-white hover:border-jelly-mint/50 transition-all z-20 shadow-2xl">
            <X size={20} />
          </button>

          <div className="flex-1 overflow-y-auto p-12 styled-scrollbar">
            
            {/* ONGLET FAVORIS */}
            {activeTab === 'favorites' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-6">
                        <div className="h-10 w-1 bg-jelly-mint" />
                        <div>
                            <h4 className="verge-label-mono text-3xl font-black text-hazard-white uppercase tracking-tighter mb-1">Ma Shortlist</h4>
                            <p className="verge-label-mono text-[9px] text-secondary-text font-black uppercase tracking-[0.2em] opacity-40">Favoris liés à une saison et compétition précise</p>
                        </div>
                    </div>

                    {loadingFavs ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-30">
                            <div className="w-12 h-12 border-2 border-jelly-mint border-t-transparent rounded-full animate-spin" />
                            <p className="verge-label-mono text-[9px] font-black text-hazard-white uppercase tracking-[0.4em]">SYNCING DATA...</p>
                        </div>
                    ) : favoritesList.length > 0 ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {favoritesList.map((player, idx) => (
                                <div key={`${player.id}-${idx}`} onClick={() => { onPlayerClick(player); onClose(); }} className="bg-surface-slate border border-hazard-white/5 rounded-[2px] p-5 flex items-center gap-6 group hover:border-jelly-mint/30 transition-all cursor-pointer relative overflow-hidden shadow-lg">
                                    <div className="w-16 h-16 rounded-[1px] bg-canvas-black border border-hazard-white/10 overflow-hidden flex-shrink-0 relative z-10 group-hover:border-jelly-mint/50 transition-all duration-500">
                                        {player.image ? <img src={player.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" /> : <div className="w-full h-full flex items-center justify-center text-xl font-black text-hazard-white/10">{player.name[0]}</div>}
                                    </div>
                                    <div className="flex-1 min-w-0 relative z-10">
                                        <p className="verge-label-mono text-[13px] font-black text-hazard-white truncate uppercase tracking-tight group-hover:text-jelly-mint transition-colors">{player.name}</p>
                                        <p className="verge-label-mono text-[8px] font-black text-jelly-mint uppercase tracking-tighter truncate mt-1 opacity-60">{player.competition}</p>
                                        <p className="verge-label-mono text-[8px] font-black text-secondary-text uppercase tracking-[0.1em] mt-1 opacity-40">{player.season} • {player.position_category}</p>
                                    </div>
                                    <div className="text-right relative z-10 pr-4">
                                        <p className="verge-label-mono text-[7px] font-black text-secondary-text uppercase tracking-tighter opacity-40">SCORE</p>
                                        <p className="verge-label-mono text-2xl font-black text-jelly-mint leading-none tabular-nums mt-1">{Math.round(player.note_ponderee)}</p>
                                    </div>
                                    <button onClick={(e) => handleRemoveFavorite(e, player)} className="p-3 rounded-[1px] bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 ml-2 relative z-10 border border-red-500/20">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 opacity-20 border border-dashed border-hazard-white/5 rounded-[4px]">
                            <Heart size={48} strokeWidth={1} />
                            <p className="verge-label-mono text-[10px] font-black uppercase tracking-[0.4em]">AUCUNE PERFORMANCE SAUVEGARDÉE</p>
                        </div>
                    )}
                </div>
            )}

            {/* ONGLET PROFILS / FILTRES */}
            {activeTab === 'profiles' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-6">
                        <div className="h-10 w-1 bg-jelly-mint" />
                        <div>
                            <h4 className="verge-label-mono text-3xl font-black text-hazard-white uppercase tracking-tighter mb-1">Filtres Sauvegardés</h4>
                            <p className="verge-label-mono text-[9px] text-secondary-text font-black uppercase tracking-[0.2em] opacity-40">Gérez vos configurations de recherche personnalisées</p>
                        </div>
                    </div>

                    {profiles.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {profiles.map(profile => (
                                <div key={profile.id} className="flex items-center justify-between p-6 bg-surface-slate border border-hazard-white/5 rounded-[2px] group hover:border-jelly-mint/30 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="p-3 bg-canvas-black border border-hazard-white/5 rounded-[1px] text-jelly-mint"><Filter size={20} /></div>
                                        <div>
                                            <p className="verge-label-mono text-sm font-black text-hazard-white uppercase tracking-tight">{profile.profile_name}</p>
                                            <p className="verge-label-mono text-[8px] font-black text-secondary-text uppercase tracking-[0.2em] mt-1 opacity-40">Configuration Système</p>
                                        </div>
                                    </div>
                                    <button onClick={() => onProfileDeleted(profile.id)} className="p-3 rounded-[1px] bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 opacity-20 border border-dashed border-hazard-white/5 rounded-[4px]">
                            <Filter size={48} strokeWidth={1} />
                            <p className="verge-label-mono text-[10px] font-black uppercase tracking-[0.4em]">AUCUN FILTRE SAUVEGARDÉ</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-6">
                    <div className="h-10 w-1 bg-jelly-mint" />
                    <div>
                        <h4 className="verge-label-mono text-3xl font-black text-hazard-white uppercase tracking-tighter mb-1">Profil Administrateur</h4>
                        <p className="verge-label-mono text-[9px] text-secondary-text font-black uppercase tracking-[0.2em] opacity-40">Détails de votre compte professionnel</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-surface-slate border border-hazard-white/5 rounded-[2px] space-y-2 relative shadow-lg">
                    <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-hazard-white/10" />
                    <label className="verge-label-mono text-[9px] font-black uppercase text-jelly-mint tracking-[0.2em]">Nom d'utilisateur</label>
                    <p className="verge-label-mono text-xl font-black text-hazard-white uppercase tracking-tight">{user?.username}</p>
                  </div>
                  <div className="p-8 bg-surface-slate border border-hazard-white/5 rounded-[2px] space-y-2 relative shadow-lg">
                    <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-hazard-white/10" />
                    <label className="verge-label-mono text-[9px] font-black uppercase text-jelly-mint tracking-[0.2em]">Email Associé</label>
                    <p className="verge-label-mono text-xl font-black text-hazard-white uppercase tracking-tight">{user?.email || 'NON DÉFINI'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-6">
                    <div className="h-10 w-1 bg-jelly-mint" />
                    <div>
                        <h4 className="verge-label-mono text-3xl font-black text-hazard-white uppercase tracking-tighter mb-1">Sécurité</h4>
                        <p className="verge-label-mono text-[9px] text-secondary-text font-black uppercase tracking-[0.2em] opacity-40">Mise à jour des protocoles d'accès</p>
                    </div>
                </div>
                <form onSubmit={handleUpdatePassword} className="space-y-8 max-w-lg">
                  <div className="space-y-3">
                    <label className="verge-label-mono text-[9px] font-black uppercase text-secondary-text tracking-[0.2em]">Mot de passe actuel</label>
                    <input type="password" required className="w-full bg-canvas-black border border-hazard-white/10 rounded-[1px] px-5 py-4 text-hazard-white verge-label-mono text-[11px] font-black outline-none focus:border-jelly-mint/50 transition-all tracking-widest placeholder:text-hazard-white/5" placeholder="••••••••" value={passwords.old} onChange={(e) => setPasswords({...passwords, old: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="verge-label-mono text-[9px] font-black uppercase text-secondary-text tracking-[0.2em]">Nouveau mot de passe</label>
                    <input type="password" required className="w-full bg-canvas-black border border-hazard-white/10 rounded-[1px] px-5 py-4 text-hazard-white verge-label-mono text-[11px] font-black outline-none focus:border-jelly-mint/50 transition-all tracking-widest placeholder:text-hazard-white/5" placeholder="••••••••" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="verge-label-mono text-[9px] font-black uppercase text-secondary-text tracking-[0.2em]">Confirmer le protocole</label>
                    <input type="password" required className="w-full bg-canvas-black border border-hazard-white/10 rounded-[1px] px-5 py-4 text-hazard-white verge-label-mono text-[11px] font-black outline-none focus:border-jelly-mint/50 transition-all tracking-widest placeholder:text-hazard-white/5" placeholder="••••••••" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
                  </div>
                  
                  {status.error && <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-[1px] text-red-500 verge-label-mono text-[9px] font-black uppercase tracking-widest flex items-center gap-4"><AlertCircle size={16} /> {status.error}</div>}
                  {status.success && <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-[1px] text-emerald-400 verge-label-mono text-[9px] font-black uppercase tracking-widest flex items-center gap-4"><CheckCircle2 size={16} /> MISE À JOUR VALIDÉE</div>}
                  
                  <button type="submit" disabled={status.loading} className="w-full bg-jelly-mint hover:bg-jelly-mint/90 disabled:bg-canvas-black disabled:text-[#444] text-absolute-black verge-label-mono text-[12px] font-black uppercase tracking-[0.4em] py-5 rounded-[2px] shadow-[0_20px_40px_rgba(60,255,208,0.2)] transition-all flex items-center justify-center gap-4 active:scale-[0.98]">
                    {status.loading ? <Loader2 size={20} className="animate-spin" /> : "METTRE À JOUR"}
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
