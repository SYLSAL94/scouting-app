import React from 'react';
import { Users, Globe, BarChart2 } from 'lucide-react';
import AccordionSection from './AccordionSection';

const FilterPanel = ({ 
  openSection, setOpenSection, 
  selectedCompetition, setSelectedCompetition, competitionsList,
  selectedPosition, setSelectedPosition, positionsList,
  minAge, setMinAge, maxAge, setMaxAge,
  minPlaytime, setMinPlaytime,
  handleResetFilters, fetchPlayers
}) => {
  return (
    <aside className="sidebar-filters w-80 shrink-0 h-fit sticky top-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2">Filters</h3>
        <button 
          onClick={handleResetFilters} 
          className="text-[10px] uppercase tracking-widest text-sky-400 hover:text-white transition-colors"
        >
          Reset all
        </button>
      </div>

      <AccordionSection 
        id="ligues" title="Leagues & Seasons" icon={<Globe size={18} />}
        isOpen={openSection === 'ligues'} onToggle={() => setOpenSection(openSection === 'ligues' ? null : 'ligues')}
      >
         <div className="filter-group mb-0">
          <label className="filter-label">Competition</label>
          <select 
            className="filter-select" 
            value={selectedCompetition} 
            onChange={e => setSelectedCompetition(e.target.value)}
          >
            <option value="">All Leagues</option>
            {competitionsList.map((comp, idx) => (<option key={idx} value={comp}>{comp}</option>))}
          </select>
        </div>
      </AccordionSection>

      <AccordionSection 
        id="positions" title="Tactical Roles" icon={<Users size={18} />}
        isOpen={openSection === 'positions'} onToggle={() => setOpenSection(openSection === 'positions' ? null : 'positions')}
      >
         <div className="filter-group mb-0">
          <label className="filter-label">Position Category</label>
          <select 
            className="filter-select" 
            value={selectedPosition} 
            onChange={e => setSelectedPosition(e.target.value)}
          >
            <option value="">All Roles</option>
            {positionsList.map((pos, idx) => (<option key={idx} value={pos}>{pos}</option>))}
          </select>
        </div>
      </AccordionSection>

      <AccordionSection 
        id="stats" title="General Criteria" icon={<BarChart2 size={18} />}
        isOpen={openSection === 'stats'} onToggle={() => setOpenSection(openSection === 'stats' ? null : 'stats')}
      >
        <div className="filter-group">
          <label className="filter-label">Age Range ({minAge} - {maxAge})</label>
          <div className="flex gap-2 items-center">
            <input type="range" min="15" max="45" value={minAge} onChange={e => setMinAge(Number(e.target.value))} className="w-full accent-sky-400"/>
            <input type="range" min="15" max="45" value={maxAge} onChange={e => setMaxAge(Number(e.target.value))} className="w-full accent-violet-400"/>
          </div>
        </div>
        <div className="filter-group mb-0">
          <label className="filter-label">Min. Playtime ({minPlaytime}%)</label>
          <input type="range" min="0" max="100" step="5" value={minPlaytime} onChange={e => setMinPlaytime(Number(e.target.value))} className="w-full accent-emerald-400"/>
        </div>
      </AccordionSection>

      <div className="mt-8">
         <button 
           className="btn btn-primary w-full py-4 uppercase font-black tracking-widest text-xs" 
           onClick={fetchPlayers}
         >
           Apply Analysis
         </button>
      </div>
    </aside>
  );
};

export default FilterPanel;
