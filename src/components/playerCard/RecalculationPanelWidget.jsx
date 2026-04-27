import React, { useState, useEffect } from 'react';
import MultiSelectWithChips from '../ui/MultiSelectWithChips';
import { RotateCcw, Check, CalendarDays, Trophy, Users, SlidersHorizontal, Filter, Activity, TrendingUp } from 'lucide-react';

const API_BASE_URL = 'https://api-scouting.theanalyst.cloud';

/* --------------------------------------------
   Section Header Component
 -------------------------------------------- */
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-9 h-9 rounded-[8px] bg-surface-slate border border-hazard-white/5">
            <Icon size={16} className="text-secondary-text" />
        </div>
        <div className="flex flex-col">
            <h4 className="verge-label-mono text-[10px] uppercase font-black tracking-widest text-hazard-white leading-none mb-1">{title}</h4>
            {subtitle && (
                <p className="verge-label-mono text-[7px] text-secondary-text uppercase tracking-wider font-black">{subtitle}</p>
            )}
        </div>
    </div>
);

/* --------------------------------------------
   Filter Section Wrapper
 -------------------------------------------- */
const FilterSection = ({ children, className = '' }) => (
    <div className={`relative p-6 rounded-[4px] bg-surface-slate/30 border border-hazard-white/5 hover:border-hazard-white/10 transition-all duration-300 group overflow-hidden ${className}`}>
        <div className="relative z-10">
            {children}
        </div>
    </div>
);

