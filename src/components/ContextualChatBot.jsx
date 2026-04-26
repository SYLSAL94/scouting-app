import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';

/**
 * ContextualChatBot.jsx — Assistant IA contextuel (DeepSeek)
 * Version optimisée avec capacités DataViz (Radar Charts).
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

  /**
   * Parseur Visuel : Analyse le contenu du message pour extraire et rendre les graphiques
   */
  const renderMessageContent = (content) => {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = jsonRegex.exec(content)) !== null) {
      // Texte avant le bloc JSON
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: content.substring(lastIndex, match.index) });
      }

      try {
        const jsonData = JSON.parse(match[1].trim());
        if (jsonData.type === 'radar_chart') {
          parts.push({ type: 'radar', value: jsonData.data });
        } else {
          parts.push({ type: 'text', value: match[0] });
        }
      } catch (e) {
        parts.push({ type: 'text', value: match[0] });
      }
      lastIndex = jsonRegex.lastIndex;
    }

    // Texte restant après le dernier bloc
    if (lastIndex < content.length) {
      parts.push({ type: 'text', value: content.substring(lastIndex) });
    }

    return (
      <div className="space-y-4">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return <p key={index} className="whitespace-pre-wrap">{part.value}</p>;
          }
          if (part.type === 'radar') {
            return (
              <div key={index} className="my-4 p-4 bg-black/40 rounded-[2px] border border-white/10 h-[260px] w-full overflow-hidden shadow-inner">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={part.value}>
                    <PolarGrid stroke="#313131" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#949494', fontSize: 9, fontWeight: 700 }} 
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={false} 
                      axisLine={false} 
                    />
                    <Radar
                      name="Profil"
                      dataKey="score"
                      stroke="#00d2ff"
                      fill="#00d2ff"
                      fillOpacity={0.25}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const newUserMessage = { role: 'user', content: userMessage };
    
    // Mise à jour immédiate de l'interface avec le message utilisateur
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Préparation de l'historique pour le Back-End (API-First)
      const historyForApi = updatedMessages
        .slice(1) 
        .map(msg => ({
          role: msg.role === 'bot' ? 'assistant' : msg.role,
          content: msg.content
        }));

      const payload = {
        messages: historyForApi,
        context_data: {
          filters: activeFilters,
          visible_players_count: players?.length,
          sample_players: players?.slice(0, 25).map(p => ({ 
            name: p.name, 
            team: p.last_club_name, 
            position: p.position_category,
            age: p.season_age || p.age,
            score: p.note_ponderee,
            minutes: p.minutes_on_field
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
      // On ajoute la réponse de l'IA à l'historique local
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
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            className="mb-6 w-[380px] md:w-[450px] h-[650px] flex flex-col overflow-hidden bg-[#131313] border-2 border-white/10 rounded-[4px] shadow-[0_30px_90px_rgba(0,0,0,0.8)]"
          >
            {/* Header */}
            <div className="p-6 bg-[#2d2d2d] border-b border-white/10 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#3cffd0]/5 rotate-45 translate-x-8 -translate-y-8" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-2.5 bg-[#3cffd0] rounded-[2px] shadow-[0_0_15px_rgba(60,255,208,0.4)]">
                  <Bot size={22} className="text-black" />
                </div>
                <div>
                  <h3 className="verge-label-mono text-white text-[13px] font-black tracking-widest">Scouting <span className="text-[#3cffd0]">Assistant</span></h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 bg-[#3cffd0] animate-pulse"></div>
                    <span className="verge-label-mono text-[8px] text-[#3cffd0] tracking-[0.2em] font-black uppercase">EN LIGNE • DATAVIZ ACTIVE</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-[2px] transition-colors relative z-10">
                <X size={20} className="text-[#949494]" />
              </button>
            </div>

            {/* Zone de Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 styled-scrollbar bg-[#131313]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`mt-1 p-2 rounded-[2px] h-fit border ${msg.role === 'user' ? 'bg-[#5200ff]/10 border-[#5200ff]/30' : 'bg-[#2d2d2d] border-white/10'}`}>
                      {msg.role === 'user' ? <User size={14} className="text-[#5200ff]" /> : <Sparkles size={14} className="text-[#3cffd0]" />}
                    </div>
                    <div className={`p-5 rounded-[2px] text-[11px] leading-relaxed border ${
                      msg.role === 'user' 
                        ? 'bg-[#5200ff] border-[#5200ff] text-white shadow-[0_10px_30px_rgba(82,0,255,0.2)]' 
                        : 'bg-[#2d2d2d] border-white/10 text-white/90'
                    }`}>
                      {msg.role === 'bot' ? renderMessageContent(msg.content) : msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                   <div className="bg-[#2d2d2d] border border-white/10 p-5 rounded-[2px] flex gap-2">
                      <div className="w-1.5 h-1.5 bg-[#3cffd0] animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-[#3cffd0] animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-[#3cffd0] animate-bounce [animation-delay:0.4s]"></div>
                   </div>
                </div>
              )}
            </div>

            {/* Zone de saisie */}
            <div className="p-6 bg-[#2d2d2d] border-t border-white/10">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="POSEZ UNE QUESTION SUR LE SCOUTING..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="w-full bg-[#131313] border border-white/10 rounded-[2px] py-4 pl-5 pr-14 verge-label-mono text-[10px] text-white focus:border-[#3cffd0] outline-none transition-all placeholder:text-[#949494] font-black"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-[#3cffd0] hover:bg-[#3cffd0]/80 rounded-[2px] text-black disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="mt-4 flex justify-between items-center px-1">
                <span className="verge-label-mono text-[8px] text-[#949494] font-black tracking-[0.3em]">
                  DEEPSEEK ENGINE V3
                </span>
                <span className="verge-label-mono text-[8px] text-[#3cffd0] font-black tracking-[0.2em]">
                  CONTEXT: {selectedPlayer ? selectedPlayer.name : "DASHBOARD MODE"}
                </span>
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
        className={`group w-16 h-16 rounded-[4px] shadow-2xl flex items-center justify-center transition-all duration-500 relative border-2 ${
          isOpen ? 'bg-[#131313] border-white/20' : 'bg-[#5200ff] border-[#5200ff] shadow-[0_0_30px_rgba(82,0,255,0.3)]'
        }`}
      >
        {isOpen ? <X size={28} className="text-white" /> : <MessageSquare size={28} className="text-white" />}
        {!isOpen && (
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#3cffd0] rounded-[2px] flex items-center justify-center shadow-lg">
             <span className="text-[9px] font-black text-black">1</span>
          </div>
        )}
        {!isOpen && (
          <div className="absolute inset-0 rounded-[4px] bg-[#5200ff] opacity-0 group-hover:opacity-40 blur-xl transition-opacity"></div>
        )}
      </motion.button>
    </div>
  );
};

export default ContextualChatBot;
