import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const RankingTable = ({ 
  players, loading, error, currentPage, pageSize, totalPlayers, totalPages,
  setCurrentPage, handlePlayerClick 
}) => {
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
    <div className="ranking-table-container">
      <table className="ranking-table">
        <thead>
          <tr>
            <th className="text-center">Rank</th>
            <th>Player</th>
            <th>Team</th>
            <th>Position</th>
            <th className="text-center">Age</th>
            <th className="text-right">Impact Score</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => {
            const globalIndex = (currentPage - 1) * pageSize + index;
            return (
              <tr 
                key={player.unique_id || globalIndex} 
                onClick={() => handlePlayerClick(player.unique_id || player.id)} 
                style={{ cursor: 'pointer' }}
                className="hover:bg-white/5 transition-colors"
              >
                <td className="text-center">
                  <div className="flex justify-center">
                    <div className={`rank-badge ${globalIndex < 3 ? `rank-${globalIndex + 1}` : ''}`}>
                      {globalIndex + 1}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 border border-white/10">
                      {player.image ? <img src={player.image} alt="" className="w-full h-full object-cover" /> : null}
                    </div>
                    <span className="font-bold">{player.full_name || player.name}</span>
                  </div>
                </td>
                <td className="text-[rgb(var(--text-muted))]">{player.last_club_name || player.team_name}</td>
                <td><span className="px-2 py-0.5 rounded bg-white/5 text-xs border border-white/5">{player.position_category || '—'}</span></td>
                <td className="text-center">{player.season_age || player.age}</td>
                <td className="text-right font-mono font-black text-sky-400">{(player.note_ponderee || 0).toFixed(1)}</td>
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
