import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, FileJson, Sliders, Play, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { CLIPMAKER_API_URL } from '../../config';

const ClipMakerDashboard = () => {
  const [formData, setFormData] = useState({
    video_r2_key: '',
    data_r2_key: '',
    xt_min: 0.05
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'xt_min' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('INITIALISATION DU MONTAGE ASYNCHRONE...');

    try {
      const response = await fetch(`${CLIPMAKER_API_URL}/api/clipmaker/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`ERREUR HTTP: ${response.status}`);
      }

      await response.json();
      setStatus('success');
      setMessage('LANCEMENT RÉUSSI. TRAITEMENT EN ARRIÈRE-PLAN SUR GPU WORKER.');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage(`ÉCHEC DU LANCEMENT : ${err.message.toUpperCase()}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-8"
    >
      <div className="mb-20">
        <h1 className="verge-h1 text-white mb-4">
          CLIP<span className="text-[#3cffd0]">MAKER</span>
        </h1>
        <div className="flex items-center gap-4">
           <div className="w-2 h-2 bg-[#3cffd0] animate-pulse" />
           <p className="verge-label-mono text-[11px] text-[#949494] tracking-[0.3em] font-black uppercase">
             CONTROL PLANE v1.0 • ZERO-DISK GPU CLUSTER
           </p>
        </div>
      </div>

      <div className="bg-[#131313] border border-white/10 rounded-[24px] p-12 relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3cffd0 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Video R2 Key */}
            <div className="space-y-4">
              <label className="verge-label-mono text-[10px] text-[#3cffd0] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                <Video size={14} /> SOURCE VIDÉO R2 (.MP4)
              </label>
              <input 
                type="text" 
                name="video_r2_key"
                value={formData.video_r2_key}
                onChange={handleChange}
                placeholder="PROD/MATCHES/2026/FINAL_EXPORT.MP4"
                className="w-full bg-[#131313] border border-white/10 rounded-[2px] px-6 py-5 text-white verge-label-mono text-[12px] placeholder:opacity-20 focus:outline-none focus:border-[#3cffd0] transition-all"
                required
              />
            </div>

            {/* Data R2 Key */}
            <div className="space-y-4">
              <label className="verge-label-mono text-[10px] text-[#3cffd0] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                <FileJson size={14} /> SOURCE OPTA DATA R2 (.JSON)
              </label>
              <input 
                type="text" 
                name="data_r2_key"
                value={formData.data_r2_key}
                onChange={handleChange}
                placeholder="PROD/DATA/OPTA/F24_MATCH_ID.JSON"
                className="w-full bg-[#131313] border border-white/10 rounded-[2px] px-6 py-5 text-white verge-label-mono text-[12px] placeholder:opacity-20 focus:outline-none focus:border-[#3cffd0] transition-all"
                required
              />
            </div>
          </div>

          {/* Parameters Section */}
          <div className="pt-10 border-t border-white/5 space-y-8">
            <div className="flex items-center gap-3">
              <Sliders size={16} className="text-[#3cffd0]" />
              <span className="verge-label-mono text-[10px] text-white font-black uppercase tracking-[0.2em]">Paramètres algorithmiques</span>
            </div>
            
            <div className="bg-[#2d2d2d]/30 border border-white/5 rounded-[20px] p-8">
              <div className="max-w-md space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="verge-label-mono text-[10px] text-[#949494] font-black uppercase">Seuil d'Impact xT (Expected Threat)</span>
                  <span className="verge-label-mono text-[12px] text-[#3cffd0] font-black">{formData.xt_min.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  name="xt_min"
                  min="0" 
                  max="0.5" 
                  step="0.01"
                  value={formData.xt_min}
                  onChange={handleChange}
                  className="w-full h-1.5 bg-[#131313] rounded-full appearance-none cursor-pointer accent-[#3cffd0]"
                />
                <div className="flex justify-between text-[8px] text-[#949494] font-black uppercase tracking-widest opacity-40">
                  <span>Sensibilité max</span>
                  <span>Filtrage agressif</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {status !== 'idle' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-6 rounded-[4px] border flex items-center gap-4 ${
                status === 'loading' ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' :
                status === 'success' ? 'bg-[#3cffd0]/5 border-[#3cffd0]/20 text-[#3cffd0]' :
                'bg-red-500/5 border-red-500/20 text-red-500'
              }`}
            >
              {status === 'loading' && <Loader2 size={18} className="animate-spin shrink-0" />}
              {status === 'success' && <CheckCircle size={18} className="shrink-0" />}
              {status === 'error' && <AlertCircle size={18} className="shrink-0" />}
              <span className="verge-label-mono text-[10px] font-black uppercase tracking-widest">{message}</span>
            </motion.div>
          )}

          {/* Action Button */}
          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="btn-verge-primary w-full py-8 text-[14px] rounded-[40px] shadow-[0_0_50px_rgba(60,255,208,0.15)] hover:shadow-[0_0_70px_rgba(60,255,208,0.3)] transition-all relative overflow-hidden group"
          >
            <div className="relative z-10 flex items-center justify-center gap-4">
              {status === 'loading' ? 'INITIALISATION...' : (
                <>
                  LANCER LA GÉNÉRATION DES CLIPS <Play size={20} fill="black" />
                </>
              )}
            </div>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </form>
      </div>

      {/* Footer Info Clusters */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Compute Engine', value: 'NVIDIA RTX CLUSTER' },
          { label: 'Latency Strategy', value: 'ASYNC BACKGROUND TASKS' },
          { label: 'Storage Layer', value: 'CLOUDFLARE R2 BUCKETS' }
        ].map((item, i) => (
          <div key={i} className="bg-[#2d2d2d]/20 border border-white/5 rounded-[20px] p-6 text-center">
            <p className="verge-label-mono text-[9px] text-[#949494] mb-2 uppercase tracking-widest">{item.label}</p>
            <p className="verge-label-mono text-[11px] text-white font-black">{item.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ClipMakerDashboard;
