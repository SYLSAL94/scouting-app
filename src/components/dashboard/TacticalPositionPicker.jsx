import React from 'react';
import { motion } from 'framer-motion';

const ZONES = [
  { id: 1, label: 'GK', top: '85%', left: '50%', codes: ['GK'] },
  { id: 2, label: 'CB', top: '72%', left: '50%', codes: ['CB', 'RCB', 'LCB', 'RCB3', 'LCB3'] },
  { id: 3, label: 'LB', top: '68%', left: '15%', codes: ['LB', 'LWB', 'LB5'] },
  { id: 4, label: 'RB', top: '68%', left: '85%', codes: ['RB', 'RWB', 'RB5'] },
  { id: 5, label: 'DM', top: '58%', left: '50%', codes: ['DMF', 'RDMF', 'LDMF'] },
  { id: 6, label: 'LM', top: '45%', left: '15%', codes: ['LCMF', 'LCMF3'] },
  { id: 7, label: 'RM', top: '45%', left: '85%', codes: ['RCMF', 'RCMF3'] },
  { id: 8, label: 'CM', top: '45%', left: '50%', codes: ['CMF', 'LCMF', 'RCMF'] },
  { id: 9, label: 'AM', top: '32%', left: '50%', codes: ['AMF', 'LAMF', 'RAMF'] },
  { id: 10, label: 'LW', top: '20%', left: '15%', codes: ['LW', 'LWF'] },
  { id: 11, label: 'RW', top: '20%', left: '85%', codes: ['RW', 'RWF'] },
  { id: 12, label: 'ST', top: '10%', left: '50%', codes: ['CF', 'SS'] },
];

const TacticalPositionPicker = ({ selectedPositions, onChange }) => {
  const togglePosition = (codes) => {
    // Si tous les codes de la zone sont déjà sélectionnés, on les retire
    const allSelected = codes.every(c => selectedPositions.includes(c));
    if (allSelected) {
      onChange(selectedPositions.filter(p => !codes.includes(p)));
    } else {
      // Sinon on ajoute uniquement ceux qui manquent
      const newItems = codes.filter(c => !selectedPositions.includes(c));
      onChange([...selectedPositions, ...newItems]);
    }
  };

  return (
    <div className="relative w-full aspect-[3/4] bg-[#131313] border border-white/10 rounded-[4px] overflow-hidden p-4">
      {/* Pitch Lines */}
      <div className="absolute inset-4 border border-white/5 rounded-[4px] pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/6 border-b border-x border-white/5" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1/6 border-t border-x border-white/5" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 aspect-square border border-white/5 rounded-full" />
      </div>

      <div className="relative w-full h-full">
        {ZONES.map((zone) => {
          const isActive = zone.codes.every(c => selectedPositions.includes(c));
          const isPartiallyActive = zone.codes.some(c => selectedPositions.includes(c)) && !isActive;
          return (
            <motion.button
              key={zone.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => togglePosition(zone.codes)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 md:w-10 h-8 md:h-10 rounded-[2px] border flex items-center justify-center transition-all duration-300 ${
                isActive 
                ? 'bg-[#3cffd0] border-[#3cffd0] text-black shadow-[0_0_20px_rgba(60,255,208,0.2)]' 
                : isPartiallyActive
                ? 'bg-[#3cffd0]/30 border-[#3cffd0]/50 text-white border-dashed'
                : 'bg-[#2d2d2d] border-white/10 text-[#949494] hover:border-white/30 hover:bg-white hover:text-black'
              }`}
              style={{ top: zone.top, left: zone.left }}
            >
              <span className="verge-label-mono text-[8px] md:text-[10px]">{zone.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Legend / Tip */}
      <div className="absolute bottom-4 left-0 w-full text-center">
        <p className="verge-label-mono text-[8px] text-white/20">Select tactical zones</p>
      </div>
    </div>
  );
};

export default TacticalPositionPicker;
