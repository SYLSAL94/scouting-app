// src/components/dashboard/TeamBuilderDashboard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BestXI from '../teambuilder/BestXI';
import MonXI from '../teambuilder/MonXI';

export default function TeamBuilderDashboard({ activeFilters, onPlayerClick }) {
    const [activeTab, setActiveTab] = useState('bestXI'); // 'bestXI' | 'monXI'

    return (
        <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-700">
            {/* Tab Selector */}
            <div className="flex justify-center mb-8">
                <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md shadow-2xl">
                    <button
                        onClick={() => setActiveTab('bestXI')}
                        className={`relative px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                            activeTab === 'bestXI'
                                ? 'text-white'
                                : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {activeTab === 'bestXI' && (
                            <motion.div
                                layoutId="activeTabTeam"
                                className="absolute inset-0 bg-sky-500 rounded-xl -z-10 shadow-lg shadow-sky-500/20"
                            />
                        )}
                        Optimisation Best XI
                    </button>
                    <button
                        onClick={() => setActiveTab('monXI')}
                        className={`relative px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                            activeTab === 'monXI'
                                ? 'text-white'
                                : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {activeTab === 'monXI' && (
                            <motion.div
                                layoutId="activeTabTeam"
                                className="absolute inset-0 bg-emerald-500 rounded-xl -z-10 shadow-lg shadow-emerald-500/20"
                            />
                        )}
                        Composition Manuelle
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-h-0">
                {activeTab === 'bestXI' ? (
                    <BestXI activeFilters={activeFilters} onPlayerClick={onPlayerClick} />
                ) : (
                    <MonXI activeFilters={activeFilters} onPlayerClick={onPlayerClick} />
                )}
            </div>
        </div>
    );
}
