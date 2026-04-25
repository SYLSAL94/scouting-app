// src/components/teambuilder/PlayerSelectionModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Search, User, Filter, Loader2 } from 'lucide-react';
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
        return normalizeString(p.name || "").includes(q) || 
               normalizeString(p.full_name || "").includes(q) ||
               normalizeString(p.last_club_name || "").includes(q);
    });

    if (!isOpen) return null;

    const getRatingColor = (val) => {
        if (val >= 70) return '#3cffd0';
        if (val >= 40) return '#facc15';
        return '#f43f5e';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
            
            <div className="relative w-full h-full md:h-auto md:max-w-2xl bg-[#131313] border md:border-white/10 md:rounded-[4px] shadow-2xl overflow-hidden flex flex-col md:max-h-[85vh]">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-center bg-[#131313]">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-[#3cffd0]" />
                            <h2 className="verge-label-mono text-xl md:text-2xl font-black uppercase tracking-tight text-white">
                                SÉLECTION : <span className="text-[#3cffd0]">{slot?.displayRole}</span>
                            </h2>
                        </div>
                        <p className="verge-label-mono text-[9px] text-[#949494] uppercase tracking-[0.3em] mt-2">
                            {slot?.positionNeeded.join(' • ')}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/5 text-[#949494] hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 md:p-6 bg-[#1a1a1a] border-b border-white/5 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#949494]" size={16} />
                        <input 
                            type="text" 
                            placeholder="RECHERCHER UN JOUEUR..."
                            className="w-full bg-[#131313] border border-white/5 rounded-[2px] py-4 pl-12 pr-4 verge-label-mono text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[#3cffd0]/50 text-white placeholder:opacity-20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex items-center gap-3 px-5 py-3 bg-[#3cffd0]/5 border border-[#3cffd0]/10 rounded-[2px] text-[#3cffd0] verge-label-mono text-[9px] font-black uppercase tracking-widest">
                        <Filter size={14} />
                        Filtres Actifs
                    </div>
                </div>

                {/* Player List */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 styled-scrollbar bg-[#131313]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-6">
                            <div className="relative">
                                <Loader2 className="w-12 h-12 text-[#3cffd0] animate-spin" />
                                <div className="absolute inset-0 bg-[#3cffd0]/10 blur-2xl rounded-full animate-pulse" />
                            </div>
                            <p className="verge-label-mono text-[10px] text-[#949494] uppercase font-black tracking-[0.4em]">Optimisation Neurale...</p>
                        </div>
                    ) : filteredPlayers.length > 0 ? (
                        filteredPlayers.map(player => {
                            const score = Number(player.note_ponderee || 0);
                            const scoreColor = getRatingColor(score);
                            return (
                                <div 
                                    key={player.id || player.player_id}
                                    onClick={() => onSelectPlayer(player)}
                                    className="group flex items-center justify-between p-4 rounded-[2px] bg-[#1a1a1a] border border-transparent hover:border-[#3cffd0]/30 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-5 min-w-0">
                                        <div className="w-14 h-14 shrink-0 rounded-[1px] bg-[#131313] overflow-hidden border border-white/5">
                                            {player.image ? (
                                                <img src={player.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/10">
                                                    <User size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="verge-label-mono font-black text-white uppercase truncate tracking-tight text-[12px] md:text-[13px]">
                                                {player.name || player.full_name}
                                            </p>
                                            <p className="verge-label-mono text-[8px] md:text-[9px] text-[#949494] uppercase tracking-widest truncate opacity-60">
                                                {player.last_club_name} • {player.competition}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="verge-label-mono text-lg md:text-2xl font-black tabular-nums leading-none" style={{ color: scoreColor }}>
                                            {score.toFixed(1)}
                                        </div>
                                        <p className="verge-label-mono text-[7px] md:text-[8px] text-[#949494] uppercase font-black tracking-widest mt-1">Impact Score</p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-20">
                            <User size={40} className="text-white" />
                            <p className="verge-label-mono text-[9px] uppercase font-black mt-4 tracking-widest">Aucun joueur éligible</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
