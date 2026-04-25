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
  if (rank === 1) return (
    <div className="w-10 h-10 bg-[#3cffd0] text-black flex items-center justify-center text-xs font-black rounded-[4px] shadow-[4px_4px_0px_rgba(60,255,208,0.2)]">
      {rank}
    </div>
  );
  if (rank <= 3) return (
    <div className="w-10 h-10 bg-[#5200ff] text-white flex items-center justify-center text-xs font-black rounded-[4px] shadow-[4px_4px_0px_rgba(82,0,255,0.2)]">
      {rank}
    </div>
  );
  return (
    <div className="w-10 h-10 bg-[#2d2d2d] text-[#949494] flex items-center justify-center text-xs font-black rounded-[4px] border border-white/5">
      {rank}
    </div>
  );
};

const RankingTable = ({ 
  players, loading, error, currentPage, pageSize, totalPlayers, totalPages,
  setCurrentPage, handlePlayerClick, selectedSortBy,
  selectedPlayersToCompare = [], setSelectedPlayersToCompare,
  metricsList, onSortChange, useSeasonAge
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
        <div className="w-12 h-12 border-2 border-[#3cffd0] border-t-transparent rounded-full animate-spin mb-6" />
        <p className="verge-label-mono text-[9px] text-[#949494]">Fetching Population Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-red-400 text-center">
        <div className="bg-[#131313] p-10 border border-red-500/20 rounded-[24px]">
          <h3 className="verge-h3 text-red-500 mb-4 uppercase">API Error</h3>
          <p className="verge-label-mono text-[10px] opacity-60">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 flex-1 min-h-0 bg-[#131313] border border-white/10 rounded-[4px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
      {/* Control Bar - Sharp Technical Integration */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 bg-[#2d2d2d] p-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-6 flex-1">
          <div className="w-1 h-6 bg-[#3cffd0]" />
          <span className="verge-label-mono text-[11px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">Order By</span>
          <div className="flex-1 md:max-w-[420px]">
            <Select 
              components={{ MenuList: WindowedMenuList }}
              options={metricsList} 
              value={findSelectedOption(selectedSortBy, metricsList)}
              onChange={(selectedOption) => onSortChange(selectedOption.value)}
              isSearchable={true}
              placeholder="SEARCH METRICS..."
              className="react-select-container"
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                control: (base) => ({
                  ...base,
                  background: '#131313',
                  borderColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '2px',
                  color: 'white',
                  minHeight: '52px',
                  fontSize: '10px',
                  fontFamily: 'PolySans Mono, monospace',
                  textTransform: 'uppercase',
                  paddingLeft: '16px',
                  letterSpacing: '0.1em'
                }),
                menu: (base) => ({
                  ...base,
                  background: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '2px',
                  padding: '4px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                }),
                option: (base, state) => ({
                  ...base,
                  background: state.isFocused ? '#3cffd0' : 'transparent',
                  color: state.isFocused ? 'black' : state.isSelected ? '#3cffd0' : '#949494',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontFamily: 'PolySans Mono, monospace',
                  textTransform: 'uppercase',
                  borderRadius: '1px',
                  margin: '1px 0',
                  padding: '12px 16px'
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
                  color: 'rgba(255,255,255,0.2)'
                }),
                groupHeading: (base) => ({
                   ...base,
                   color: '#3cffd0',
                   fontWeight: '900',
                   fontSize: '8px',
                   fontFamily: 'PolySans Mono, monospace',
                   textTransform: 'uppercase',
                   marginBottom: '4px',
                   marginTop: '8px',
                   letterSpacing: '0.2em',
                   opacity: '0.6'
                })
              }}
            />
          </div>
        </div>
      </div>

      <div className="ranking-table-container flex-1 overflow-hidden bg-[#131313] flex flex-col relative">
        {/* Decorative corner markers */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/5 pointer-events-none" />
        
        <div className="flex-1 overflow-auto styled-scrollbar">
          <table className="ranking-table w-full border-collapse">
            <thead>
              <tr className="bg-[#1a1a1a] sticky top-0 z-20 border-b border-white/10">
                <th className="p-6 w-16 text-center verge-label-mono text-[9px] font-black uppercase tracking-widest text-[#949494]">Vs</th>
                <th className="p-6 w-20 text-center verge-label-mono text-[9px] font-black uppercase tracking-widest text-[#949494]">Rank</th>
                <th className="p-6 text-left verge-label-mono text-[9px] font-black uppercase tracking-widest text-[#949494]">Player Profile</th>
                <th className="hidden md:table-cell p-6 text-center verge-label-mono text-[9px] font-black uppercase tracking-widest text-[#949494]">Season</th>
                <th className="hidden md:table-cell p-6 text-left verge-label-mono text-[9px] font-black uppercase tracking-widest text-[#949494]">Context</th>
                <th className="hidden md:table-cell p-6 text-left verge-label-mono text-[9px] font-black uppercase tracking-widest text-[#949494]">Team</th>
                <th className="hidden md:table-cell p-6 text-left verge-label-mono text-[9px] font-black uppercase tracking-widest text-[#949494]">Position</th>
                <th className="p-6 text-center verge-label-mono text-[9px] font-black uppercase tracking-widest text-[#949494]">Age</th>
                <th className="p-6 text-right verge-label-mono text-[9px] font-black uppercase tracking-widest text-[#3cffd0]">
                  {selectedSortBy === 'custom_score' ? 'LAB SCORE' :
                   selectedSortBy === 'note_ponderee' ? 'IMPACT SCORE' : 
                   selectedSortBy === 'goals' ? 'GOALS' :
                   selectedSortBy === 'assists' ? 'ASSISTS' :
                   selectedSortBy === 'expected_goals' ? 'XG' :
                   selectedSortBy === 'age' ? 'AGE' : 'METRIC VALUE'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {players.map((player, index) => {
                const globalIndex = (currentPage - 1) * pageSize + index;
                const rank = globalIndex + 1;
                const rowKey = `${player.id}-${player.competition}-${player.season}`;
                
                const rawValue = player[selectedSortBy];
                let formattedValue = "-";
                if (rawValue !== undefined && rawValue !== null && rawValue !== "") {
                    const num = Number(rawValue);
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
                    className={`group transition-all duration-300 cursor-pointer ${isSelectedForCompare ? 'bg-[#3cffd0]/5' : 'hover:bg-white/[0.02]'}`}
                  >
                    <td className="p-6 text-center">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 rounded-[1px] border-white/10 bg-transparent text-[#3cffd0] focus:ring-0 cursor-pointer accent-[#3cffd0] transition-all"
                        checked={isSelectedForCompare}
                        onChange={(e) => handleToggleCompare(e, player)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center">
                        <RankBadge rank={rank} />
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-[1px] overflow-hidden border border-white/5 group-hover:border-[#3cffd0]/50 transition-all duration-500`}>
                          {player.image ? <img src={player.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" /> : <div className="w-full h-full bg-[#1a1a1a]" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="verge-label-mono text-[13px] font-black leading-none text-white group-hover:text-[#3cffd0] transition-colors truncate uppercase tracking-tight">
                            {player.name || player.full_name || 'Nom inconnu'}
                          </span>
                          <span className="verge-label-mono text-[7px] text-[#949494] mt-1.5 uppercase tracking-[0.2em] truncate opacity-40">
                            {player.full_name || player.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell p-6 text-center verge-label-mono text-[10px] text-[#949494] font-black uppercase tracking-widest">{player.season || '—'}</td>
                    <td className="hidden md:table-cell p-6 verge-label-mono text-[9px] text-[#949494] max-w-[150px] truncate uppercase tracking-tighter opacity-60">{player.competition || '—'}</td>
                    <td className="hidden md:table-cell p-6 verge-label-mono text-[10px] text-white truncate uppercase font-black tracking-tight">{player.last_club_name || 'FREE AGENT'}</td>
                    <td className="hidden md:table-cell p-6">
                      <span className="verge-label-mono text-[8px] font-black px-2 py-1 rounded-[1px] bg-white/5 text-[#949494] border border-white/10 uppercase tracking-widest">{player.position_category || 'N/A'}</span>
                    </td>
                    <td className="p-6 text-center verge-label-mono text-[11px] font-black text-white tabular-nums">{(useSeasonAge ? player.season_age : player.age) || '—'}</td>
                    <td className="p-6 text-right">
                      <div className="flex flex-col items-end">
                        <span className="verge-label-mono text-xl md:text-2xl font-black text-[#3cffd0] leading-none tracking-tighter tabular-nums">{formattedValue}</span>
                        <span className="verge-label-mono text-[6px] font-black text-[#3cffd0] mt-1 tracking-widest uppercase opacity-30">PRIMARY_INDEX</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination - High Density Industrial Dock */}
        <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between bg-[#1a1a1a]">
          <div className="verge-label-mono text-[9px] text-[#949494] uppercase tracking-[0.1em]">
            SHOWING <span className="text-white">{(currentPage - 1) * pageSize + 1}</span> - <span className="text-white">{Math.min(currentPage * pageSize, totalPlayers)}</span> OF <span className="text-[#3cffd0]">{totalPlayers}</span> ENTRIES
          </div>
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1} 
              className="verge-label-mono text-[9px] font-black text-white hover:text-[#3cffd0] disabled:opacity-5 transition-colors flex items-center gap-3 uppercase tracking-widest"
            >
              <ChevronLeft size={14} /> PREVIOUS
            </button>
            <div className="verge-label-mono text-[11px] bg-[#3cffd0] text-black px-5 py-2.5 rounded-[1px] font-black shadow-[0_10px_20px_rgba(60,255,208,0.2)]">
              {currentPage} / {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage >= totalPages} 
              className="verge-label-mono text-[9px] font-black text-white hover:text-[#3cffd0] disabled:opacity-5 transition-colors flex items-center gap-3 uppercase tracking-widest"
            >
              NEXT <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingTable;
