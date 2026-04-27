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
    <div className="w-8 h-8 md:w-10 md:h-10 bg-jelly-mint text-absolute-black flex items-center justify-center text-[10px] md:text-xs font-black rounded-[4px] shadow-[3px_3px_0px_rgba(60,255,208,0.2)] md:shadow-[4px_4px_0px_rgba(60,255,208,0.2)]">
      {rank}
    </div>
  );
  if (rank <= 3) return (
    <div className="w-8 h-8 md:w-10 md:h-10 bg-verge-ultraviolet text-hazard-white flex items-center justify-center text-[10px] md:text-xs font-black rounded-[4px] shadow-[3px_3px_0px_rgba(82,0,255,0.2)] md:shadow-[4px_4px_0px_rgba(82,0,255,0.2)]">
      {rank}
    </div>
  );
  return (
    <div className="w-8 h-8 md:w-10 md:h-10 bg-surface-slate text-secondary-text flex items-center justify-center text-[10px] md:text-xs font-black rounded-[4px] border border-hazard-white/5">
      {rank}
    </div>
  );
};

const RankingTable = ({ 
  players, loading, error, currentPage, pageSize, totalPlayers, totalPages,
  setCurrentPage, handlePlayerClick, selectedSortBy,
  selectedPlayersToCompare = [], setSelectedPlayersToCompare,
  metricsList, onSortChange, useSeasonAge, hideSortBar = false
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
        <div className="w-12 h-12 border-2 border-jelly-mint border-t-transparent rounded-full animate-spin mb-6" />
        <p className="verge-label-mono text-[9px] text-secondary-text">Fetching Population Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-red-400 text-center">
        <div className="bg-canvas-black p-10 border border-red-500/20 rounded-[24px]">
          <h3 className="verge-h3 text-red-500 mb-4 uppercase">API Error</h3>
          <p className="verge-label-mono text-[10px] opacity-60">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 flex-1 min-h-0 bg-canvas-black border border-hazard-white/10 rounded-[4px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
      {/* Control Bar - Sharp Technical Integration */}
      {!hideSortBar && (
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 md:gap-6 bg-surface-slate p-4 md:p-6 border-b border-hazard-white/10 shrink-0">
        <div className="flex items-center gap-6 flex-1">
          <div className="w-1 h-6 bg-jelly-mint" />
          <span className="verge-label-mono text-[11px] font-black text-hazard-white uppercase tracking-[0.2em] whitespace-nowrap">Order By</span>
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
      )}

      <div className="ranking-table-container flex-1 overflow-hidden bg-canvas-black flex flex-col relative">
        {/* Decorative corner markers */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-hazard-white/5 pointer-events-none" />
        
        <div className="flex-1 overflow-auto styled-scrollbar">
          <table className="ranking-table w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-[#1a1a1a] sticky top-0 z-20 border-b border-hazard-white/10">
                <th className="hidden md:table-cell p-3 w-12 text-center verge-label-mono text-[9px] font-black uppercase tracking-widest text-secondary-text">Vs</th>
                <th className="p-3 w-16 md:w-20 text-center verge-label-mono text-[9px] font-black uppercase tracking-widest text-secondary-text">Rank</th>
                <th className="p-3 md:p-6 text-left verge-label-mono text-[9px] font-black uppercase tracking-widest text-secondary-text w-48 md:w-80">Player Profile</th>
                <th className="hidden lg:table-cell p-6 w-24 text-center verge-label-mono text-[9px] font-black uppercase tracking-widest text-secondary-text">Season</th>
                <th className="hidden xl:table-cell p-6 w-40 text-left verge-label-mono text-[9px] font-black uppercase tracking-widest text-secondary-text">Context</th>
                <th className="hidden md:table-cell p-6 w-32 md:w-40 text-left verge-label-mono text-[9px] font-black uppercase tracking-widest text-secondary-text">Team</th>
                <th className="hidden md:table-cell p-6 w-28 md:w-32 text-left verge-label-mono text-[9px] font-black uppercase tracking-widest text-secondary-text">Position</th>
                <th className="hidden md:table-cell p-3 md:p-6 w-16 text-center verge-label-mono text-[9px] font-black uppercase tracking-widest text-secondary-text">Age</th>
                <th className="p-3 md:p-6 text-right verge-label-mono text-[9px] font-black uppercase tracking-widest text-jelly-mint w-24 md:w-36">
                  {selectedSortBy === 'custom_score' ? 'LAB' :
                   selectedSortBy === 'note_ponderee' ? 'IMPACT' : 
                   selectedSortBy === 'goals' ? 'GOALS' :
                   selectedSortBy === 'assists' ? 'ASSISTS' :
                   selectedSortBy === 'expected_goals' || selectedSortBy === 'xg_shot' ? 'XG' :
                   selectedSortBy === 'age' ? 'AGE' : 'VALUE'}
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
                    className={`group transition-all duration-300 cursor-pointer ${isSelectedForCompare ? 'bg-jelly-mint/5' : 'hover:bg-hazard-white/[0.02]'}`}
                  >
                    <td className={`hidden md:table-cell p-3 md:p-6 text-center ${isSelectedForCompare ? 'bg-jelly-mint/10' : ''}`}>
                      <input 
                        type="checkbox"
                        className="w-4 h-4 rounded-[1px] border-hazard-white/10 bg-transparent text-jelly-mint focus:ring-0 cursor-pointer accent-[#3cffd0] transition-all"
                        checked={isSelectedForCompare}
                        onChange={(e) => handleToggleCompare(e, player)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="p-3 md:p-6">
                      <div className="flex justify-center">
                        <RankBadge rank={rank} />
                      </div>
                    </td>
                    <td className="p-3 md:p-6 min-w-0">
                      <div className="flex items-center gap-3 md:gap-5">
                        <div className={`w-8 h-8 md:w-12 md:h-12 shrink-0 rounded-[1px] overflow-hidden border border-hazard-white/5 group-hover:border-jelly-mint/50 transition-all duration-500`}>
                          {player.image ? <img src={player.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" /> : <div className="w-full h-full bg-[#1a1a1a]" />}
                        </div>
                        <div className="flex flex-col min-w-0 overflow-hidden">
                          <span className="font-sans md:verge-label-mono text-[12px] md:text-[13px] font-bold md:font-black leading-tight text-hazard-white group-hover:text-jelly-mint transition-colors truncate uppercase tracking-tight">
                            {player.name || player.full_name || 'Nom inconnu'}
                            <span className="md:hidden opacity-60 ml-1">({(useSeasonAge ? player.season_age : player.age) || '—'})</span>
                          </span>
                          <span className="font-sans md:verge-label-mono text-[9px] md:text-[7px] text-secondary-text mt-0.5 md:mt-1.5 uppercase tracking-wide md:tracking-[0.2em] truncate opacity-60">
                            {player.season} • {player.competition} • {player.position_category || player.position}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell p-6 text-center verge-label-mono text-[10px] text-secondary-text font-black uppercase tracking-widest">{player.season || '—'}</td>
                    <td className="hidden md:table-cell p-6 verge-label-mono text-[9px] text-secondary-text max-w-[150px] truncate uppercase tracking-tighter opacity-60">{player.competition || '—'}</td>
                    <td className="hidden md:table-cell p-6 verge-label-mono text-[10px] text-hazard-white truncate uppercase font-black tracking-tight">{player.last_club_name || 'FREE AGENT'}</td>
                    <td className="hidden md:table-cell p-6">
                      <span className="verge-label-mono text-[8px] font-black px-2 py-1 rounded-[1px] bg-hazard-white/5 text-secondary-text border border-hazard-white/10 uppercase tracking-widest">{player.position_category || 'N/A'}</span>
                    </td>
                    <td className="hidden md:table-cell p-6 text-center verge-label-mono text-[9px] md:text-[11px] font-black text-hazard-white tabular-nums">{(useSeasonAge ? player.season_age : player.age) || '—'}</td>
                    <td className="p-3 md:p-6 text-right">
                      <div className="flex flex-col items-end">
                        <span className="verge-label-mono text-base md:text-2xl font-black text-jelly-mint leading-none tracking-tighter tabular-nums">{formattedValue}</span>
                        <span className="verge-label-mono text-[6px] font-black text-jelly-mint mt-1 tracking-widest uppercase opacity-30 hidden md:block">PRIMARY_INDEX</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination - High Density Industrial Dock */}
        <div className="px-4 md:px-8 py-4 md:py-6 border-t border-hazard-white/5 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#1a1a1a]">
          <div className="verge-label-mono text-[8px] md:text-[9px] text-secondary-text uppercase tracking-[0.1em]">
            <span className="hidden sm:inline">SHOWING </span><span className="text-hazard-white">{(currentPage - 1) * pageSize + 1}</span>-<span className="text-hazard-white">{Math.min(currentPage * pageSize, totalPlayers)}</span> OF <span className="text-jelly-mint">{totalPlayers}</span>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1} 
              className="verge-label-mono text-[9px] font-black text-hazard-white hover:text-jelly-mint disabled:opacity-5 transition-colors flex items-center gap-2 uppercase tracking-widest"
            >
              <ChevronLeft size={14} /> <span className="hidden sm:inline">PREVIOUS</span>
            </button>
            <div className="verge-label-mono text-[10px] md:text-[11px] bg-jelly-mint text-absolute-black px-4 md:px-5 py-2 md:py-2.5 rounded-[1px] font-black shadow-[0_10px_20px_rgba(60,255,208,0.2)]">
              {currentPage} / {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage >= totalPages} 
              className="verge-label-mono text-[9px] font-black text-hazard-white hover:text-jelly-mint disabled:opacity-5 transition-colors flex items-center gap-2 uppercase tracking-widest"
            >
              <span className="hidden sm:inline">NEXT</span> <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingTable;
