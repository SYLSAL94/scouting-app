import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Globe, BarChart2, Calendar, Activity, Zap, Save, ChevronDown, Check, X, Filter, SlidersHorizontal } from 'lucide-react';
import AccordionSection from './AccordionSection';
import MultiSelectWithChips from '../ui/MultiSelectWithChips';
import DualRangeSlider from '../ui/DualRangeSlider';
import TacticalPositionPicker from './TacticalPositionPicker';

const ProfileSelector = ({ profiles, loadProfile, pendingFilters, onProfileSaved, onProfileDeleted }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState('');

  const handleSave = async () => {
    if (!profileName.trim()) return;
    setIsSaving(true);
    try {
      const response = await fetch('https://api-scouting.theanalyst.cloud/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_name: profileName,
          filter_config: pendingFilters
        })
      });
      const data = await response.json();
      if (data.id) {
        onProfileSaved({ id: data.id, profile_name: profileName, filter_config: pendingFilters });
        setProfileName('');
        setShowConfirm(true);
        setTimeout(() => setShowConfirm(false), 2000);
      }
    } catch (err) {
      console.error("Save profile error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!window.confirm("Supprimer ce profil d'analyse ?")) return;
    
    try {
      const response = await fetch(`https://api-scouting.theanalyst.cloud/api/profiles/${selectedId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        onProfileDeleted(parseInt(selectedId));
        setSelectedId('');
      }
    } catch (err) {
      console.error("Delete profile error:", err);
    }
  };

  return (
    <div className="mb-8 p-6 bg-[#2d2d2d] border border-white/5 rounded-[4px] overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-1">
        <label className="verge-label-mono text-[9px] text-[#3cffd0] uppercase tracking-widest font-black">Analyse Presets</label>
        {showConfirm && <span className="verge-label-mono text-[9px] text-[#3cffd0] animate-pulse">SAVED</span>}
      </div>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1 group min-w-0">
            <select 
              className="w-full bg-[#131313] border border-white/10 rounded-[2px] px-4 py-3 verge-label-mono text-[10px] text-white appearance-none outline-none focus:border-[#3cffd0] transition-all cursor-pointer truncate uppercase font-black"
              value={selectedId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedId(id);
                const profile = profiles?.find(p => p.id === parseInt(id));
                if (profile) loadProfile(profile.filter_config);
              }}
            >
              <option value="" disabled className="text-[#949494]">Charger un profil...</option>
              {profiles?.map(p => (
                <option key={p.id} value={p.id} className="bg-[#131313] text-white uppercase">{p.profile_name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#949494] pointer-events-none group-hover:text-[#3cffd0] transition-colors" size={14} />
          </div>
          {selectedId && (
            <button 
              onClick={handleDelete}
              className="w-12 h-12 flex items-center justify-center bg-[#131313] text-[#949494] border border-white/10 rounded-[2px] hover:bg-white hover:text-black transition-all shrink-0"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="bg-[#131313] rounded-[2px] border border-white/10 p-5 space-y-4">
          <span className="verge-label-mono text-[8px] text-[#949494] block uppercase tracking-widest">Nouveau Preset</span>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="NOM DU PROFIL..." 
              className="flex-1 bg-transparent border border-white/10 rounded-[2px] px-4 py-3 verge-label-mono text-[10px] text-white outline-none focus:border-[#3cffd0] transition-all min-w-0 uppercase"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
            <button 
              onClick={handleSave}
              disabled={!profileName.trim() || isSaving}
              className={`px-5 flex items-center justify-center rounded-[2px] transition-all ${
                profileName.trim() 
                ? 'bg-[#3cffd0] text-black' 
                : 'bg-white/5 text-[#949494] cursor-not-allowed border border-white/5'
              }`}
            >
              {isSaving ? <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterPanel = ({ 
  openSection, setOpenSection, 
  pendingFilters, setPendingFilters,
  competitionsList, positionsList, teamsList, seasonsList, metricsList,
  profiles, loadProfile, onProfileSaved, onProfileDeleted,
  handleResetFilters, handleApplyFilters, hasChanges
}) => {
  const defaults = {
    foot: 'all', onLoan: false, minMatches: 0, useSeasonAge: false,
    marketValue: { min: 0, max: 150000000 },
    seasons: [], competitions: [], teams: [], positions: [],
    minAge: 16, maxAge: 40,
    height: { min: 140, max: 210 },
    weight: { min: 50, max: 110 },
    playtime: { min: 0, max: 100 }
  };

  const updateFilters = (key, value) => {
    setPendingFilters(prev => ({ ...prev, [key]: value }));
  };

  const getSectionStats = (section) => {
    let count = 0;
    let parts = [];
    if (section === 'periode') {
      if (pendingFilters.seasons.length > 0) { count++; parts.push(`${pendingFilters.seasons.length} Saisons`); }
    }
    if (section === 'entites') {
      if (pendingFilters.competitions.length > 0) { count++; parts.push(`${pendingFilters.competitions.length} Ligues`); }
      if (pendingFilters.teams.length > 0) { count++; parts.push(`${pendingFilters.teams.length} Clubs`); }
    }
    if (section === 'morphologie') {
      if (pendingFilters.minAge !== defaults.minAge || pendingFilters.maxAge !== defaults.maxAge) { count++; parts.push(`Âge ${pendingFilters.minAge}-${pendingFilters.maxAge}`); }
      if (pendingFilters.useSeasonAge) { count++; parts.push('Âge Saison'); }
      if (pendingFilters.foot !== defaults.foot) { count++; parts.push(pendingFilters.foot === 'left' ? 'Gauche' : pendingFilters.foot === 'right' ? 'Droit' : '2 Pieds'); }
    }
    if (section === 'performance') {
      if (pendingFilters.positions?.length > 0) { count++; parts.push(`${pendingFilters.positions.length} Postes`); }
      if ((pendingFilters.playtime?.min || 0) > 0) { count++; parts.push(`TJ ${pendingFilters.playtime.min}%+`); }
      if (pendingFilters.minMatches > 0) { count++; parts.push(`${pendingFilters.minMatches}+ Matchs`); }
    }
    if (section === 'contrat') {
      if (pendingFilters.onLoan) { count++; parts.push('En Prêt'); }
      if ((pendingFilters.marketValue?.min || 0) > 0 || (pendingFilters.marketValue?.max || 150000000) < 150000000) { count++; parts.push(`MV Max ${Math.round((pendingFilters.marketValue?.max || 150000000)/1000000)}M€`); }
    }
    return { count, subtitle: parts.join(' · ').toUpperCase() };
  };

  return (
    <aside className="sidebar-filters w-full xl:w-[420px] shrink-0 xl:sticky xl:top-8 h-[700px] xl:h-[calc(100vh-6rem)] flex flex-col bg-[#131313] border border-white/10 rounded-[4px] overflow-hidden transition-all duration-500">
      
      {/* Header Section */}
      <div className="p-10 pb-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex flex-col">
            <h3 className="verge-h3 text-white flex items-center gap-4">
              <Zap size={22} className="text-[#3cffd0]" />
              Population
            </h3>
            <p className="verge-label-mono text-[9px] text-[#949494] mt-2 uppercase tracking-widest">Configuration de l'échantillon</p>
          </div>
          <button 
            onClick={handleResetFilters}
            className="verge-label-mono text-[10px] text-[#949494] hover:text-white uppercase font-black transition-colors"
          >
            Reset
          </button>
        </div>

        <ProfileSelector 
          profiles={profiles} 
          loadProfile={loadProfile} 
          pendingFilters={pendingFilters}
          onProfileSaved={onProfileSaved}
          onProfileDeleted={onProfileDeleted}
        />
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto p-10 pt-6 space-y-4 styled-scrollbar">
        <AccordionSection 
          id="periode" title="Période" icon={<Calendar size={18} />}
          isOpen={openSection === 'periode'} onToggle={() => setOpenSection(openSection === 'periode' ? null : 'periode')}
          badge={getSectionStats('periode').count}
          subtitle={getSectionStats('periode').subtitle}
        >
          <MultiSelectWithChips label="Saisons" options={seasonsList} selected={pendingFilters.seasons} onChange={(val) => updateFilters('seasons', val)} placeholder="Sélectionner..." />
        </AccordionSection>

        <AccordionSection 
          id="entites" title="Entités" icon={<Globe size={18} />}
          isOpen={openSection === 'entites'} onToggle={() => setOpenSection(openSection === 'entites' ? null : 'entites')}
          badge={getSectionStats('entites').count}
          subtitle={getSectionStats('entites').subtitle}
        >
          <div className="space-y-8">
            <MultiSelectWithChips label="Compétitions" options={competitionsList} selected={pendingFilters.competitions} onChange={(val) => updateFilters('competitions', val)} placeholder="Ligues..." />
            <MultiSelectWithChips label="Équipes" options={teamsList} selected={pendingFilters.teams} onChange={(val) => updateFilters('teams', val)} placeholder="Clubs..." />
          </div>
        </AccordionSection>

        <AccordionSection 
          id="morphologie" title="Morphologie" icon={<Activity size={18} />}
          isOpen={openSection === 'morphologie'} onToggle={() => setOpenSection(openSection === 'morphologie' ? null : 'morphologie')}
          badge={getSectionStats('morphologie').count}
          subtitle={getSectionStats('morphologie').subtitle}
        >
          <div className="space-y-12">
            <DualRangeSlider label="Tranche d'Âge" min={15} max={45} currentMin={pendingFilters.minAge} currentMax={pendingFilters.maxAge} onChange={(min, max) => setPendingFilters(prev => ({ ...prev, minAge: min, maxAge: max }))} />

            <div className="p-8 bg-[#2d2d2d]/50 border border-white/5 rounded-[4px] relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-[#3cffd0]/10" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                  <span className="verge-label-mono text-[10px] text-white font-black uppercase tracking-widest">Âge de Saison</span>
                  <span className="verge-label-mono text-[8px] text-[#949494] mt-1.5 uppercase tracking-wider">Basé sur l'année de saison</span>
                </div>
                <button 
                  onClick={() => updateFilters('useSeasonAge', !pendingFilters.useSeasonAge)} 
                  className={`w-12 h-6 rounded-full p-1 transition-all duration-500 relative ${pendingFilters.useSeasonAge ? 'bg-[#3cffd0]' : 'bg-[#131313]'}`}
                >
                  <div className={`w-4 h-4 rounded-full transition-transform duration-500 shadow-xl ${pendingFilters.useSeasonAge ? 'translate-x-6 bg-white' : 'translate-x-0 bg-[#2d2d2d]'}`} />
                </button>
              </div>
            </div>

            <div className="filter-group">
              <label className="verge-label-mono text-[10px] text-[#949494] mb-6 block uppercase tracking-[0.2em] font-black">Préférence Latérale</label>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { id: 'all', label: 'ALL' },
                  { id: 'right', label: 'R' },
                  { id: 'left', label: 'L' },
                  { id: 'both', label: '2P' }
                ].map((f) => (
                  <button 
                    key={f.id} 
                    onClick={() => updateFilters('foot', f.id)} 
                    className={`aspect-square rounded-[2px] verge-label-mono text-[11px] font-black uppercase transition-all duration-300 border ${
                      pendingFilters.foot === f.id 
                      ? 'bg-[#3cffd0] text-black border-[#3cffd0] shadow-[0_0_20px_rgba(60,255,208,0.3)]' 
                      : 'bg-[#2d2d2d] text-[#949494] border-white/5 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-12 pt-4">
              <DualRangeSlider label="Taille (cm)" min={140} max={210} currentMin={pendingFilters.height?.min || 140} currentMax={pendingFilters.height?.max || 210} onChange={(min, max) => updateFilters('height', { min, max })} unit="cm" />
              <DualRangeSlider label="Poids (kg)" min={50} max={110} currentMin={pendingFilters.weight?.min || 50} currentMax={pendingFilters.weight?.max || 110} onChange={(min, max) => updateFilters('weight', { min, max })} unit="kg" />
            </div>
          </div>
        </AccordionSection>

        <AccordionSection 
          id="performance" title="Performance" icon={<Zap size={18} />}
          isOpen={openSection === 'performance'} onToggle={() => setOpenSection(openSection === 'performance' ? null : 'performance')}
          badge={getSectionStats('performance').count}
          subtitle={getSectionStats('performance').subtitle}
        >
          <div className="space-y-10">
            <div className="mb-6">
              <TacticalPositionPicker 
                selectedPositions={pendingFilters.positions}
                onChange={(val) => updateFilters('positions', val)}
              />
            </div>
            
            <div className="p-10 bg-[#2d2d2d]/50 border border-white/5 rounded-[4px] space-y-12 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-[#3cffd0]/10" />
               
               <div className="filter-group">
                  <div className="flex justify-between items-center mb-6">
                    <label className="verge-label-mono text-[10px] text-white font-black uppercase tracking-widest">Temps de Jeu (%)</label>
                    <span className="verge-label-mono text-[11px] text-[#3cffd0] font-black">{(pendingFilters.playtime?.min || 0)}%+</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" step="5" 
                    value={pendingFilters.playtime?.min || 0} 
                    onChange={e => updateFilters('playtime', { ...(pendingFilters.playtime || {}), min: Number(e.target.value) })} 
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#3cffd0]" 
                  />
               </div>

               <div className="filter-group">
                  <div className="flex justify-between items-center mb-6">
                    <label className="verge-label-mono text-[10px] text-white font-black uppercase tracking-widest">Matchs Min</label>
                    <span className="verge-label-mono text-[11px] text-[#3cffd0] font-black">{pendingFilters.minMatches}+</span>
                  </div>
                  <input 
                    type="range" min="0" max="60" step="1" 
                    value={pendingFilters.minMatches} 
                    onChange={e => updateFilters('minMatches', Number(e.target.value))} 
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#3cffd0]" 
                  />
               </div>
            </div>

            <div className="pt-4">
              <MultiSelectWithChips label="Postes Additionnels" options={positionsList} selected={pendingFilters.positions} onChange={(val) => updateFilters('positions', val)} placeholder="Rechercher..." />
            </div>
          </div>
        </AccordionSection>

        <AccordionSection 
          id="contrat" title="Contrat & Valeur" icon={<BarChart2 size={18} />}
          isOpen={openSection === 'contrat'} onToggle={() => setOpenSection(openSection === 'contrat' ? null : 'contrat')}
          badge={getSectionStats('contrat').count}
          subtitle={getSectionStats('contrat').subtitle}
        >
          <div className="space-y-12 py-4">
            <div className="flex items-center justify-between p-8 bg-[#2d2d2d] rounded-[4px] border border-white/5">
              <div className="flex flex-col">
                <span className="verge-label-mono text-[11px] text-white uppercase font-black">En Prêt</span>
                <span className="verge-label-mono text-[8px] text-[#949494] mt-1 uppercase">Exclure les transferts secs</span>
              </div>
              <button onClick={() => updateFilters('onLoan', !pendingFilters.onLoan)} className={`w-12 h-6 rounded-full p-1 transition-all duration-500 ${pendingFilters.onLoan ? 'bg-[#3cffd0]' : 'bg-[#131313]'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-500 ${pendingFilters.onLoan ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <div className="px-2">
              <DualRangeSlider label="Valeur Marchande (€)" min={0} max={150000000} step={500000} currentMin={pendingFilters.marketValue?.min || 0} currentMax={pendingFilters.marketValue?.max || 150000000} onChange={(min, max) => updateFilters('marketValue', { min, max })} unit="€" />
            </div>
          </div>
        </AccordionSection>
      </div>

      {/* Footer Section */}
      <div className="p-10 bg-[#131313] border-t border-white/10">
        <button 
          onClick={handleApplyFilters} 
          disabled={!hasChanges} 
          className={`w-full py-6 rounded-[4px] flex items-center justify-center gap-4 transition-all duration-500 relative group overflow-hidden ${
            hasChanges 
            ? 'bg-[#3cffd0] text-black hover:bg-white' 
            : 'bg-white/5 text-[#949494] cursor-not-allowed border border-white/5'
          }`}
        >
          <span className="verge-label-mono text-[11px] font-black uppercase tracking-widest">Appliquer les filtres</span>
          <Check size={18} className={`${hasChanges ? 'opacity-100 scale-100' : 'opacity-0 scale-50'} transition-all duration-300`} />
        </button>
      </div>
    </aside>
  );
};

export default FilterPanel;
