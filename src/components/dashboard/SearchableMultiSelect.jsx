import React, { useState, useMemo, useEffect, useContext, useRef, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X as IconX, Search, Check } from 'lucide-react';

const normalize = (s) =>
    String(s ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

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
            {label ? <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{label}</label> : null}

            <div className={`
                relative rounded-xl border transition-all duration-300
                ${isOpen
                    ? 'bg-white dark:bg-slate-800 border-sky-500/50 ring-1 ring-sky-500/20 shadow-lg'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-slate-800/80'
                }
            `}>
                {/* Selected Chips */}
                {selectedValues.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 border-b border-slate-200 dark:border-white/5 max-h-32 overflow-y-auto styled-scrollbar">
                        {selectedValues.map((val) => {
                            const opt = optionByValue.get(val);
                            const text = displayOf(opt) || String(val);
                            return (
                                <span
                                    key={val}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20 shadow-sm"
                                    title={text}
                                >
                                    {text}
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(val)}
                                        className="p-0.5 rounded-md hover:bg-sky-500/20 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
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
                <div className="relative flex items-center px-3 py-2.5">
                    <Search size={16} className={`mr-2 transition-colors ${isOpen ? 'text-sky-500 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <input
                        ref={inputRef}
                        className="w-full bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                        placeholder={selectedValues.length === 0 ? placeholder : "Ajouter..."}
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
                    className="fixed z-[100000] mt-2 max-h-80 overflow-auto rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:ring-black/50 styled-scrollbar animate-in fade-in zoom-in-95 duration-100"
                    style={{
                        left: menuRect.left,
                        top: menuRect.top,
                        width: menuRect.width,
                    }}
                >
                    {searchTerm.length < MIN_CHARS_TO_SEARCH ? (
                        <div className="px-4 py-3 text-xs text-slate-500 text-center italic">
                            Tapez au moins {MIN_CHARS_TO_SEARCH} caractère(s)…
                        </div>
                    ) : filteredOptions.length === 0 ? (
                        <div className="px-4 py-3 text-xs text-slate-500 text-center italic">Aucun résultat trouvé</div>
                    ) : (
                        <div className="p-1.5 space-y-0.5">
                            {filteredOptions.map((opt) => {
                                const text = displayOf(opt);
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleToggle(opt.value)}
                                        className="w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-150 hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400 text-slate-600 dark:text-slate-300 flex items-center justify-between group/item"
                                        title={text}
                                    >
                                        <span className="truncate">{text}</span>
                                        <span className="opacity-0 group-hover/item:opacity-100 transition-opacity text-sky-500">
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
