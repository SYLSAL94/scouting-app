import React from 'react';
import { ChevronLeft, ChevronRight, Trophy, Medal } from 'lucide-react';

const RankBadge = ({ rank }) => {
  if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]" />;
  if (rank === 3) return <Medal className="w-6 h-6 text-amber-600 drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]" />;
  return (
    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-[rgb(var(--text-muted))]">
      {rank}
    </div>
  );
};

const RankingTable = ({ 
  players, loading, error, currentPage, pageSize, totalPlayers, totalPages,
  setCurrentPage, handlePlayerClick, selectedSortBy,
  selectedPlayersToCompare = [], setSelectedPlayersToCompare
}) => {
  const handleToggleCompare = (e, player) => {
    e.stopPropagation();
    setSelectedPlayersToCompare(prev => {
      const isSelected = prev.find(p => (p.id || p.unique_id) === (player.id || player.unique_id));
      if (isSelected) {
        return prev.filter(p => (p.id || p.unique_id) !== (player.id || player.unique_id));
      } else {
        if (prev.length >= 2) {
          // Replace the oldest
          return [prev[1], player];
        }
        return [...prev, player];
      }
    });
  };
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[rgb(var(--text-muted))]">Fetching metadata-filtered data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-red-400 text-center">
        <div>
          <h3 className="text-xl font-bold">API Connection Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ranking-table-container backdrop-blur-md bg-white/5 shadow-2xl border border-white/10 rounded-2xl overflow-hidden">
      <table className="ranking-table">
        <thead>
          <tr className="bg-white/5">
            <th className="text-center p-6 bg-transparent w-16">Vs</th>
            <th className="text-center p-6 bg-transparent">Rank</th>
            <th className="p-6">Player</th>
            <th className="p-6">Team</th>
            <th className="p-6">Position</th>
            <th className="text-center p-6">Age</th>
            <th className="text-center p-6">Mins</th>
            <th className="text-right p-6">
              {selectedSortBy === 'note_ponderee' ? 'Impact Score' : 
               selectedSortBy === 'goals' ? 'Goals' :
               selectedSortBy === 'assists' ? 'Assists' :
               selectedSortBy === 'expected_goals' ? 'xG' :
               selectedSortBy === 'age' ? 'Age' : 'Value'}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {players.map((player, index) => {
            const globalIndex = (currentPage - 1) * pageSize + index;
            const rank = globalIndex + 1;
            
            // Valeur dynamique basée sur la métrique avec formateur robuste
            const rawValue = player[selectedSortBy];
            let formattedValue = "-";
            if (rawValue !== undefined && rawValue !== null && rawValue !== "") {
                const num = Number(rawValue);
                // Force l'arrondi à 2 décimales si c'est un flottant, sinon garde l'entier ou le texte
                formattedValue = isNaN(num) ? rawValue : (num % 1 === 0 ? num : num.toFixed(2));
            }

            return (
              <tr 
                key={player.unique_id || globalIndex} 
                onClick={() => handlePlayerClick(player)} 
                style={{ cursor: 'pointer' }}
                className={`transition-all duration-200 group ${selectedPlayersToCompare.some(p => (p.id || p.unique_id) === (player.id || player.unique_id)) ? 'bg-sky-500/10' : 'hover:bg-white/5'}`}
              >
                <td className="text-center p-4">
                  <div className="flex justify-center items-center">
                    <input 
                      type="checkbox"
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900 cursor-pointer accent-sky-500"
                      checked={selectedPlayersToCompare.some(p => (p.id || p.unique_id) === (player.id || player.unique_id))}
                      onChange={(e) => handleToggleCompare(e, player)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </td>
                <td className="text-center p-4">
                  <div className="flex justify-center items-center">
                    <RankBadge rank={rank} />
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 border border-white/10 group-hover:border-sky-500/50 transition-colors">
                      {player.image ? <img src={player.image} alt="" className="w-full h-full object-cover" /> : null}
                    </div>
                    <span className="font-bold group-hover:text-sky-400 transition-colors">{player.name || player.full_name || 'Nom inconnu'}</span>
                  </div>
                </td>
                <td className="text-[rgb(var(--text-muted))]">{player.last_club_name || 'Équipe inconnue'}</td>
                <td><span className="px-2 py-0.5 rounded bg-white/5 text-xs border border-white/5">{player.position_category || 'Non renseigné'}</span></td>
                <td className="text-center">{player.age || '—'}</td>
                <td className="text-center text-[rgb(var(--text-muted))] text-xs font-mono">{player.minutes_on_field || 0}'</td>
                <td className="text-right font-mono font-black text-sky-400 text-lg">{formattedValue}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="p-4 border-t border-white/5 flex items-center justify-between sticky bottom-0 bg-[rgba(11,15,25,0.95)] backdrop-blur">
        <div className="text-xs text-[rgb(var(--text-muted))] lowercase">
          Showing <span className="text-white font-bold">{(currentPage - 1) * pageSize + 1}</span> - <span className="text-white font-bold">{Math.min(currentPage * pageSize, totalPlayers)}</span> of <span className="text-sky-400 font-bold">{totalPlayers}</span> results
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
            disabled={currentPage === 1} 
            className="btn btn-ghost py-1.5 px-3 text-xs disabled:opacity-20 flex items-center gap-1"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-xs font-bold text-white bg-white/10 px-3 py-1 rounded-md">
            Page {currentPage} / {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
            disabled={currentPage >= totalPages} 
            className="btn btn-ghost py-1.5 px-3 text-xs disabled:opacity-20 flex items-center gap-1"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RankingTable;
