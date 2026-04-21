import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';

import { createPortal } from 'react-dom';

const MultiSelectWithChips = ({ label, options, selected = [], onChange, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownRect, setDropdownRect] = useState(null);
  const dropdownRef = useRef(null);
  const portalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideTrigger = dropdownRef.current && dropdownRef.current.contains(event.target);
      const isInsidePortal = portalRef.current && portalRef.current.contains(event.target);
      
      if (!isInsideTrigger && !isInsidePortal) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      setDropdownRect(dropdownRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  const toggleOption = (e, option) => {
    e.preventDefault();
    e.stopPropagation();
    const isSelected = selected.includes(option);
    if (isSelected) {
      onChange(selected.filter(i => i !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeOption = (e, option) => {
    e.stopPropagation();
    onChange(selected.filter(i => i !== option));
  };

  return (
    <div className="filter-group relative" ref={dropdownRef}>
      <label className="filter-label">{label}</label>
      <div 
        className={`min-h-[42px] p-2 bg-white/5 border rounded-xl flex flex-wrap gap-1.5 cursor-pointer transition-all ${isOpen ? 'border-sky-400 ring-4 ring-sky-400/10' : 'border-white/10 hover:border-white/20'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length === 0 ? (
          <span className="text-white/30 text-xs px-2 py-1">{placeholder}</span>
        ) : (
          selected.map(item => (
            <span key={item} className="bg-sky-500/20 text-sky-400 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-sky-400/30">
              {item}
              <X size={12} className="hover:text-white" onClick={(e) => removeOption(e, item)} />
            </span>
          ))
        )}
        <ChevronDown size={14} className={`ml-auto self-center text-white/20 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && dropdownRect && createPortal(
        <div 
          ref={portalRef}
          className="fixed z-[999] py-2 bg-[#0F172A] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            top: dropdownRect.bottom + 8,
            left: dropdownRect.left,
            width: dropdownRect.width
          }}
        >
          {options.length === 0 ? (
            <div className="px-4 py-2 text-white/30 text-xs italic">No options available</div>
          ) : (
            options.map(option => (
              <div 
                key={option} 
                className={`px-4 py-2 text-xs flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer ${selected.includes(option) ? 'text-sky-400 font-bold' : 'text-white/70'}`}
                onClick={(e) => toggleOption(e, option)}
              >
                {option}
                {selected.includes(option) && <Check size={14} />}
              </div>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default MultiSelectWithChips;
