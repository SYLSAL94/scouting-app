// src/components/teambuilder/PlayerSelectionModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Search, User, Filter } from 'lucide-react';
import { normalizeString } from '../../utils/stringUtils';

export default function PlayerSelectionModal({ isOpen, onClose, onSelectPlayer, slot, activeFilters }) {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!isOpen || !slot) return;

        setLoading(true);
        const posStr = slot.positionNeeded.join(',');
        
        let url = `https://api-scouting.theanalyst.cloud/api/teambuilder/eligible-players?positions=${encodeURIComponent(posStr)}`;
        
        // Injection des filtres actifs
        if (activeFilters.competitions?.length > 0) url += `&competitions=${encodeURIComponent(activeFilters.competitions.join(','))}`;
        if (activeFilters.seasons?.length > 0) url += `&seasons=${encodeURIComponent(activeFilters.seasons.join(','))}`;
        if (activeFilters.teams?.length > 0) url += `&teams=${encodeURIComponent(activeFilters.teams.join(','))}`;
        if (activeFilters.minAge) url += `&min_age=${activeFilters.minAge}`;
        if (activeFilters.maxAge) url += `&max_age=${activeFilters.maxAge}`;
        if (activeFilters.minMinutes) url += `&min_minutes=${activeFilters.minMinutes}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setPlayers(data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching eligible players:", err);
                setLoading(false);
            });
    }, [isOpen, slot, activeFilters]);

    const filteredPlayers = players.filter(p => {
        const q = normalizeString(searchTerm);
        return normalizeString(p.name).includes(q) || 
               normalizeString(p.full_name).includes(q) ||
               normalizeString(p.last_club_name).includes(q);
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            
            <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">
                            Sélection : <span className="text-sky-400">{slot?.displayRole}</span>
                        </h2>
                        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                            {slot?.positionNeeded.join(' • ')}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 bg-black/20 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Rechercher un joueur..."
                            className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-sky-500/50 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400 text-xs font-bold uppercase">
                        <Filter size={14} />
                        Filtres Actifs
                    </div>
                </div>

                {/* Player List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-slate-500 uppercase font-bold tracking-widest">Calcul de compatibilité...</p>
                        </div>
                    ) : filteredPlayers.length > 0 ? (
                        filteredPlayers.map(player => (
                            <div 
                                key={player.id}
                                onClick={() => onSelectPlayer(player)}
                                className="group flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden border border-white/10">
                                        {player.image ? (
                                            <img src={player.image} alt="" className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                                                <User size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-200 group-hover:text-white transition-colors">
                                            {player.name || player.full_name}
                                        </p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                                            {player.last_club_name} • {player.competition}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-emerald-400">
                                        {Number(player.note_ponderee || 0).toFixed(1)}
                                    </div>
                                    <p className="text-[9px] text-slate-500 uppercase font-bold">Impact Score</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-slate-500 italic">Aucun joueur éligible trouvé pour ces critères.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
