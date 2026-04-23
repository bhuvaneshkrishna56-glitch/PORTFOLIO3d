import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiX, FiSend, FiUser } from 'react-icons/fi';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm Ebinesar's AI assistant. Ask me about his projects, skills, or internship experience." }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const responses = {
    "projects": "Ebinesar has built 5+ major projects, including a 3D Portfolio, an E-Commerce platform, and AI-driven dashboards. Check the Projects section for live demos!",
    "skills": "He is proficient in React, Node.js, and Three.js. Currently, he is diving deep into AI/LLM integration and System Design.",
    "internship": "Ebinesar interned at AppDost, where he focused on Frontend & Full Stack development, significantly optimizing dashboard performance.",
    "contact": "You can reach Ebinesar at hello@example.com or through the LinkedIn link in the Footer.",
    "hackathon": "He won a Zonal level prize in the Smart India Hackathon for a disaster management system built with Three.js.",
    "default": "That's a great question! I'm trained to talk about Ebinesar's professional background. Try asking about his 'skills', 'projects', or 'internship'."
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = input.toLowerCase();
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');

    setTimeout(() => {
      let botResponse = responses.default;
      if (userMsg.includes('project')) botResponse = responses.projects;
      else if (userMsg.includes('skill') || userMsg.includes('tech')) botResponse = responses.skills;
      else if (userMsg.includes('internship') || userMsg.includes('appdost')) botResponse = responses.internship;
      else if (userMsg.includes('contact') || userMsg.includes('email')) botResponse = responses.contact;
      else if (userMsg.includes('hackathon') || userMsg.includes('win')) botResponse = responses.hackathon;

      setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[320px] sm:w-[380px] h-[450px] glass-morphism rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-black/50 border-accent-primary/20"
          >
            {/* Header */}
            <div className="p-4 bg-accent-primary/10 border-b border-glass-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-white">
                  <FiCpu size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold">Ebinesar AI</p>
                  <p className="text-[10px] text-accent-secondary">Always Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-white transition-colors">
                <FiX size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    m.role === 'user' 
                      ? 'bg-accent-primary text-white rounded-tr-none' 
                      : 'bg-dark-600 text-text-primary rounded-tl-none border border-glass-border'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-dark-900 border-t border-glass-border flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 bg-dark-700 border border-glass-border rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-accent-primary transition-colors"
              />
              <button 
                onClick={handleSend}
                className="w-10 h-10 bg-accent-primary rounded-xl flex items-center justify-center text-white hover:scale-105 transition-transform"
              >
                <FiSend size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-accent-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-accent-primary/40 hover:scale-110 active:scale-95 transition-all outline-none"
      >
        {isOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
      </button>
    </div>
  );
};

export default AIChatbot;
