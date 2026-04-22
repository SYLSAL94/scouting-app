import React, { useState, useEffect } from 'react';
import MultiSelectWithChips from '../ui/MultiSelectWithChips';
import { RotateCcw, Check, CalendarDays, Trophy, Users, SlidersHorizontal, Filter, Activity, TrendingUp } from 'lucide-react';

const API_BASE_URL = 'https://api-scouting.theanalyst.cloud';

/* --------------------------------------------
   Section Header Component
-------------------------------------------- */
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100/10 to-slate-200/5 border border-white/5 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
            <Icon size={14} className="text-slate-400 group-hover:text-sky-400 transition-colors" />
        </div>
        <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-white">{title}</h4>
            {subtitle && (
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{subtitle}</p>
            )}
        </div>
    </div>
);

/* --------------------------------------------
   Filter Section Wrapper
-------------------------------------------- */
const FilterSection = ({ children, className = '' }) => (
    <div className={`relative p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300 group overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="relative z-10">
            {children}
        </div>
    </div>
);

export default function RecalculationPanelWidget({ playerId, onRecalculated }) {
    const [seasonsList, setSeasonsList] = useState([]);
    const [competitionsList, setCompetitionsList] = useState([]);
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [recalcMetadata, setRecalcMetadata] = useState(null); // { populationCount, rank }

    const [filters, setFilters] = useState({
        seasons: [],
        competitions: [],
        position_category: null,
        min_age: 16,
        max_age: 45,
        min_playtime_percent: 0
    });

    // Chargement des métadonnées
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
                            <input 
                                type="number" value={filters.min_age} 
                                onChange={(e) => setFilters({...filters, min_age: parseFloat(e.target.value)})}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-2 text-xs text-white text-center focus:ring-1 focus:ring-sky-500 outline-none"
                            />
                            <span className="text-slate-600">—</span>
                            <input 
                                type="number" value={filters.max_age} 
                                onChange={(e) => setFilters({...filters, max_age: parseFloat(e.target.value)})}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-2 text-xs text-white text-center focus:ring-1 focus:ring-sky-500 outline-none"
                            />
                        </div>
                    </FilterSection>

                    {/* Temps de Jeu */}
                    <FilterSection>
                        <SectionHeader icon={SlidersHorizontal} title="Playtime %" subtitle="Seuil représentatif" />
                        <div className="relative mt-2">
                            <input 
                                type="number" value={filters.min_playtime_percent} 
                                onChange={(e) => setFilters({...filters, min_playtime_percent: parseFloat(e.target.value)})}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-2 text-xs text-white text-center focus:ring-1 focus:ring-sky-500 outline-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-black">%</span>
                        </div>
                    </FilterSection>
                </div>
            </div>

            {/* Metadata Feedback */}
            {recalcMetadata && !isRecalculating && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <h5 className="text-[11px] font-black uppercase text-emerald-400">Recalcul Actif</h5>
                        <p className="text-[10px] font-bold text-emerald-500/80 uppercase">
                            Rang : {recalcMetadata.rank} / {recalcMetadata.populationCount} joueurs
                        </p>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                >
                    <RotateCcw size={14} />
                    Reset
                </button>
                <button 
                    onClick={handleRecalculate}
                    disabled={isRecalculating}
                    className="flex-1 relative overflow-hidden bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all shadow-xl shadow-sky-500/20 text-[10px] flex items-center justify-center gap-2 group"
                >
                    {isRecalculating ? (
                        <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Calcul en cours...</span>
                        </>
                    ) : (
                        <>
                            <Check size={14} className="group-hover:scale-125 transition-transform" />
                            <span>Appliquer les filtres</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
