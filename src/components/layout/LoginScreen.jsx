import React, { useState } from 'react';
import { motion } from 'framer-motion';

const LoginScreen = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://api-scouting.theanalyst.cloud/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.message || "Identifiants incorrects.");
      }
    } catch (err) {
      setError("Impossible de joindre le serveur d'authentification.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel max-w-md w-full p-8 rounded-2xl shadow-2xl bg-slate-800/50 border border-slate-700 backdrop-blur-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-wider mb-2">The Analyst <span className="text-sky-400">Hub</span></h1>
          <p className="text-slate-400 text-sm">Veuillez vous identifier pour accéder au Scouting</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Email ou Nom d'utilisateur</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors"
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors"
              required 
              autoComplete="current-password"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-4 px-4 rounded-lg transition-colors flex justify-center items-center uppercase tracking-widest text-xs"
          >
            {isLoading ? 'Vérification...' : 'Se connecter'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
