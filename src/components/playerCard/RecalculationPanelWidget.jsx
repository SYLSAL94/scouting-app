import React, { useState, useEffect } from 'react';
import MultiSelectWithChips from '../ui/MultiSelectWithChips';

const API_BASE_URL = 'https://api-scouting.theanalyst.cloud';

export default function RecalculationPanelWidget({ playerId, onRecalculated }) {
    const [seasonsList, setSeasonsList] = useState([]);
    const [competitionsList, setCompetitionsList] = useState([]);
    
    const [filters, setFilters] = useState({
        seasons: [],
        competitions: [],
        positionGroup: "all",
        age: { min: 16, max: 45 },
        minPlaytimePercentage: 0
    });
    const [isRecalculating, setIsRecalculating] = useState(false);

    // Chargement des métadonnées pour les filtres (Lego Independence)
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/meta/seasons`).then(res => res.json()).then(data => setSeasonsList(data));
        fetch(`${API_BASE_URL}/api/meta/competitions`).then(res => res.json()).then(data => setCompetitionsList(data));
    }, []);

    const handleRecalculate = async () => {
        setIsRecalculating(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/players/${playerId}/recalculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters)
            });
            const data = await res.json();
            if (onRecalculated && data.recordToDisplay) {
                onRecalculated(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsRecalculating(false);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg backdrop-blur-md">
            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-1">Analyse Comparative</h3>
            <p className="text-[10px] text-slate-500 mb-6">Ajustez l'échantillon pour recalculer les percentiles de performance.</p>
            
            <div className="space-y-6">
                {/* Sélection des Saisons */}
                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Sélection des Saisons</label>
                    <MultiSelectWithChips 
                        options={seasonsList}
                        selected={filters.seasons}
                        onChange={(val) => setFilters({...filters, seasons: val})}
                        placeholder="Rechercher une saison..."
                    />
                </div>

                {/* Sélection des Compétitions */}
                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Compétitions Cibles</label>
                    <MultiSelectWithChips 
                        options={competitionsList}
                        selected={filters.competitions}
                        onChange={(val) => setFilters({...filters, competitions: val})}
                        placeholder="Rechercher une ligue..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Âge Min/Max</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" value={filters.age.min} 
                                onChange={(e) => setFilters({...filters, age: {...filters.age, min: parseInt(e.target.value)}})}
                                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-2 text-xs text-white"
                            />
                            <span className="text-slate-600">—</span>
                            <input 
                                type="number" value={filters.age.max} 
                                onChange={(e) => setFilters({...filters, age: {...filters.age, max: parseInt(e.target.value)}})}
                                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-2 text-xs text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Temps de Jeu Min</label>
                        <div className="relative">
                            <input 
                                type="number" value={filters.minPlaytimePercentage} 
                                onChange={(e) => setFilters({...filters, minPlaytimePercentage: parseInt(e.target.value)})}
                                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-2 text-xs text-white pr-8"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">%</span>
                        </div>
                    </div>
                </div>
                
                <button 
                    onClick={handleRecalculate}
                    disabled={isRecalculating}
                    className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all shadow-lg shadow-sky-500/20 text-[10px]"
                >
                    {isRecalculating ? 'Calcul en cours...' : 'Appliquer les filtres'}
                </button>
            </div>
        </div>
    );
}
