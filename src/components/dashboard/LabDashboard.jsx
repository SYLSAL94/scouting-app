// src/components/dashboard/LabDashboard.jsx
import React, { useState } from 'react';
import LabWeightPanel from './LabWeightPanel';
import RankingTable from './RankingTable';
import { FlaskConical, Info, AlertTriangle } from 'lucide-react';

export default function LabDashboard({ activeFilters, metricsList, onPlayerClick, activeTab, setActiveTab }) {
    const [labResults, setLabResults] = useState([]);
    const [totalPlayers, setTotalPlayers] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastConfig, setLastConfig] = useState(null); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const pageSize = 20;

    const runCalculation = async (weights, signs, page = 1) => {
        setLoading(true);
        setError(null);
        setCurrentPage(page);
        setLastConfig({ weights, signs });

        try {
            const response = await fetch('https://api-scouting.theanalyst.cloud/api/lab/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    metrics_weights: weights,
                    metrics_signs: signs,
                    population_filters: activeFilters,
                    page: page,
                    page_size: pageSize
                })
            });

            if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
            
            const data = await response.json();
            setLabResults(data.results || []);
            setTotalPlayers(data.total || 0);
        } catch (err) {
            console.error("Lab Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (lastConfig) {
            runCalculation(lastConfig.weights, lastConfig.signs, newPage);
        }
    };

    const totalPages = Math.ceil(totalPlayers / pageSize);

    return (
        <div className="flex flex-col gap-6 h-full min-h-0 bg-canvas-black">
            {/* Mobile Local Tabs */}
            <div className="flex xl:hidden bg-surface-slate p-1 rounded-[2px] border border-hazard-white/5 mb-2">
                <button 
                    onClick={() => setActiveTab('RESULTS')}
                    className={`flex-1 py-4 rounded-[1px] verge-label-mono text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'RESULTS' ? 'bg-jelly-mint text-absolute-black shadow-[0_0_15px_rgba(60,255,208,0.3)]' : 'text-secondary-text'}`}
                >
                    RÉSULTATS
                </button>
                <button 
                    onClick={() => setActiveTab('CONFIG')}
                    className={`flex-1 py-4 rounded-[1px] verge-label-mono text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'CONFIG' ? 'bg-jelly-mint text-absolute-black shadow-[0_0_15px_rgba(60,255,208,0.3)]' : 'text-secondary-text'}`}
                >
                    PARAMÈTRES
                </button>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 xl:gap-10 h-full min-h-0">
                {/* Control Panel */}
                <div className={`w-full xl:w-[420px] shrink-0 ${activeTab === 'CONFIG' ? 'block' : 'hidden xl:block'}`}>
                    <LabWeightPanel 
                        metricsList={metricsList} 
                        onCalculate={(w, s) => {
                            runCalculation(w, s, 1);
                            if (window.innerWidth < 1280) setActiveTab('RESULTS');
                        }}
                        loading={loading}
                    />
                </div>

                {/* Results Area */}
                <div className={`flex-1 flex flex-col min-w-0 ${activeTab === 'RESULTS' ? 'flex' : 'hidden xl:flex'}`}>
                    <div className="bg-surface-slate border border-hazard-white/10 rounded-[4px] p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
                        {/* Hazard Line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-jelly-mint/20" />
                        
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-canvas-black border border-jelly-mint/30 rounded-[2px] shadow-[0_15px_30px_rgba(0,0,0,0.3)]">
                                <FlaskConical className="text-jelly-mint" size={28} />
                            </div>
                            <div>
                                <h2 className="verge-label-mono text-2xl font-black text-hazard-white uppercase tracking-[0.1em]">RÉSULTATS DE <span className="text-jelly-mint">L'EXPÉRIENCE</span></h2>
                                <p className="verge-label-mono text-[9px] text-secondary-text uppercase font-black tracking-[0.3em] opacity-50 mt-1">Calculé dynamiquement sur la population filtrée</p>
                            </div>
                        </div>
                        {totalPlayers > 0 && (
                            <div className="px-5 py-2.5 bg-canvas-black border border-jelly-mint/30 rounded-[1px] text-jelly-mint verge-label-mono text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
                                {totalPlayers} PROFILS IDENTIFIÉS
                            </div>
                        )}
                    </div>

                    {error ? (
                        <div className="flex-1 flex flex-col items-center justify-center bg-canvas-black border border-red-500/20 rounded-[4px] p-12 shadow-2xl">
                            <div className="p-6 bg-red-500/10 rounded-full mb-8">
                                <AlertTriangle className="text-red-500" size={56} />
                            </div>
                            <h3 className="verge-label-mono text-xl font-black text-hazard-white uppercase tracking-widest mb-4">Erreur d'Analyse</h3>
                            <p className="verge-label-mono text-secondary-text text-[11px] text-center max-w-md uppercase tracking-widest leading-loose opacity-60">{error}</p>
                        </div>
                    ) : labResults.length > 0 ? (
                        <div className="flex-1 min-h-0 bg-canvas-black rounded-[4px] overflow-hidden border border-hazard-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                            <RankingTable 
                                players={labResults} 
                                loading={loading}
                                pageSize={pageSize}
                                currentPage={currentPage}
                                totalPlayers={totalPlayers}
                                totalPages={totalPages}
                                setCurrentPage={handlePageChange}
                                handlePlayerClick={onPlayerClick}
                                metricsList={metricsList}
                                selectedSortBy="custom_score"
                                onSortChange={() => {}}
                                hideSortBar={true}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-canvas-black border border-dashed border-hazard-white/5 rounded-[4px] p-12 relative overflow-hidden group">
                            {/* Technical Corner */}
                            <div className="absolute top-4 right-4 w-12 h-12 border-t border-r border-hazard-white/10" />
                            
                            <div className="w-24 h-24 bg-surface-slate border border-hazard-white/10 rounded-[2px] flex items-center justify-center mb-10 shadow-2xl group-hover:scale-105 transition-transform duration-700">
                                <Info className="text-jelly-mint opacity-30" size={56} />
                            </div>
                            <h3 className="verge-label-mono text-3xl font-black text-hazard-white uppercase tracking-tighter mb-4">PRÊT POUR L'EXPÉRIMENTATION</h3>
                            <p className="verge-label-mono text-secondary-text text-[11px] text-center max-w-sm font-black uppercase tracking-[0.2em] leading-loose opacity-40">
                                Configurez vos pondérations à gauche et lancez l'analyse pour identifier des talents uniques basés sur vos propres algorithmes.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
