import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BestXI from '../teambuilder/BestXI';
import MonXI from '../teambuilder/MonXI';
import FilterPanel from './FilterPanel';

export default function TeamBuilderDashboard({ activeFilters, onPlayerClick, filterProps }) {
    const [activeTab, setActiveTab] = useState('bestXI'); // 'bestXI' | 'monXI' | 'filters'

    return (
        <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-700">
            {/* Tab Selector - Responsive Grid */}
            <div className="flex justify-center mb-6 md:mb-10 px-2">
                <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md shadow-2xl w-full max-w-2xl overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('bestXI')}
                        className={`relative flex-1 min-w-[100px] px-4 md:px-10 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                            activeTab === 'bestXI' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {activeTab === 'bestXI' && (
                            <motion.div
                                layoutId="activeTabTeam"
                                className="absolute inset-0 bg-sky-500 rounded-xl -z-10 shadow-lg shadow-sky-500/20"
                            />
                        )}
                        <span className="md:hidden">Best</span><span className="hidden md:inline">Optimisation Best XI</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('monXI')}
                        className={`relative flex-1 min-w-[100px] px-4 md:px-10 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                            activeTab === 'monXI' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {activeTab === 'monXI' && (
                            <motion.div
                                layoutId="activeTabTeam"
                                className="absolute inset-0 bg-emerald-500 rounded-xl -z-10 shadow-lg shadow-emerald-500/20"
                            />
                        )}
                        <span className="md:hidden">Custom</span><span className="hidden md:inline">Composition Manuelle</span>
                    </button>
                    
                    {/* Onglet Filtres Visible uniquement sur Mobile */}
                    <button
                        onClick={() => setActiveTab('filters')}
                        className={`lg:hidden relative flex-1 min-w-[100px] px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                            activeTab === 'filters' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {activeTab === 'filters' && (
                            <motion.div
                                layoutId="activeTabTeam"
                                className="absolute inset-0 bg-slate-600 rounded-xl -z-10 shadow-lg shadow-slate-500/20"
                            />
                        )}
                        Filtres
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-h-0">
                {activeTab === 'bestXI' ? (
                    <BestXI activeFilters={activeFilters} onPlayerClick={onPlayerClick} />
                ) : activeTab === 'monXI' ? (
                    <MonXI activeFilters={activeFilters} onPlayerClick={onPlayerClick} />
                ) : (
                    <div className="lg:hidden animate-in slide-in-from-bottom-4 duration-300 w-full">
                        <FilterPanel {...filterProps} fullWidth={true} />
                    </div>
                )}
            </div>
        </div>
    );
}
