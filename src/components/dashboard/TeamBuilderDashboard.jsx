import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BestXI from '../teambuilder/BestXI';
import MonXI from '../teambuilder/MonXI';
import FilterPanel from './FilterPanel';

export default function TeamBuilderDashboard({ activeFilters, onPlayerClick, filterProps }) {
    const [activeTab, setActiveTab] = useState('bestXI'); // 'bestXI' | 'monXI' | 'filters'

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#131313]">
            {/* Tab Selector - Responsive Grid */}
            <div className="flex justify-center mb-8 md:mb-12 px-2">
                <div className="flex bg-[#2d2d2d] border border-white/5 rounded-[2px] w-full max-w-2xl overflow-x-auto no-scrollbar shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <button
                        onClick={() => setActiveTab('bestXI')}
                        className={`relative flex-1 min-w-[120px] px-6 md:px-12 py-4 verge-label-mono text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
                            activeTab === 'bestXI' ? 'text-black' : 'text-[#949494] hover:text-white'
                        }`}
                    >
                        {activeTab === 'bestXI' && (
                            <motion.div
                                layoutId="activeTabTeam"
                                className="absolute inset-0 bg-[#3cffd0] -z-10 shadow-[0_0_20px_rgba(60,255,208,0.2)]"
                            />
                        )}
                        <span className="md:hidden">Best</span><span className="hidden md:inline">Optimisation Best XI</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('monXI')}
                        className={`relative flex-1 min-w-[120px] px-6 md:px-12 py-4 verge-label-mono text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
                            activeTab === 'monXI' ? 'text-black' : 'text-[#949494] hover:text-white'
                        }`}
                    >
                        {activeTab === 'monXI' && (
                            <motion.div
                                layoutId="activeTabTeam"
                                className="absolute inset-0 bg-[#3cffd0] -z-10 shadow-[0_0_20px_rgba(60,255,208,0.2)]"
                            />
                        )}
                        <span className="md:hidden">Custom</span><span className="hidden md:inline">Composition Manuelle</span>
                    </button>
                    
                    <button
                        onClick={() => setActiveTab('filters')}
                        className={`lg:hidden relative flex-1 min-w-[100px] px-4 py-4 verge-label-mono text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                            activeTab === 'filters' ? 'text-black' : 'text-[#949494] hover:text-white'
                        }`}
                    >
                        {activeTab === 'filters' && (
                            <motion.div
                                layoutId="activeTabTeam"
                                className="absolute inset-0 bg-[#3cffd0] -z-10 shadow-[0_0_20px_rgba(60,255,208,0.2)]"
                            />
                        )}
                        Filtres
                    </button>
                </div>
            </div>

            {/* Content Area - Layout à deux colonnes sur PC */}
            <div className="flex-1 flex flex-col lg:flex-row gap-6 md:gap-10 min-h-0">
                
                {/* Panneau Filtres - Latéral sur PC */}
                <aside className="hidden lg:block w-[420px] shrink-0 overflow-y-auto no-scrollbar pb-8">
                    <FilterPanel {...filterProps} />
                </aside>

                {/* Zone de Contenu Principale (Terrain/XI) */}
                <main className="flex-1 flex flex-col min-h-0 min-w-0">
                    {activeTab === 'bestXI' ? (
                        <BestXI activeFilters={activeFilters} onPlayerClick={onPlayerClick} />
                    ) : activeTab === 'monXI' ? (
                        <MonXI activeFilters={activeFilters} onPlayerClick={onPlayerClick} />
                    ) : (
                        <div className="lg:hidden animate-in slide-in-from-bottom-4 duration-300 w-full">
                            <FilterPanel {...filterProps} fullWidth={true} />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
