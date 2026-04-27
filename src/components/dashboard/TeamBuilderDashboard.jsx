import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BestXI from '../teambuilder/BestXI';
import MonXI from '../teambuilder/MonXI';
import FilterPanel from './FilterPanel';

export default function TeamBuilderDashboard({ activeFilters, onPlayerClick, filterProps }) {
    const [activeTab, setActiveTab] = useState('bestXI'); // 'bestXI' | 'monXI' | 'filters'

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-canvas-black">
            {/* Tab Selector - Responsive Grid */}
            <div className="flex justify-center mb-8 md:mb-12 px-2">
                <div className="flex bg-surface-slate border border-hazard-white/5 rounded-[2px] w-full max-w-2xl overflow-x-auto no-scrollbar shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <button
                        onClick={() => setActiveTab('bestXI')}
                        className={`relative flex-1 min-w-[120px] px-6 md:px-12 py-4 verge-label-mono text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
                            activeTab === 'bestXI' ? 'text-absolute-black' : 'text-secondary-text hover:text-hazard-white'
                        }`}
                    >
                        {activeTab === 'bestXI' && (
                            <motion.div
                                layoutId="activeTabTeam"
                                className="absolute inset-0 bg-jelly-mint -z-10 shadow-[0_0_20px_rgba(60,255,208,0.2)]"
                            />
                        )}
                        <span className="md:hidden">Best</span><span className="hidden md:inline">Optimisation Best XI</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('monXI')}
                        className={`relative flex-1 min-w-[120px] px-6 md:px-12 py-4 verge-label-mono text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
                            activeTab === 'monXI' ? 'text-absolute-black' : 'text-secondary-text hover:text-hazard-white'
                        }`}
                    >
                        {activeTab === 'monXI' && (
                            <motion.div
                                layoutId="activeTabTeam"
                                className="absolute inset-0 bg-jelly-mint -z-10 shadow-[0_0_20px_rgba(60,255,208,0.2)]"
                            />
                        )}
                        <span className="md:hidden">Custom</span><span className="hidden md:inline">Composition Manuelle</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-h-0">
                <main className="flex-1 flex flex-col min-h-0 min-w-0">
                    {activeTab === 'bestXI' ? (
                        <BestXI activeFilters={activeFilters} onPlayerClick={onPlayerClick} />
                    ) : (
                        <MonXI activeFilters={activeFilters} onPlayerClick={onPlayerClick} />
                    )}
                </main>
            </div>
        </div>
    );
}
