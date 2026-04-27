import React, { useState, useMemo, useEffect, useContext, useRef, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X as IconX, Search, Check } from 'lucide-react';

import { normalizeString } from '../../utils/stringUtils';

const normalize = normalizeString;

export const SearchableMultiSelect = ({
    placeholder = 'Rechercher…',
    options = [],
    selectedValues = [],
    onToggle,
    maxItems = 999,
    label,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
    const [menuRect, setMenuRect] = useState({ left: 0, top: 0, width: 0 });

    const MIN_CHARS_TO_SEARCH = options.length >= 500 ? 3 : 0;

    const updateMenuRect = useCallback(() => {
        if (wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            setMenuRect({
                left: rect.left,
                top: rect.bottom,
                width: rect.width,
            });
        }
    }, []);

    useLayoutEffect(() => {
        if (isOpen) {
            updateMenuRect();
            window.addEventListener('scroll', updateMenuRect, true);
            window.addEventListener('resize', updateMenuRect);
            return () => {
                window.removeEventListener('scroll', updateMenuRect, true);
                window.removeEventListener('resize', updateMenuRect);
            };
        }
    }, [isOpen, updateMenuRect]);

    // Ref for the menu portal
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isOpen &&
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target) &&
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);


    const optionByValue = useMemo(() => {
        const map = new Map();
        for (const o of options) map.set(o.value, o);
        return map;
    }, [options]);

    const displayOf = (opt) => {
        if (!opt) return '';
        return opt.name || opt.label || opt.full_name || String(opt.value ?? '');
    };

    const filteredOptions = useMemo(() => {
        if (searchTerm.length < MIN_CHARS_TO_SEARCH) return [];

        const q = normalize(searchTerm);

        return options.filter((opt) => {
            if (selectedValues.length >= maxItems && !selectedValues.includes(opt.value)) return false;
            if (selectedValues.includes(opt.value)) return false;

            const visible = normalize(displayOf(opt)).includes(q);

            const altStrings = [
                opt.label,
                opt.name,
                opt.full_name,
                ...(Array.isArray(opt.aliases) ? opt.aliases : []),
                ...(Array.isArray(opt.searchAliases) ? opt.searchAliases : []),
                ...(Array.isArray(opt.__aliases) ? opt.__aliases : []),
            ].filter(Boolean);

            const alt = altStrings.some((s) => normalize(s).includes(q));

            return visible || alt;
        });
    }, [options, selectedValues, searchTerm, maxItems, MIN_CHARS_TO_SEARCH]);

    const handleToggle = (val) => {
        if (typeof onToggle === 'function') onToggle(val);
        setSearchTerm('');
        // Garder le menu ouvert et redonner le focus à l'input
        // pour permettre de continuer la sélection
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    const handleRemove = (val) => {
        if (typeof onToggle === 'function') onToggle(val);
    };

    return (
        <div className="relative group" ref={wrapperRef}>
            {label ? <label className="verge-label-mono text-[10px] font-black text-secondary-text tracking-[0.2em] mb-3 block">{label}</label> : null}

            <div className={`
                relative rounded-[2px] border transition-all duration-200
                ${isOpen
                    ? 'bg-surface-slate border-jelly-mint/50 shadow-[0_0_20px_rgba(60,255,208,0.1)]'
                    : 'bg-canvas-black border-hazard-white/10 hover:border-hazard-white/20'
                }
            `}>
                {/* Selected Chips */}
                {selectedValues.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 border-b border-hazard-white/5 max-h-40 overflow-y-auto styled-scrollbar">
                        {selectedValues.map((val) => {
                            const opt = optionByValue.get(val);
                            const text = displayOf(opt) || String(val);
                            return (
                                <span
                                    key={val}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[1px] verge-label-mono text-[10px] font-black bg-jelly-mint text-absolute-black shadow-[0_0_10px_rgba(60,255,208,0.2)]"
                                    title={text}
                                >
                                    {text.toUpperCase()}
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(val)}
                                        className="p-0.5 hover:bg-absolute-black/20 transition-colors"
                                        aria-label={`Retirer ${text}`}
                                    >
                                        <IconX size={12} strokeWidth={3} />
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Search Input */}
                <div className="relative flex items-center px-4 py-3">
                    <Search size={16} className={`mr-3 transition-colors ${isOpen ? 'text-jelly-mint' : 'text-secondary-text'}`} />
                    <input
                        ref={inputRef}
                        className="w-full bg-transparent verge-label-mono text-[11px] font-black text-hazard-white placeholder-[#949494]/40 focus:outline-none uppercase tracking-tight"
                        placeholder={selectedValues.length === 0 ? placeholder.toUpperCase() : "AJOUTER..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                    />
                </div>
            </div>

            {/* Dropdown Menu via Portal */}
            {isOpen && createPortal(
                <div
                    ref={menuRef}
                    className="fixed z-[100000] mt-2 max-h-80 overflow-auto rounded-[2px] border border-jelly-mint/30 bg-surface-slate shadow-[0_30px_90px_rgba(0,0,0,0.8)] styled-scrollbar"
                    style={{
                        left: menuRect.left,
                        top: menuRect.top,
                        width: menuRect.width,
                    }}
                >
                    {searchTerm.length < MIN_CHARS_TO_SEARCH ? (
                        <div className="px-5 py-4 verge-label-mono text-[10px] text-secondary-text text-center italic tracking-widest">
                            TAPEZ AU MOINS {MIN_CHARS_TO_SEARCH} CARACTÈRE(S)…
                        </div>
                    ) : filteredOptions.length === 0 ? (
                        <div className="px-5 py-4 verge-label-mono text-[10px] text-secondary-text text-center italic tracking-widest">AUCUN RÉSULTAT TROUVÉ</div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {filteredOptions.map((opt) => {
                                const text = displayOf(opt);
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleToggle(opt.value)}
                                        className="w-full text-left px-4 py-3 verge-label-mono text-[10px] font-black rounded-[1px] transition-all hover:bg-jelly-mint hover:text-absolute-black text-secondary-text flex items-center justify-between group/item uppercase"
                                        title={text}
                                    >
                                        <span className="truncate">{text}</span>
                                        <span className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <Check size={14} />
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
};

export default SearchableMultiSelect;
