import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FiMessageSquare, FiX, FiCpu, FiMaximize2 } from 'react-icons/fi';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Your Relevance AI Agent URL (Constructed from your provided link)
  // Your Relevance AI Agent URL
  const agentUrl = "https://app.relevanceai.com/agents/f1db6c/fb6f380d-e8a3-433c-a49e-bc18f32c8452/784ef5f9-2aea-4fc1-8ba1-a98d04f4723e/embed-chat?hide_tool_steps=false&hide_file_uploads=false&hide_conversation_list=false&bubble_style=agent&primary_color=%23685FFF&bubble_icon=pd%2Fchat&input_placeholder_text=Type+your+message...&hide_logo=false&hide_description=false";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ 
               opacity: 1, 
               y: 0, 
               scale: 1,
               width: isMaximized ? '90vw' : '400px',
               height: isMaximized ? '85vh' : '600px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`mb-4 glass-morphism rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl shadow-black/60 border-2 border-accent-primary/30 transition-all duration-300`}
            style={{ 
               right: isMaximized ? '5vw' : '0',
               bottom: isMaximized ? '10vh' : '0'
            }}
          >
            {/* Premium Header */}
            <div className="p-5 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 border-b border-glass-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-accent-primary flex items-center justify-center text-white shadow-lg shadow-accent-primary/30">
                  <FiCpu size={20} />
                </div>
                <div>
                  <p className="text-sm font-black tracking-tight text-white uppercase">Relevance AI Agent</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[10px] font-bold text-accent-secondary uppercase">Neural Link Active</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMaximized(!isMaximized)} 
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-text-muted hover:text-white"
                  title="Toggle Fullscreen"
                >
                  <FiMaximize2 size={18} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-text-muted hover:text-white"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* Relevance AI Iframe */}
            <div className="flex-1 bg-white">
              <iframe
                src={agentUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="microphone; clipboard-write; camera"
                title="Relevance AI Agent"
                className="w-full h-full"
              />
            </div>

            {/* Subtle Footer Branding */}
            <div className="p-3 bg-dark-900/50 flex justify-center border-t border-glass-border">
               <p className="text-[9px] font-bold text-text-muted tracking-widest uppercase">Powered by Relevance AI • Intelligence Tier 1</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl transition-all outline-none border-2 ${
           isOpen 
           ? 'bg-dark-800 border-white/10' 
           : 'bg-gradient-to-tr from-accent-primary to-accent-secondary border-white/20 shadow-accent-primary/40'
        }`}
      >
        {isOpen ? <FiX size={28} /> : <FiMessageSquare size={28} />}
      </motion.button>
    </div>
  );
};

export default AIChatbot;
