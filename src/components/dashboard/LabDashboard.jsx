// src/components/dashboard/LabDashboard.jsx
import React, { useState } from 'react';
import LabWeightPanel from './LabWeightPanel';
import RankingTable from './RankingTable';
import { FlaskConical, Info, AlertTriangle } from 'lucide-react';

export default function LabDashboard({ activeFilters, metricsList, onPlayerClick }) {
    const [labResults, setLabResults] = useState([]);
    const [totalPlayers, setTotalPlayers] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastConfig, setLastConfig] = useState(null); // Pour re-déclencher sur changement de page
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
        <div className="flex-1 flex gap-10 min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Control Panel */}
            <div className="w-[400px] shrink-0">
                <LabWeightPanel 
                    metricsList={metricsList} 
                    onCalculate={(w, s) => runCalculation(w, s, 1)}
                    loading={loading}
                />
            </div>

            {/* Results Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-3xl p-6 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                            <FlaskConical className="text-emerald-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Résultats de <span className="text-emerald-400">l'Expérience</span></h2>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Calculé dynamiquement sur la population filtrée</p>
                        </div>
                    </div>
                    {totalPlayers > 0 && (
                        <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                            {totalPlayers} Profils Identifiés
                        </div>
                    )}
                </div>

                {error ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-red-500/5 border border-red-500/10 rounded-3xl p-10">
                        <AlertTriangle className="text-red-500 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-white mb-2">Erreur d'Analyse</h3>
                        <p className="text-slate-400 text-sm text-center max-w-md">{error}</p>
                    </div>
                ) : labResults.length > 0 ? (
                    <div className="flex-1 min-h-0 bg-slate-900/50 rounded-3xl overflow-hidden border border-white/5">
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
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-white/5 border border-dashed border-white/10 rounded-3xl p-10 opacity-40">
                        <Info className="text-slate-500 mb-6" size={64} />
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Prêt pour l'Expérimentation</h3>
                        <p className="text-slate-400 text-sm text-center max-w-sm font-medium">
                            Configurez vos pondérations à gauche et lancez l'analyse pour identifier des talents uniques basés sur vos propres algorithmes.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
