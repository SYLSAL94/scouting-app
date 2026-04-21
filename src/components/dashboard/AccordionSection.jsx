import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const AccordionSection = ({ id, title, children, icon, isOpen, onToggle }) => {
  return (
    <div className="border-b border-white/5 last:border-0">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left hover:text-sky-400 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={isOpen ? "text-sky-400" : "text-[rgb(var(--text-muted))]"}>{icon}</span>
          <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
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
