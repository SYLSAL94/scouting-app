import React from 'react';
import { ChevronLeft, ChevronRight, Trophy, Medal } from 'lucide-react';
import Select from 'react-select';
import { WindowedMenuList } from 'react-windowed-select';

// Helper pour trouver l'option actuelle
const findSelectedOption = (value, options = []) => {
  if (!options) return null;
  for (const group of options) {
    if (!group.options) continue;
    const found = group.options.find(opt => opt.value === value);
    if (found) return found;
  }
  return null;
};

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
  selectedPlayersToCompare = [], setSelectedPlayersToCompare,
  metricsList, onSortChange
}) => {
  const handleToggleCompare = (e, player) => {
    e.stopPropagation();
    setSelectedPlayersToCompare(prev => {
      const isSelected = prev.find(p => 
        p.id === player.id && 
        p.competition === player.competition && 
        p.season === player.season
      );
      if (isSelected) {
        return prev.filter(p => !(
          p.id === player.id && 
          p.competition === player.competition && 
          p.season === player.season
        ));
      } else {
        if (prev.length >= 2) {
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
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <span className="text-[10px] uppercase tracking-widest font-black text-sky-400/80 whitespace-nowrap">Trier par :</span>
          <div className="flex-1 md:max-w-[300px]">
            <Select 
              components={{ MenuList: WindowedMenuList }}
              options={metricsList} 
              value={findSelectedOption(selectedSortBy, metricsList)}
              onChange={(selectedOption) => onSortChange(selectedOption.value)}
              isSearchable={true}
              placeholder="Rechercher une métrique..."
              className="react-select-container"
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                control: (base) => ({
                  ...base,
                  background: 'rgba(11, 15, 25, 0.6)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: 'white',
                  minHeight: '40px',
                  fontSize: '12px'
                }),
                menu: (base) => ({
                  ...base,
                  background: '#0f172a',
                  border: '1px solid rgba(14, 165, 233, 0.2)',
                  borderRadius: '12px',
                  zIndex: 100
                }),
                option: (base, state) => ({
                  ...base,
                  background: state.isFocused ? 'rgba(14, 165, 233, 0.2)' : 'transparent',
                  color: state.isSelected ? '#38bdf8' : 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'white'
                }),
                input: (base) => ({
                  ...base,
                  color: 'white'
                }),
                placeholder: (base) => ({
                  ...base,
                  color: 'rgba(255,255,255,0.3)'
                }),
                groupHeading: (base) => ({
                   ...base,
                   color: '#38bdf8',
                   fontWeight: 'bold',
                   fontSize: '10px',
                   textTransform: 'uppercase'
                })
              }}
            />
          </div>
        </div>
      </div>

      <div className="ranking-table-container flex-1 overflow-hidden backdrop-blur-md bg-white/5 shadow-2xl border border-white/10 rounded-2xl flex flex-col">
        <div className="flex-1 overflow-auto styled-scrollbar">
          <table className="ranking-table w-full">
        <thead>
          <tr className="bg-slate-900/90 backdrop-blur-md sticky top-0 z-20 shadow-sm">
            <th className="text-center p-6 w-16 border-b border-white/10">Vs</th>
            <th className="text-center p-6 border-b border-white/10">Rank</th>
            <th className="p-6 border-b border-white/10">Player</th>
            <th className="hidden md:table-cell text-center p-6 border-b border-white/10">Saison</th>
            <th className="hidden md:table-cell p-6 border-b border-white/10">Compétition</th>
            <th className="hidden md:table-cell p-6 border-b border-white/10 text-center md:text-left">Team</th>
            <th className="hidden md:table-cell p-6 border-b border-white/10">Position</th>
            <th className="text-center p-6 border-b border-white/10">Age</th>
            <th className="hidden md:table-cell text-center p-6 border-b border-white/10">Mins</th>
            <th className="text-right p-6 border-b border-white/10">
              {selectedSortBy === 'custom_score' ? 'Score Lab' :
               selectedSortBy === 'note_ponderee' ? 'Impact Score' : 
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
            
            // Clé composite unique pour identifier la ligne (Joueur + Contexte)
            const rowKey = `${player.id}-${player.competition}-${player.season}`;
            
            // Valeur dynamique basée sur la métrique avec formateur robuste
            const rawValue = player[selectedSortBy];
            let formattedValue = "-";
            if (rawValue !== undefined && rawValue !== null && rawValue !== "") {
                const num = Number(rawValue);
                // Force l'arrondi à 2 décimales si c'est un flottant, sinon garde l'entier ou le texte
                formattedValue = isNaN(num) ? rawValue : (num % 1 === 0 ? num : num.toFixed(2));
            }

            const isSelectedForCompare = selectedPlayersToCompare.some(p => 
                p.id === player.id && 
                p.competition === player.competition && 
                p.season === player.season
            );

            return (
              <tr 
                key={rowKey} 
                onClick={() => handlePlayerClick(player)} 
                style={{ cursor: 'pointer' }}
                className={`transition-all duration-200 group ${isSelectedForCompare ? 'bg-sky-500/10' : 'hover:bg-white/5'}`}
              >
                <td className="text-center p-4">
                  <div className="flex justify-center items-center">
                    <input 
                      type="checkbox"
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900 cursor-pointer accent-sky-500"
                      checked={isSelectedForCompare}
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
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-white/5 border border-white/10 group-hover:border-sky-500/50 transition-colors">
                      {player.image ? <img src={player.image} alt="" className="w-full h-full object-cover" /> : null}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold group-hover:text-sky-400 transition-colors text-sm md:text-base">{player.name || player.full_name || 'Nom inconnu'}</span>
                      <span className="md:hidden text-[10px] text-[rgb(var(--text-muted))] uppercase">{player.last_club_name}</span>
                    </div>
                  </div>
                </td>
                <td className="hidden md:table-cell text-center text-[rgb(var(--text-muted))]">{player.season || '—'}</td>
                <td className="hidden md:table-cell text-[rgb(var(--text-muted))]">{player.competition || '—'}</td>
                <td className="hidden md:table-cell text-[rgb(var(--text-muted))]">{player.last_club_name || 'Équipe inconnue'}</td>
                <td className="hidden md:table-cell"><span className="px-2 py-0.5 rounded bg-white/5 text-xs border border-white/5">{player.position_category || 'Non renseigné'}</span></td>
                <td className="text-center font-bold md:font-normal">{player.age || '—'}</td>
                <td className="hidden md:table-cell text-center text-[rgb(var(--text-muted))] text-xs font-mono">{player.minutes_on_field || 0}'</td>
                <td className="text-right font-mono font-black text-sky-400 text-base md:text-lg">{formattedValue}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
        </div>
      </div>

      <div className="p-4 border-t border-white/5 flex items-center justify-between sticky bottom-0 bg-[rgba(11,15,25,0.95)] backdrop-blur shrink-0">
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
            Page {currentPage} {" / "} {totalPages}
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
