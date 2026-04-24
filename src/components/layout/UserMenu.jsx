import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, Key, X, CheckCircle2, AlertCircle, Loader2, Shield, Bell, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserMenu = ({ user, onLogout, onOpenSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-64 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl z-[200] overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 bg-white/5">
              <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Session Active</p>
              <p className="text-xs font-bold text-white truncate">{user?.email || user?.username}</p>
            </div>
            <div className="p-2">
              <button onClick={() => { onOpenSettings('profile'); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all">
                <Settings size={14} /> Paramètres du compte
              </button>
              <button onClick={() => { onOpenSettings('security'); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all">
                <Shield size={14} /> Sécurité & Accès
              </button>
              <div className="my-2 border-t border-white/5" />
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all">
                <LogOut size={14} /> Déconnexion
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
