// src/components/teambuilder/MonXI.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { formations } from '../../config/formations';
import Field from './Field';
import PlayerSelectionModal from './PlayerSelectionModal';
import { UserX, Save, Trash2, FolderOpen } from 'lucide-react';

export default function MonXI({ activeFilters, onPlayerClick }) {
    const [formationKey, setFormationKey] = useState('4-3-3');
    const [formation, setFormation] = useState({});
    const [bench, setBench] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [presets, setPresets] = useState([]);
    const [presetName, setPresetName] = useState('');

    const formationLayout = useMemo(() => formations[formationKey] || [], [formationKey]);
    
    // Slots de banc (7 remplaçants fixes pour simplifier)
    const benchLayout = useMemo(() => [
        { id: 'B1', displayRole: 'R1', positionNeeded: ['GK', 'CB', 'LB', 'RB', 'DMF', 'CM', 'AMF', 'RW', 'LW', 'CF'], style: {} },
        { id: 'B2', displayRole: 'R2', positionNeeded: ['GK', 'CB', 'LB', 'RB', 'DMF', 'CM', 'AMF', 'RW', 'LW', 'CF'], style: {} },
        { id: 'B3', displayRole: 'R3', positionNeeded: ['GK', 'CB', 'LB', 'RB', 'DMF', 'CM', 'AMF', 'RW', 'LW', 'CF'], style: {} },
        { id: 'B4', displayRole: 'R4', positionNeeded: ['GK', 'CB', 'LB', 'RB', 'DMF', 'CM', 'AMF', 'RW', 'LW', 'CF'], style: {} },
        { id: 'B5', displayRole: 'R5', positionNeeded: ['GK', 'CB', 'LB', 'RB', 'DMF', 'CM', 'AMF', 'RW', 'LW', 'CF'], style: {} },
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
    };

    return (
        <div className="h-full flex flex-col xl:flex-row gap-8">
            <div className="flex-1 min-h-[600px] relative rounded-3xl overflow-hidden border border-white/5 bg-slate-900/50 shadow-2xl">
                <Field
                    formationLayout={formationLayout}
                    formation={formation}
                    onSlotClick={handleSlotClick}
                />
            </div>

            <div className="xl:w-[400px] flex-shrink-0 flex flex-col gap-6">
                {/* Controls */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                        Mon <span className="text-emerald-400">XI</span>
                    </h3>
                    
                    <select
                        value={formationKey}
                        onChange={(e) => {
                            setFormationKey(e.target.value);
                            setFormation({});
                        }}
                        className="block w-full px-6 py-4 text-xs font-black uppercase tracking-widest border border-white/10 focus:outline-none focus:border-emerald-500/50 rounded-xl bg-slate-900/50 text-white appearance-none cursor-pointer"
                    >
                        {Object.keys(formations).map(name => <option key={name} value={name}>Formation : {name}</option>)}
                    </select>

                    <div className="space-y-4">
                        <div className="px-2">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Remplaçants</h4>
                            <div className="grid grid-cols-5 gap-2">
                                {benchLayout.map(slot => (
                                    <div 
                                        key={slot.id}
                                        onClick={() => handleSlotClick(slot.id)}
                                        className={`aspect-square rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${
                                            bench[slot.id] 
                                            ? 'bg-emerald-500/20 border-emerald-500/50' 
                                            : 'bg-white/5 border-dashed border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        {bench[slot.id] ? (
                                            <div className="relative group/bench w-full h-full">
                                                <img src={bench[slot.id].image} alt="" className="w-full h-full object-contain p-1" />
                                                <button 
                                                    onClick={(e) => handleClearSlot(e, slot.id)}
                                                    className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 opacity-0 group-hover/bench:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
                                                        {Number(bench[slot.id].note_ponderee || 0).toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-white/20">{slot.displayRole}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Presets */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-2">
                        <FolderOpen size={16} className="text-sky-400" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Sauvegardes</h4>
                    </div>

                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Nom de l'équipe..."
                            className="flex-1 bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-sky-500/50"
                            value={presetName}
                            onChange={e => setPresetName(e.target.value)}
                        />
                        <button 
                            onClick={handleSave}
                            className="p-3 bg-sky-500 hover:bg-sky-400 rounded-xl transition-colors shadow-lg shadow-sky-500/20"
                        >
                            <Save size={18} />
                        </button>
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                        {presets.map((p, i) => (
                            <div 
                                key={i}
                                onClick={() => loadPreset(p)}
                                className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
                            >
                                <div>
                                    <p className="text-xs font-bold text-white">{p.name}</p>
                                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">{p.formationKey}</p>
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const updated = presets.filter((_, idx) => idx !== i);
                                        setPresets(updated);
                                        localStorage.setItem('monxi_presets', JSON.stringify(updated));
                                    }}
                                    className="p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
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
