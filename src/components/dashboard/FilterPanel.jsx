import React from 'react';
import { Users, Globe, BarChart2, Calendar, Activity, Zap } from 'lucide-react';
import AccordionSection from './AccordionSection';
import MultiSelectWithChips from '../ui/MultiSelectWithChips';
import DualRangeSlider from '../ui/DualRangeSlider';


const FilterPanel = ({ 
  openSection, setOpenSection, 
  pendingFilters, setPendingFilters,
  competitionsList, positionsList, teamsList, seasonsList, metricsList,
  handleResetFilters, handleApplyFilters, hasChanges
}) => {

  const updateFilters = (key, value) => {
    setPendingFilters(prev => ({ ...prev, [key]: value }));
  };

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



      {/* SECTION 1: PÉRIODE */}
      <AccordionSection 
        id="periode" title="Période" icon={<Calendar size={18} />}
        isOpen={openSection === 'periode'} onToggle={() => setOpenSection(openSection === 'periode' ? null : 'periode')}
      >
        <MultiSelectWithChips 
          label="Saisons" 
          options={seasonsList} 
          selected={pendingFilters.seasons} 
          onChange={(val) => updateFilters('seasons', val)}
          placeholder="Filter by season..."
        />
      </AccordionSection>

      {/* SECTION 2: ENTITÉS */}
      <AccordionSection 
        id="entites" title="Entités" icon={<Globe size={18} />}
        isOpen={openSection === 'entites'} onToggle={() => setOpenSection(openSection === 'entites' ? null : 'entites')}
      >
        <MultiSelectWithChips 
          label="Compétitions" 
          options={competitionsList} 
          selected={pendingFilters.competitions} 
          onChange={(val) => updateFilters('competitions', val)}
          placeholder="Select leagues..."
        />
        <MultiSelectWithChips 
          label="Équipes" 
          options={teamsList} 
          selected={pendingFilters.teams} 
          onChange={(val) => updateFilters('teams', val)}
          placeholder="Filter by club..."
        />
      </AccordionSection>

      {/* SECTION 3: MORPHOLOGIE */}
      <AccordionSection 
        id="morphologie" title="Morphologie" icon={<Activity size={18} />}
        isOpen={openSection === 'morphologie'} onToggle={() => setOpenSection(openSection === 'morphologie' ? null : 'morphologie')}
      >
        <DualRangeSlider 
          label="Âge" 
          min={15} max={45} 
          currentMin={pendingFilters.minAge} 
          currentMax={pendingFilters.maxAge} 
          onChange={(min, max) => {
            setPendingFilters(prev => ({ ...prev, minAge: min, maxAge: max }));
          }}
        />
        <DualRangeSlider 
          label="Taille (cm)" 
          min={140} max={210} 
          currentMin={pendingFilters.height.min} 
          currentMax={pendingFilters.height.max} 
          onChange={(min, max) => {
            updateFilters('height', { min, max });
          }}
          unit="cm"
        />
        <DualRangeSlider 
          label="Poids (kg)" 
          min={50} max={110} 
          currentMin={pendingFilters.weight.min} 
          currentMax={pendingFilters.weight.max} 
          onChange={(min, max) => {
            updateFilters('weight', { min, max });
          }}
          unit="kg"
        />
      </AccordionSection>

      {/* SECTION 4: PERFORMANCE */}
      <AccordionSection 
        id="performance" title="Performance" icon={<Zap size={18} />}
        isOpen={openSection === 'performance'} onToggle={() => setOpenSection(openSection === 'performance' ? null : 'performance')}
      >
        <MultiSelectWithChips 
          label="Postes" 
          options={positionsList} 
          selected={pendingFilters.positions} 
          onChange={(val) => updateFilters('positions', val)}
          placeholder="Tactical roles..."
        />
        <div className="filter-group">
          <label className="filter-label flex justify-between">
            <span>Playtime (%)</span>
            <span className="text-sky-400 font-mono">{pendingFilters.playtime.min}%+</span>
          </label>
          <input 
            type="range" min="0" max="100" step="5" 
            value={pendingFilters.playtime.min} 
            onChange={e => updateFilters('playtime', { ...pendingFilters.playtime, min: Number(e.target.value) })} 
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
        </div>
      </AccordionSection>

      <div className="mt-8 space-y-4">
         {hasChanges && (
           <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-400/20 text-[10px] text-sky-400 font-black uppercase tracking-widest text-center animate-pulse">
             Analyse en attente d'application
           </div>
         )}
         <button 
           className={`btn w-full py-5 rounded-2xl uppercase font-black tracking-tighter text-sm transition-all duration-300 ${hasChanges ? 'btn-primary shadow-2xl shadow-sky-500/40 translate-y-[-2px]' : 'bg-white/5 text-white/10 cursor-not-allowed'}`} 
           onClick={handleApplyFilters}
           disabled={!hasChanges}
         >
           Apply Analysis
         </button>
      </div>
    </aside>
  );
};

export default FilterPanel;
