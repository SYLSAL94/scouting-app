import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ContextualChatBot.jsx — Assistant IA contextuel (DeepSeek)
 * Implémente la 'Silent State Capture' pour enrichir le prompt du LLM.
 */
const ContextualChatBot = ({ selectedPlayer, players, activeFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Bonjour ! Je suis votre assistant de scouting IA. Comment puis-je vous aider aujourd'hui ?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll à chaque nouveau message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Capture Silencieuse : Préparation du contexte
      const payload = {
        message: userMessage,
        context_data: {
          filters: activeFilters,
          visible_players_count: players?.length,
          sample_players: players?.slice(0, 5).map(p => ({ 
            name: p.name, 
            team: p.last_club_name, 
            score: p.note_ponderee 
          }))
        },
        player_info: selectedPlayer ? {
          id: selectedPlayer.id,
          name: selectedPlayer.name,
          team: selectedPlayer.last_club_name,
          position: selectedPlayer.position_category,
          stats: selectedPlayer // On envoie les stats si disponibles
        } : null
      };

      const response = await fetch('https://api-scouting.theanalyst.cloud/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Erreur de connexion à l'IA");

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', content: data.answer }]);
    } catch (error) {
      console.error("❌ Chatbot Error:", error);
      setMessages(prev => [...prev, { role: 'bot', content: "Désolé, j'ai rencontré une erreur technique lors de la connexion à mon cerveau IA." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Fenêtre de Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] md:w-[400px] h-[500px] flex flex-col overflow-hidden glassmorphism shadow-2xl border border-white/20 rounded-2xl"
          >
            {/* Header */}
            <div className="p-4 bg-sky-500/20 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-500 rounded-lg shadow-lg shadow-sky-500/20">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tighter">Scouting <span className="text-sky-400">Assistant</span></h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">En ligne • Contextual IA</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Zone de Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`mt-1 p-1 rounded-md h-fit ${msg.role === 'user' ? 'bg-sky-500/20' : 'bg-white/10'}`}>
                      {msg.role === 'user' ? <User size={12} /> : <Sparkles size={12} className="text-sky-400" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' 
                        : 'bg-white/5 border border-white/10 text-white/80'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                   <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex gap-1">
                      <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                   </div>
                </div>
              )}
            </div>

            {/* Zone de saisie */}
            <div className="p-4 bg-white/5 border-t border-white/10">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Posez une question sur le scouting..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs focus:border-sky-500/50 outline-none transition-all"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-sky-500 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20"
                >
                  <Send size={14} />
                </button>
              </div>
              <div className="mt-2 text-[8px] text-white/20 text-center uppercase tracking-widest">
                DeepSeek Engine • Context: {selectedPlayer ? selectedPlayer.name : "Global Dashboard"}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulle Flottante (FAB) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-sky-500 hover:bg-sky-400'
        }`}
        style={{ boxShadow: isOpen ? '0 0 30px rgba(239, 68, 68, 0.4)' : '0 0 30px rgba(14, 165, 233, 0.4)' }}
      >
        {isOpen ? <X size={24} className="text-white" /> : <MessageSquare size={24} className="text-white" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[rgb(var(--bg-main))] flex items-center justify-center">
             <span className="text-[8px] font-bold">1</span>
          </div>
        )}
      </motion.button>
    </div>
  );
};

export default ContextualChatBot;