export default function RecalculationPanelWidget({ playerId, onRecalculated }) {
    const [seasonsList, setSeasonsList] = useState([]);
    const [competitionsList, setCompetitionsList] = useState([]);
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [recalcMetadata, setRecalcMetadata] = useState(null); 

    const [filters, setFilters] = useState({
        seasons: [],
        competitions: [],
        position_category: null,
        min_age: 16,
        max_age: 45,
        min_playtime_percent: 0
    });

    useEffect(() => {
        if (!playerId) return;
        fetch(`${API_BASE_URL}/api/meta/seasons`).then(res => res.json()).then(data => setSeasonsList(data));
        fetch(`${API_BASE_URL}/api/meta/competitions`).then(res => res.json()).then(data => setCompetitionsList(data));
    }, [playerId]);

    const handleRecalculate = async () => {
        setIsRecalculating(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/players/${playerId}/recalculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters)
            });
            const data = await res.json();
            
            if (res.ok && data.recordToDisplay) {
                setRecalcMetadata({
                    populationCount: data.populationCount,
                    rank: data.rank
                });
                if (onRecalculated) {
                    onRecalculated(data);
                }
            }
        } catch (err) {
            console.error("Recalculation error:", err);
        } finally {
            setIsRecalculating(false);
        }
    };

    const handleReset = () => {
        setFilters({
            seasons: [],
            competitions: [],
            position_category: null,
            min_age: 16,
            max_age: 45,
            min_playtime_percent: 0
        });
        setRecalcMetadata(null);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
                {/* Saisons */}
                <FilterSection>
                    <SectionHeader icon={CalendarDays} title="Saisons" subtitle={`${filters.seasons.length} sélection(s)`} />
                    <MultiSelectWithChips 
                        options={seasonsList}
                        selected={filters.seasons}
                        onChange={(val) => setFilters({...filters, seasons: val})}
                        placeholder="Ex: 2023/2024"
                    />
                </FilterSection>

                {/* Compétitions */}
                <FilterSection>
                    <SectionHeader icon={Trophy} title="Compétitions" subtitle="Filtre géographique" />
                    <MultiSelectWithChips 
                        options={competitionsList}
                        selected={filters.competitions}
                        onChange={(val) => setFilters({...filters, competitions: val})}
                        placeholder="Ex: Premier League"
                    />
                </FilterSection>

                <div className="grid grid-cols-2 gap-4">
                    {/* Âge */}
                    <FilterSection>
                        <SectionHeader icon={Filter} title="Âge" subtitle="Min/Max" />
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 bg-canvas-black border border-hazard-white/10 rounded-[8px] p-2 flex items-center justify-center">
                                <input 
                                    type="number" value={filters.min_age} 
                                    onChange={(e) => setFilters({...filters, min_age: parseFloat(e.target.value)})}
                                    className="w-full bg-transparent verge-label-mono text-[11px] text-hazard-white text-center outline-none font-black"
                                />
                            </div>
                            <span className="text-secondary-text text-xs">—</span>
                            <div className="flex-1 bg-canvas-black border border-hazard-white/10 rounded-[8px] p-2 flex items-center justify-center">
                                <input 
                                    type="number" value={filters.max_age} 
                                    onChange={(e) => setFilters({...filters, max_age: parseFloat(e.target.value)})}
                                    className="w-full bg-transparent verge-label-mono text-[11px] text-hazard-white text-center outline-none font-black"
                                />
                            </div>
                        </div>
                    </FilterSection>

                    {/* Temps de Jeu */}
                    <FilterSection>
                        <SectionHeader icon={SlidersHorizontal} title="Playtime %" subtitle="Seuil représentatif" />
                        <div className="relative mt-2 flex items-center justify-center bg-canvas-black border border-hazard-white/10 rounded-[8px] p-2">
                            <input 
                                type="number" value={filters.min_playtime_percent} 
                                onChange={(e) => setFilters({...filters, min_playtime_percent: parseFloat(e.target.value)})}
                                className="w-full bg-transparent verge-label-mono text-[11px] text-hazard-white text-center outline-none font-black"
                            />
                            <span className="verge-label-mono text-[9px] text-secondary-text font-black ml-1">%</span>
                        </div>
                    </FilterSection>
                </div>
            </div>

            {/* Metadata Feedback */}
            {recalcMetadata && !isRecalculating && (
                <div className="p-5 rounded-[12px] bg-jelly-mint/10 border border-jelly-mint/20 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[4px] bg-jelly-mint flex items-center justify-center text-absolute-black">
                        <TrendingUp size={18} />
                    </div>
                    <div>
                        <h5 className="verge-label-mono text-[10px] font-black uppercase text-jelly-mint tracking-widest">Calcul Contextuel Terminé</h5>
                        <p className="verge-label-mono text-[8px] text-jelly-mint/80 uppercase font-black mt-0.5">
                            Rang Estimé : {recalcMetadata.rank} sur {recalcMetadata.populationCount}
                        </p>
                    </div>
                </div>
            )}

            {/* Actions Section matching Screenshot */}
            <div className="flex items-center gap-5 pt-6 border-t border-hazard-white/5">
                <button 
                    onClick={handleReset}
                    className="flex items-center gap-2.5 px-2 hover:text-hazard-white transition-colors group"
                >
                    <RotateCcw size={16} className="text-secondary-text group-hover:rotate-[-45deg] transition-transform" />
                    <span className="verge-label-mono text-[10px] font-black uppercase tracking-widest text-secondary-text">Reset</span>
                </button>
                
                <button 
                    onClick={handleRecalculate}
                    disabled={isRecalculating}
                    className={`flex-1 relative overflow-hidden flex items-center justify-center gap-3 py-4 px-8 rounded-full transition-all duration-500 ${
                        isRecalculating 
                        ? 'bg-surface-slate text-secondary-text cursor-not-allowed' 
                        : 'bg-jelly-mint text-absolute-black hover:bg-hazard-white shadow-[0_0_30px_rgba(60,255,208,0.2)]'
                    }`}
                >
                    {isRecalculating ? (
                        <>
                            <div className="w-4 h-4 border-2 border-secondary-text border-t-transparent rounded-full animate-spin" />
                            <span className="verge-label-mono text-[10px] font-black uppercase tracking-widest">Calcul en cours...</span>
                        </>
                    ) : (
                        <>
                            <Check size={18} className="font-black" />
                            <span className="verge-label-mono text-[11px] font-black uppercase tracking-widest">Appliquer les filtres</span>
                        </>
                    )}
                    
                    {!isRecalculating && (
                        <div className="absolute inset-0 bg-hazard-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    )}
                </button>
            </div>
        </div>
    );
}
