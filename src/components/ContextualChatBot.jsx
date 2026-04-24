import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ContextualChatBot.jsx — Assistant IA contextuel (DeepSeek)
 * Version optimisée pour une visibilité maximale et un design Premium.
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
          stats: selectedPlayer 
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
      setMessages(prev => [...prev, { role: 'bot', content: "Désolé, j'ai rencontré une erreur technique." }]);
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
            className="mb-4 w-[380px] md:w-[450px] h-[600px] flex flex-col overflow-hidden bg-[#0f172a]/98 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            {/* Header avec contraste élevé */}
            <div className="p-5 bg-sky-500/10 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-sky-500 rounded-xl shadow-lg shadow-sky-500/40">
                  <Bot size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tighter text-white">Scouting <span className="text-sky-400">Assistant</span></h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-sky-400/80 uppercase font-bold tracking-widest">En ligne • Contextual Intelligence</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} className="text-white/60" />
              </button>
            </div>

            {/* Zone de Messages avec meilleur contraste */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`mt-1 p-2 rounded-lg h-fit ${msg.role === 'user' ? 'bg-sky-500/20' : 'bg-white/10'}`}>
                      {msg.role === 'user' ? <User size={14} className="text-sky-400" /> : <Sparkles size={14} className="text-sky-400" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                      msg.role === 'user' 
                        ? 'bg-sky-600 text-white shadow-sky-500/20 rounded-tr-none' 
                        : 'bg-white/10 border border-white/10 text-white/95 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                   <div className="bg-white/10 border border-white/10 p-4 rounded-2xl flex gap-1.5">
                      <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                   </div>
                </div>
              )}
            </div>

            {/* Zone de saisie optimisée */}
            <div className="p-5 bg-white/5 border-t border-white/10 backdrop-blur-md">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Posez une question sur le scouting..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="w-full bg-black/60 border border-white/20 rounded-2xl py-4 pl-5 pr-14 text-sm text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 outline-none transition-all placeholder:text-white/20"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-sky-500 hover:bg-sky-400 rounded-xl text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-sky-500/40 transition-all active:scale-95"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="mt-3 flex justify-between items-center px-1">
                <span className="text-[8px] text-white/20 uppercase font-black tracking-widest">
                  DeepSeek Engine v3
                </span>
                <span className="text-[8px] text-sky-400/40 uppercase font-black tracking-widest">
                  Context: {selectedPlayer ? selectedPlayer.name : "Dashboard Mode"}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulle Flottante (FAB) avec halo lumineux */}
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(14, 165, 233, 0.6)" }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`group p-5 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-500 relative ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-sky-500'
        }`}
      >
        {isOpen ? <X size={28} className="text-white" /> : <MessageSquare size={28} className="text-white" />}
        
        {!isOpen && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-4 border-[#0f172a] flex items-center justify-center shadow-lg">
             <span className="text-[10px] font-black text-white">1</span>
          </div>
        )}
        
        {/* Glow effect */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-2xl bg-sky-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
        )}
      </motion.button>
    </div>
  );
};

export default ContextualChatBot;
