import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Globe, BarChart2, Calendar, Activity, Zap, Save, ChevronDown, Check, X, Filter, Coins, User, ArrowRight } from 'lucide-react';
import AccordionSection from './AccordionSection';
import MultiSelectWithChips from '../ui/MultiSelectWithChips';
import DualRangeSlider from '../ui/DualRangeSlider';

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
    <div className="mb-8 p-4 bg-[#0f172a]/60 border border-white/10 rounded-[1.5rem] backdrop-blur-xl shadow-xl overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-1">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-400/80">Analyse Presets</label>
        {showConfirm && <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1 animate-pulse"><Check size={10} /> Saved</span>}
      </div>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1 group min-w-0">
            <select 
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-[11px] text-white/70 appearance-none outline-none focus:border-sky-500/50 transition-all cursor-pointer truncate"
              value={selectedId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedId(id);
                const profile = profiles?.find(p => p.id === parseInt(id));
                if (profile) loadProfile(profile.filter_config);
              }}
            >
              <option value="" disabled>Load profile...</option>
              {profiles?.map(p => (
                <option key={p.id} value={p.id}>{p.profile_name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none group-hover:text-sky-400 transition-colors" size={12} />
          </div>
          {selectedId && (
            <button 
              onClick={handleDelete}
              className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all shrink-0"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="bg-white/5 rounded-2xl border border-white/5 p-3 space-y-2">
          <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest block">New Preset</span>
          <div className="grid grid-cols-[1fr_40px] gap-2">
            <input 
              type="text" 
              placeholder="Name..." 
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-white outline-none focus:border-sky-500/30 transition-all min-w-0"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
            <button 
              onClick={handleSave}
              disabled={!profileName.trim() || isSaving}
              className={`w-full h-full flex items-center justify-center rounded-lg transition-all ${
                profileName.trim() 
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' 
                : 'bg-white/5 text-white/10 cursor-not-allowed'
              }`}
            >
              {isSaving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import TacticalPositionPicker from './TacticalPositionPicker';

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
      if (pendingFilters.seasons.length > 0) { count++; parts.push(`${pendingFilters.seasons.length} saisons`); }
    }
    if (section === 'entites') {
      if (pendingFilters.competitions.length > 0) { count++; parts.push(`${pendingFilters.competitions.length} ligues`); }
      if (pendingFilters.teams.length > 0) { count++; parts.push(`${pendingFilters.teams.length} clubs`); }
    }
    if (section === 'morphologie') {
      if (pendingFilters.minAge !== defaults.minAge || pendingFilters.maxAge !== defaults.maxAge) { count++; parts.push(`Âge ${pendingFilters.minAge}-${pendingFilters.maxAge}`); }
      if (pendingFilters.useSeasonAge) { count++; parts.push('Âge saison'); }
      if (pendingFilters.foot !== defaults.foot) { count++; parts.push(pendingFilters.foot === 'left' ? 'Gauchers' : pendingFilters.foot === 'right' ? 'Droitiers' : '2 pieds'); }
    }
    if (section === 'performance') {
      if (pendingFilters.positions?.length > 0) { count++; parts.push(`${pendingFilters.positions.length} postes`); }
      if ((pendingFilters.playtime?.min || 0) > 0) { count++; parts.push(`TJ ${pendingFilters.playtime.min}%+`); }
      if (pendingFilters.minMatches > 0) { count++; parts.push(`${pendingFilters.minMatches}+ matchs`); }
    }
    if (section === 'contrat') {
      if (pendingFilters.onLoan) { count++; parts.push('En prêt'); }
      if ((pendingFilters.marketValue?.min || 0) > 0 || (pendingFilters.marketValue?.max || 150000000) < 150000000) { count++; parts.push(`MV max ${Math.round((pendingFilters.marketValue?.max || 150000000)/1000000)}M€`); }
    }
    return { count, subtitle: parts.join(' · ') };
  };

  return (
    <aside className="sidebar-filters w-full xl:w-[400px] shrink-0 xl:sticky xl:top-8 h-[700px] xl:h-[calc(100vh-6rem)] flex flex-col bg-[#0f172a]/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500">
      
      {/* Header Section - Fixe */}
      <div className="p-6 pb-2 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2 text-white">
              <Zap size={20} className="text-sky-400 fill-sky-400/20" />
              Scouting Engine
            </h3>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">Configuring population filters</p>
          </div>
          <button 
            onClick={handleResetFilters}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-red-500/10 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 transition-all border border-white/5"
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

      {/* Content Section - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
        <AccordionSection 
          id="periode" title="Période" icon={<Calendar size={18} />}
          isOpen={openSection === 'periode'} onToggle={() => setOpenSection(openSection === 'periode' ? null : 'periode')}
          badge={getSectionStats('periode').count}
          subtitle={getSectionStats('periode').subtitle}
        >
          <MultiSelectWithChips label="Saisons" options={seasonsList} selected={pendingFilters.seasons} onChange={(val) => updateFilters('seasons', val)} placeholder="Filter by season..." />
        </AccordionSection>

        <AccordionSection 
          id="entites" title="Entités" icon={<Globe size={18} />}
          isOpen={openSection === 'entites'} onToggle={() => setOpenSection(openSection === 'entites' ? null : 'entites')}
          badge={getSectionStats('entites').count}
          subtitle={getSectionStats('entites').subtitle}
        >
          <div className="space-y-4">
            <MultiSelectWithChips label="Compétitions" options={competitionsList} selected={pendingFilters.competitions} onChange={(val) => updateFilters('competitions', val)} placeholder="Select leagues..." />
            <MultiSelectWithChips label="Équipes" options={teamsList} selected={pendingFilters.teams} onChange={(val) => updateFilters('teams', val)} placeholder="Filter by club..." />
          </div>
        </AccordionSection>

        <AccordionSection 
          id="morphologie" title="Morphologie" icon={<Activity size={18} />}
          isOpen={openSection === 'morphologie'} onToggle={() => setOpenSection(openSection === 'morphologie' ? null : 'morphologie')}
          badge={getSectionStats('morphologie').count}
          subtitle={getSectionStats('morphologie').subtitle}
        >
          <div className="space-y-6">
            <div className="filter-group">
               <DualRangeSlider label="Tranche d'Âge" min={15} max={45} currentMin={pendingFilters.minAge} currentMax={pendingFilters.maxAge} onChange={(min, max) => setPendingFilters(prev => ({ ...prev, minAge: min, maxAge: max }))} />
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Âge de Saison</span>
                <span className="text-[8px] text-slate-500 uppercase tracking-tighter">Based on season year</span>
              </div>
              <button onClick={() => updateFilters('useSeasonAge', !pendingFilters.useSeasonAge)} className={`w-8 h-4 rounded-full p-0.5 transition-all duration-300 ${pendingFilters.useSeasonAge ? 'bg-sky-500 shadow-lg shadow-sky-500/30' : 'bg-slate-700'}`}>
                <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 ${pendingFilters.useSeasonAge ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="filter-group">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-3 block">Lateral Preference</label>
              <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5">
                {['all', 'right', 'left', 'both'].map((f) => (
                  <button key={f} onClick={() => updateFilters('foot', f)} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all duration-300 ${pendingFilters.foot === f ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                    {f === 'all' ? 'All' : f === 'right' ? 'R' : f === 'left' ? 'L' : '2P'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 pt-4">
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
          <div className="mb-6 bg-black/20 rounded-3xl p-1 border border-white/5 shadow-inner">
            <TacticalPositionPicker 
              selectedPositions={pendingFilters.positions}
              onChange={(val) => updateFilters('positions', val)}
            />
          </div>
          <MultiSelectWithChips label="Postes" options={positionsList} selected={pendingFilters.positions} onChange={(val) => updateFilters('positions', val)} placeholder="Tactical roles..." />
          
          <div className="space-y-6 mt-8 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
            <div className="filter-group">
               <label className="filter-label flex justify-between">
                 <span>Playtime (%)</span>
                 <span className="text-sky-400 font-mono">{(pendingFilters.playtime?.min || 0)}%+</span>
               </label>
               <input type="range" min="0" max="100" step="5" value={pendingFilters.playtime?.min || 0} onChange={e => updateFilters('playtime', { ...(pendingFilters.playtime || {}), min: Number(e.target.value) })} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400" />
            </div>
            <div className="filter-group">
               <label className="filter-label flex justify-between">
                 <span>Min Matches</span>
                 <span className="text-emerald-400 font-mono">{pendingFilters.minMatches}+</span>
               </label>
               <input type="range" min="0" max="60" step="1" value={pendingFilters.minMatches} onChange={e => updateFilters('minMatches', Number(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400" />
            </div>
          </div>
        </AccordionSection>

        <AccordionSection 
          id="contrat" title="Contrat & Valeur" icon={<BarChart2 size={18} />}
          isOpen={openSection === 'contrat'} onToggle={() => setOpenSection(openSection === 'contrat' ? null : 'contrat')}
          badge={getSectionStats('contrat').count}
          subtitle={getSectionStats('contrat').subtitle}
        >
          <div className="space-y-8 py-2">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white uppercase tracking-tight">On Loan</span>
                <span className="text-[8px] text-slate-500 uppercase tracking-widest">Filter temporary status</span>
              </div>
              <button onClick={() => updateFilters('onLoan', !pendingFilters.onLoan)} className={`w-10 h-5 rounded-full p-0.5 transition-all duration-500 ${pendingFilters.onLoan ? 'bg-sky-500 shadow-lg shadow-sky-500/50' : 'bg-slate-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-500 ${pendingFilters.onLoan ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <div className="px-1">
              <DualRangeSlider label="Market Value (€)" min={0} max={150000000} step={500000} currentMin={pendingFilters.marketValue?.min || 0} currentMax={pendingFilters.marketValue?.max || 150000000} onChange={(min, max) => updateFilters('marketValue', { min, max })} unit="€" />
            </div>
          </div>
        </AccordionSection>
      </div>

      {/* Footer Section - Fixe / Action */}
      <div className="p-6 bg-white/[0.04] border-t border-white/5 backdrop-blur-3xl">
        <button 
          onClick={handleApplyFilters} 
          disabled={!hasChanges} 
          className={`w-full py-5 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all duration-500 relative group overflow-hidden ${
            hasChanges 
            ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-2xl shadow-sky-500/40 hover:scale-[1.02]' 
            : 'bg-white/5 text-white/10 cursor-not-allowed'
          }`}
        >
          {hasChanges && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
            />
          )}
          <span className="text-[11px] font-black uppercase tracking-[0.3em]">Apply Analysis</span>
          <Check size={18} className={`${hasChanges ? 'opacity-100 scale-100' : 'opacity-0 scale-50'} transition-all duration-300`} />
        </button>
      </div>
    </aside>
  );
};

export default FilterPanel;
