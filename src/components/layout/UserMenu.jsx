import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, Key, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserMenu = ({ user, onLogout, onUpdateUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const menuRef = useRef(null);

  // États pour le changement de mot de passe
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setStatus({ ...status, error: "Les nouveaux mots de passe ne correspondent pas" });
      return;
    }

    setStatus({ loading: true, error: null, success: false });
    try {
      const res = await fetch('https://api-scouting.theanalyst.cloud/api/users/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          old_password: passwords.old,
          new_password: passwords.new
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erreur lors de la mise à jour");
      
      setStatus({ loading: false, error: null, success: true });
      setPasswords({ old: '', new: '', confirm: '' });
      setTimeout(() => { setShowSettings(false); setStatus({ ...status, success: false }); }, 2000);
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: false });
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full pl-2 pr-4 py-1.5 transition-all group"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="hidden lg:flex flex-col text-left">
          <span className="text-[10px] font-black uppercase text-white leading-none">{user?.username}</span>
          <span className="text-[8px] font-bold text-sky-400 uppercase tracking-widest mt-1">{user?.role}</span>
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-56 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 bg-white/5">
              <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Connecté en tant que</p>
              <p className="text-xs font-bold text-white truncate">{user?.email || user?.username}</p>
            </div>
            
            <div className="p-2">
              <button 
                onClick={() => { setShowSettings(true); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                <Settings size={14} /> Paramètres du compte
              </button>
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={14} /> Déconnexion
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal (Password Change) */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-3xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-500/20 rounded-xl text-sky-400"><Key size={20} /></div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-white">Sécurité</h3>
                </div>
                <button onClick={() => setShowSettings(false)} className="text-white/20 hover:text-white transition-colors"><X size={20} /></button>
              </div>

              <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/40 tracking-widest mb-2">Ancien mot de passe</label>
                  <input 
                    type="password" required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-sky-500/50 transition-all"
                    value={passwords.old} onChange={(e) => setPasswords({...passwords, old: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 gap-6">
                   <div>
                    <label className="block text-[10px] font-black uppercase text-white/40 tracking-widest mb-2">Nouveau mot de passe</label>
                    <input 
                      type="password" required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-sky-500/50 transition-all"
                      value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    />
                  </div>
                   <div>
                    <label className="block text-[10px] font-black uppercase text-white/40 tracking-widest mb-2">Confirmer</label>
                    <input 
                      type="password" required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-sky-500/50 transition-all"
                      value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    />
                  </div>
                </div>

                {status.error && (
                  <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold">
                    <AlertCircle size={16} /> {status.error}
                  </div>
                )}

                {status.success && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-bold">
                    <CheckCircle2 size={16} /> Mot de passe mis à jour !
                  </div>
                )}

                <button 
                  type="submit" disabled={status.loading}
                  className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-3"
                >
                  {status.loading ? <Loader2 size={18} className="animate-spin" /> : "Mettre à jour"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
