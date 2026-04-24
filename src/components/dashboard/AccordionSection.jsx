import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const AccordionSection = ({ id, title, children, icon, isOpen, onToggle, badge, subtitle }) => {
  return (
    <div className="border-b border-white/5 last:border-0">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 text-left hover:text-sky-400 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={isOpen ? "text-sky-400" : "text-[rgb(var(--text-muted))]"}>{icon}</span>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
              {badge > 0 && (
                <span className="bg-sky-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg shadow-sky-500/30">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && !isOpen && (
              <span className="text-[9px] text-[rgb(var(--text-muted))] lowercase font-medium tracking-tight truncate max-w-[150px]">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="text-[rgb(var(--text-muted))]">
          <ChevronDown size={14} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0, overflow: "hidden" }} 
            animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: "visible" } }} 
            exit={{ height: 0, opacity: 0, overflow: "hidden" }}
          >
            <div className="pb-6 pt-2 h-full">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccordionSection;
