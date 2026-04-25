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
        className="flex items-center gap-3 bg-[#2d2d2d] hover:bg-white border border-white/10 rounded-full pl-2 pr-5 py-2 transition-all group"
      >
        <div className="w-8 h-8 rounded-full bg-[#3cffd0] flex items-center justify-center text-black font-black text-xs group-hover:bg-black group-hover:text-white transition-colors">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="hidden lg:flex flex-col text-left">
          <span className="verge-label-mono text-[10px] text-white leading-none group-hover:text-black">{user?.username}</span>
          <span className="verge-label-mono text-[8px] text-[#3cffd0] mt-1 group-hover:text-black/60">{user?.role}</span>
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-64 bg-[#131313] border border-white/20 rounded-[12px] z-[200] overflow-hidden"
          >
            <div className="p-5 border-b border-white/10 bg-white/5">
              <p className="verge-label-mono text-[9px] text-[#949494] mb-2">Session Active</p>
              <p className="verge-label-mono text-[11px] text-white truncate">{user?.email || user?.username}</p>
            </div>
            <div className="p-2">
              <button onClick={() => { onOpenSettings('profile'); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-[4px] verge-label-mono text-[9px] text-[#949494] hover:text-white hover:bg-white/5 transition-all">
                <Settings size={14} /> Paramètres du compte
              </button>
              <button onClick={() => { onOpenSettings('security'); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-[4px] verge-label-mono text-[9px] text-[#949494] hover:text-white hover:bg-white/5 transition-all">
                <Shield size={14} /> Sécurité & Accès
              </button>
              <div className="my-2 border-t border-white/10" />
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-[4px] verge-label-mono text-[9px] text-red-500 hover:text-white hover:bg-red-500 transition-all">
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
