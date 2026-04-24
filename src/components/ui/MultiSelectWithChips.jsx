import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Check, Search } from 'lucide-react';
import { createPortal } from 'react-dom';

/**
 * MultiSelectWithChips.jsx — Version "Combobox Pro"
 * Supporte la recherche inline, la navigation au clavier (flèches + Enter) et l'auto-scroll.
 */
const MultiSelectWithChips = ({ label, options, selected = [], onChange, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownRect, setDropdownRect] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0); // Index de l'élément survolé au clavier
  
  const dropdownRef = useRef(null);
  const portalRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideTrigger = dropdownRef.current && dropdownRef.current.contains(event.target);
      const isInsidePortal = portalRef.current && portalRef.current.contains(event.target);
      if (!isInsideTrigger && !isInsidePortal) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      setDropdownRect(dropdownRef.current.getBoundingClientRect());
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const filteredOptions = (options || []).filter(opt => 
    opt && typeof opt === 'string' && opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset de l'index quand la recherche change
  useEffect(() => {
    setActiveIndex(0);
  }, [searchTerm]);

  // Auto-scroll pour la navigation clavier
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeElement = listRef.current.children[activeIndex];
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex, isOpen]);

  const toggleOption = (option) => {
    if (!option) return;
    const isSelected = selected.includes(option);
    if (isSelected) {
      onChange(selected.filter(i => i !== option));
    } else {
      onChange([...selected, option]);
    }
    setSearchTerm('');
    setActiveIndex(0);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setIsOpen(true);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[activeIndex]) {
          toggleOption(filteredOptions[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
      case 'Backspace':
        if (searchTerm === '' && selected.length > 0) {
          // Supprime le dernier chip si le champ est vide
          onChange(selected.slice(0, -1));
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="filter-group relative" ref={dropdownRef}>
      <label className="filter-label">{label}</label>
      
      <div 
        className={`min-h-[46px] p-2 bg-white/5 border rounded-2xl flex flex-wrap gap-2 cursor-text transition-all ${
          isOpen ? 'border-sky-400 ring-4 ring-sky-400/10 bg-black/20' : 'border-white/10 hover:border-white/20'
        }`}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        {selected.map(item => (
          <span key={item} className="bg-sky-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg flex items-center gap-2 shadow-lg shadow-sky-500/20 animate-in zoom-in-95 duration-200">
            {item}
            <button 
              onClick={(e) => { e.stopPropagation(); onChange(selected.filter(i => i !== item)); }} 
              className="hover:bg-white/20 rounded-md p-0.5 transition-colors"
            >
              <X size={10} />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          className="flex-1 min-w-[60px] bg-transparent border-none outline-none text-xs text-white placeholder:text-white/20 px-2"
          placeholder={selected.length === 0 ? placeholder : ""}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
        />

        <div className="flex items-center pr-2 ml-auto">
          <ChevronDown size={14} className={`text-white/20 transition-transform duration-300 ${isOpen ? 'rotate-180 text-sky-400' : ''}`} />
        </div>
      </div>

      {isOpen && dropdownRect && createPortal(
        <div 
          ref={portalRef}
          className="fixed z-[9999] bg-[#0F172A]/98 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-3xl animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            top: dropdownRect.bottom + 8,
            left: dropdownRect.left,
            width: dropdownRect.width
          }}
        >
          <div 
            ref={listRef}
            className="max-h-64 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-white/10"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <Search size={24} className="mx-auto text-white/5 mb-2" />
                <div className="text-white/20 text-[10px] uppercase font-black tracking-widest">Aucun résultat</div>
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div 
                  key={option} 
                  className={`px-6 py-3 text-xs flex items-center justify-between transition-all cursor-pointer ${
                    index === activeIndex ? 'bg-sky-500 text-white font-bold' : 
                    selected.includes(option) ? 'text-sky-400 font-black bg-sky-500/5' : 'text-white/60 hover:bg-white/5'
                  }`}
                  onClick={(e) => { e.stopPropagation(); toggleOption(option); }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className="truncate">{option}</span>
                  {selected.includes(option) && <Check size={14} className={`${index === activeIndex ? 'text-white' : 'text-sky-400'} shrink-0 ml-2`} />}
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MultiSelectWithChips;
