import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Check, Search, Layers } from 'lucide-react';
import { createPortal } from 'react-dom';
import { normalizeString } from '../../utils/stringUtils';

const MultiSelectWithChips = ({ label, options, selected = [], onChange, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownRect, setDropdownRect] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0); 
  
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

  const filteredOptions = (options || []).filter(opt => {
    if (!opt || typeof opt !== 'string') return false;
    return normalizeString(opt).includes(normalizeString(searchTerm));
  });

  useEffect(() => {
    setActiveIndex(0);
  }, [searchTerm]);

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
          onChange(selected.slice(0, -1));
        }
        break;
      default:
        break;
    }
  };

  const renderLabelContent = (item, isChip = false, isActive = false) => {
    const isComposite = item.startsWith('🧩');
    const cleanLabel = isComposite ? item.replace('🧩', '').trim() : item;

    if (isComposite) {
      return (
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-4 h-4 rounded-[3px] border ${
            isChip ? 'bg-black/20 border-black/10' : 
            isActive ? 'bg-black/20 border-black/20' : 'bg-[#2d2d2d] border-white/10'
          }`}>
            <Layers size={9} className={isChip || isActive ? 'text-black' : 'text-[#3cffd0]'} />
          </div>
          <span className="truncate">{cleanLabel}</span>
        </div>
      );
    }
    return <span className="truncate">{cleanLabel}</span>;
  };

  return (
    <div className="filter-group relative" ref={dropdownRef}>
      <label className="verge-label-mono text-[9px] text-[#949494] mb-3 block">{label}</label>
      
      <div 
        className={`min-h-[46px] p-2 bg-[#131313] border rounded-[2px] flex flex-wrap gap-2 cursor-text transition-all ${
          isOpen ? 'border-[#3cffd0] shadow-[0_0_15px_rgba(60,255,208,0.1)]' : 'border-white/10 hover:border-white/20'
        }`}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        {selected.map(item => (
          <span key={item} className="bg-[#3cffd0] text-black verge-label-mono text-[9px] px-2.5 py-1.5 rounded-[2px] font-black flex items-center gap-2 animate-in zoom-in-95 duration-200">
            {renderLabelContent(item, true)}
            <button 
              onClick={(e) => { e.stopPropagation(); onChange(selected.filter(i => i !== item)); }} 
              className="hover:bg-black/10 rounded-sm p-0.5 transition-colors"
            >
              <X size={10} />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          className="flex-1 min-w-[60px] bg-transparent border-none outline-none verge-label-mono text-[10px] text-white placeholder:text-[#949494] px-2 font-black"
          placeholder={selected.length === 0 ? placeholder : ""}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
        />

        <div className="flex items-center pr-2 ml-auto">
          <ChevronDown size={14} className={`text-[#949494] transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#3cffd0]' : ''}`} />
        </div>
      </div>

      {isOpen && dropdownRect && createPortal(
        <div 
          ref={portalRef}
          className="fixed z-[9999] bg-[#131313] border border-white/20 rounded-[2px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl"
          style={{
            top: dropdownRect.bottom + 8,
            left: dropdownRect.left,
            width: dropdownRect.width
          }}
        >
          <div 
            ref={listRef}
            className="max-h-64 overflow-y-auto py-2 styled-scrollbar"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <Search size={24} className="mx-auto text-white/5 mb-2" />
                <div className="verge-label-mono text-[#949494] text-[9px]">Aucun résultat</div>
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div 
                  key={option} 
                  className={`px-6 py-3 text-xs flex items-center justify-between transition-all cursor-pointer ${
                    index === activeIndex ? 'bg-[#3cffd0] text-black font-bold' : 
                    selected.includes(option) ? 'text-[#3cffd0] font-black bg-[#3cffd0]/5' : 'text-[#949494] hover:bg-white/5 hover:text-white'
                  }`}
                  onClick={(e) => { e.stopPropagation(); toggleOption(option); }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {renderLabelContent(option, false, index === activeIndex)}
                  {selected.includes(option) && <Check size={14} className={`${index === activeIndex ? 'text-black' : 'text-[#3cffd0]'} shrink-0 ml-2`} />}
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
