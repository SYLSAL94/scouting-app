// src/components/teambuilder/MonXI.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { formations } from '../../config/formations';
import Field from './Field';
import PlayerSelectionModal from './PlayerSelectionModal';
import { UserX, Save, Trash2, FolderOpen, Layout, Settings2 } from 'lucide-react';

export default function MonXI({ activeFilters, onPlayerClick }) {
    const [formationKey, setFormationKey] = useState('4-3-3');
    const [formation, setFormation] = useState({});
    const [bench, setBench] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [presets, setPresets] = useState([]);
    const [presetName, setPresetName] = useState('');
    const [activeTab, setActiveTab] = useState('field'); // 'field' | 'config'

    const formationLayout = useMemo(() => formations[formationKey] || [], [formationKey]);
    
    // Slots de banc (11 remplaçants)
    const benchLayout = useMemo(() => [
        { id: 'B1', displayRole: 'R1', positionNeeded: ['GK', 'CB', 'LB', 'RB', 'DMF', 'CM', 'AMF', 'RW', 'LW', 'CF'], style: {} },
        { id: 'B2', displayRole: 'R2', positionNeeded: ['GK', 'CB', 'LB', 'RB', 'DMF', 'CM', 'AMF', 'RW', 'LW', 'CF'], style: {} },
        { id: 'B3', displayRole: 'R3', positionNeeded: ['GK', 'CB', 'LB', 'RB', 'DMF', 'CM', 'AMF', 'RW', 'LW', 'CF'], style: {} },
        { id: 'B4', displayRole: 'R4', positionNeeded: ['GK', 'CB', 'LB', 'RB', 'DMF', 'CM', 'AMF', 'RW', 'LW', 'CF'], style: {} },
        { id: 'B5', displayRole: 'R5', positionNeeded: ['GK', 'CB', 'LB', 'RB', 'DMF', 'CM', 'AMF', 'RW', 'LW', 'CF'], style: {} },
        { id: 'B6', displayRole: 'R6', positionNeeded: ['GK', 'CB', 'LB', 'RB', 'DMF', 'CM', 'AMF', 'RW', 'LW', 'CF'], style: {} },
        { id: 'B7', displayRole: 'R7', positionNeeded: ['GK', 'CB', 'LB', 'RB', 'DMF', 'CM', 'AMF', 'RW', 'LW', 'CF'], style: {} },
        { id: 'B8', displayRole: 'R8', positionNeeded: ['GK', 'CB', 'LB', 'RB', 'DMF', 'CM', 'AMF', 'RW', 'LW', 'CF'], style: {} },
        { id: 'B9', displayRole: 'R9', positionNeeded: ['GK', 'CB', 'LB', 'RB', 'DMF', 'CM', 'AMF', 'RW', 'LW', 'CF'], style: {} },
        { id: 'B10', displayRole: 'R10', positionNeeded: ['GK', 'CB', 'LB', 'RB', 'DMF', 'CM', 'AMF', 'RW', 'LW', 'CF'], style: {} },
        { id: 'B11', displayRole: 'R11', positionNeeded: ['GK', 'CB', 'LB', 'RB', 'DMF', 'CM', 'AMF', 'RW', 'LW', 'CF'], style: {} },
    ], []);

    useEffect(() => {
        const saved = localStorage.getItem('monxi_presets');
        if (saved) setPresets(JSON.parse(saved));
    }, []);

    const handleSlotClick = (slotId) => {
        const slot = formationLayout.find(s => s.id === slotId) || benchLayout.find(s => s.id === slotId);
        setEditingSlot(slot);
        setIsModalOpen(true);
    };

    const handlePlayerSelect = (player) => {
        if (editingSlot.id.startsWith('B')) {
            setBench(prev => ({ ...prev, [editingSlot.id]: player }));
        } else {
            setFormation(prev => ({ ...prev, [editingSlot.id]: player }));
        }
        setIsModalOpen(false);
    };

    const handleClearSlot = (e, slotId) => {
        e.stopPropagation();
        if (slotId.startsWith('B')) {
            setBench(prev => ({ ...prev, [slotId]: null }));
        } else {
            setFormation(prev => ({ ...prev, [slotId]: null }));
        }
    };

    const handleSave = () => {
        if (!presetName) return;
        const newPreset = { name: presetName, formationKey, formation, bench };
        const updated = [...presets, newPreset];
        setPresets(updated);
        localStorage.setItem('monxi_presets', JSON.stringify(updated));
        setPresetName('');
    };

    const loadPreset = (p) => {
        setFormationKey(p.formationKey);
        setFormation(p.formation);
        setBench(p.bench);
        if (window.innerWidth < 1280) setActiveTab('field');
    };

    return (
        <div className="h-full flex flex-col xl:flex-row gap-8 bg-canvas-black">
            {/* Navigation Mobile - Uniformized with BestXI */}
            <div className="xl:hidden flex bg-surface-slate p-1 rounded-[2px] border border-hazard-white/5 mb-6 shadow-xl">
                <button 
                    onClick={() => setActiveTab('field')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1px] verge-label-mono text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'field' ? 'bg-jelly-mint text-absolute-black shadow-[0_0_15px_rgba(60,255,208,0.3)]' : 'text-secondary-text'}`}
                >
                    ⚽ Terrain
                </button>
                <button 
                    onClick={() => setActiveTab('config')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1px] verge-label-mono text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'config' ? 'bg-jelly-mint text-absolute-black shadow-[0_0_15px_rgba(60,255,208,0.3)]' : 'text-secondary-text'}`}
                >
                    ⚙️ Gestion
                </button>
            </div>

            {/* Zone Terrain - Uniformized with BestXI fixes */}
            <div className={`${activeTab === 'field' ? 'flex' : 'hidden'} xl:flex xl:flex-[4] h-[550px] md:h-[calc(100vh-240px)] md:min-h-[600px] flex-col relative rounded-[4px] overflow-hidden border border-hazard-white/10 bg-canvas-black shadow-[0_30px_60px_rgba(0,0,0,0.4)]`}>
                <div className="flex-1 w-full h-full">
                    <Field
                        formationLayout={formationLayout}
                        formation={formation}
                        onSlotClick={handleSlotClick}
                    />
                </div>
            </div>

            {/* Zone Contrôles - Panneau Latéral */}
            <div className={`${activeTab === 'config' ? 'flex' : 'hidden'} xl:flex xl:w-[420px] flex-shrink-0 flex flex-col gap-6`}>
                {/* Configuration Tactique */}
                <div className="bg-surface-slate border border-hazard-white/10 rounded-[4px] p-8 md:p-10 space-y-8 shadow-2xl">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-2 h-8 bg-jelly-mint" />
                        <h3 className="verge-label-mono text-2xl font-black text-hazard-white uppercase tracking-[0.1em]">
                            MON <span className="text-jelly-mint">XI</span>
                        </h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="relative">
                            <select
                                value={formationKey}
                                onChange={(e) => {
                                    setFormationKey(e.target.value);
                                    setFormation({});
                                }}
                                className="block w-full px-6 py-5 verge-label-mono text-[10px] font-black uppercase tracking-[0.2em] border border-hazard-white/5 focus:outline-none focus:border-jelly-mint/50 rounded-[2px] bg-canvas-black text-hazard-white appearance-none cursor-pointer"
                            >
                                {Object.keys(formations).map(name => <option key={name} value={name}>FORMATION : {name}</option>)}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-jelly-mint">
                                <Layout size={14} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="verge-label-mono text-[9px] font-black uppercase tracking-[0.3em] text-secondary-text">Remplaçants</h4>
                            <div className="grid grid-cols-6 gap-3">
                                {benchLayout.map(slot => (
                                    <div 
                                        key={slot.id}
                                        onClick={() => handleSlotClick(slot.id)}
                                        className={`aspect-square rounded-[2px] border transition-all duration-300 flex items-center justify-center cursor-pointer ${
                                            bench[slot.id] 
                                            ? 'bg-canvas-black border-jelly-mint/50 shadow-[0_0_15px_rgba(60,255,208,0.1)]' 
                                            : 'bg-canvas-black/50 border-dashed border-hazard-white/10 hover:border-jelly-mint/30 hover:bg-canvas-black'
                                        }`}
                                    >
                                        {bench[slot.id] ? (
                                            <div className="relative group/bench w-full h-full p-1">
                                                <img src={bench[slot.id].image} alt="" className="w-full h-full object-cover grayscale group-hover/bench:grayscale-0 transition-all" />
                                                <button 
                                                    onClick={(e) => handleClearSlot(e, slot.id)}
                                                    className="absolute -top-1 -right-1 bg-[#f43f5e] text-hazard-white rounded-[1px] p-1 shadow-lg opacity-0 group-hover/bench:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="verge-label-mono text-[8px] font-black text-secondary-text opacity-30">{slot.displayRole}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gestion des Sauvegardes */}
                <div className="bg-surface-slate border border-hazard-white/10 rounded-[4px] p-8 md:p-10 space-y-6 shadow-2xl flex-1 flex flex-col min-h-0">
                    <div className="flex items-center gap-3">
                        <FolderOpen size={16} className="text-jelly-mint" />
                        <h4 className="verge-label-mono text-[9px] font-black uppercase tracking-[0.3em] text-secondary-text">SAUVEGARDES</h4>
                    </div>

                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="NOM DU PRESET..."
                            className="flex-1 bg-canvas-black border border-hazard-white/5 rounded-[2px] px-5 py-4 verge-label-mono text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-jelly-mint/50 text-hazard-white placeholder:opacity-20"
                            value={presetName}
                            onChange={e => setPresetName(e.target.value)}
                        />
                        <button 
                            onClick={handleSave}
                            disabled={!presetName}
                            className="px-6 bg-jelly-mint hover:bg-jelly-mint/90 disabled:opacity-20 disabled:grayscale transition-all rounded-[2px] shadow-lg shadow-[#3cffd0]/20"
                        >
                            <Save size={18} className="text-absolute-black" />
                        </button>
                    </div>

                    <div className="space-y-2 overflow-y-auto styled-scrollbar flex-1 pr-2">
                        {presets.length > 0 ? presets.map((p, i) => (
                            <div 
                                key={i}
                                onClick={() => loadPreset(p)}
                                className="flex items-center justify-between p-4 bg-canvas-black rounded-[2px] border border-hazard-white/5 hover:border-jelly-mint/30 transition-all cursor-pointer group"
                            >
                                <div className="min-w-0">
                                    <p className="verge-label-mono text-[10px] font-black text-hazard-white uppercase truncate tracking-tight">{p.name}</p>
                                    <p className="verge-label-mono text-[7px] text-secondary-text font-black uppercase tracking-[0.2em]">{p.formationKey}</p>
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const updated = presets.filter((_, idx) => idx !== i);
                                        setPresets(updated);
                                        localStorage.setItem('monxi_presets', JSON.stringify(updated));
                                    }}
                                    className="p-2 text-secondary-text hover:text-[#f43f5e] transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-12 opacity-10">
                                <Settings2 size={40} className="text-hazard-white" />
                                <p className="verge-label-mono text-[9px] uppercase font-black mt-4 tracking-widest">AUCUN PRESET</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <PlayerSelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectPlayer={handlePlayerSelect}
                slot={editingSlot}
                activeFilters={activeFilters}
            />
        </div>
    );
}
