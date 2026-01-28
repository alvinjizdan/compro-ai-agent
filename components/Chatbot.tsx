import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { getGeminiResponse } from '../services/geminiService';

interface ChatBotProps {
  products: any[];
}

const ChatBot: React.FC<ChatBotProps> = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [history, setHistory] = useState([
    {
      role: 'model',
      parts: 'Halo! 👋 Saya CS Virtual PT Radhika. Ada yang bisa saya bantu jelaskan tentang produk cocopeat kami?'
    }
  ]);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100); // Sedikit delay agar render selesai baru scroll
    }
  }, [history, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', parts: input };
    setHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const replyText = await getGeminiResponse(history, input, products);
      const botMessage = { role: 'model', parts: replyText };
      setHistory(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error Gemini:", error);
      setHistory(prev => [...prev, { role: 'model', parts: 'Maaf, koneksi sedang tidak stabil. Mohon coba lagi.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] font-sans flex flex-col items-end gap-4">
      <div 
        className={`
          w-[350px] h-[550px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col
          transition-all duration-300 ease-out origin-bottom-right transform
          ${isOpen 
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' // BUKA
            : 'opacity-0 scale-95 translate-y-10 pointer-events-none h-0' // TUTUP (Pakai h-0 agar tidak makan tempat)
          }
        `}
      >
          {/* HEADER */}
          <div className="bg-gradient-to-r from-green-700 to-green-600 p-4 flex justify-between items-center text-white shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">CS Udin (AI)</h3>
                <div className="flex items-center gap-1.5 opacity-90">
                  <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                  <span className="text-xs">Online</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* CHAT BODY */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
            {history.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2 flex-shrink-0 border border-green-200">
                    <Bot size={14} className="text-green-700" />
                  </div>
                )}
                <div className={`max-w-[75%] p-3.5 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-green-600 text-white rounded-2xl rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.parts}</div>
                </div>
                {msg.role === 'user' && (
                   <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center ml-2 flex-shrink-0">
                    <User size={14} className="text-slate-500" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2 border border-green-200">
                    <Bot size={14} className="text-green-700" />
                 </div>
                 <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-green-600" />
                    <span className="text-xs text-slate-500 italic">Sedang mengetik...</span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT AREA */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="relative flex items-center gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tulis pesan Anda..."
                className="flex-1 bg-slate-100 text-slate-800 text-sm rounded-full pl-5 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 border border-transparent focus:border-green-500 transition-all shadow-inner"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-1.5 top-1.5 p-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-full transition-all shadow-sm transform hover:scale-105"
              >
                <Send size={16} className={isLoading ? 'opacity-0' : 'opacity-100'} />
              </button>
            </div>
          </div>
      </div>

      {/* ==============================================
          BAGIAN 2: TOMBOL UTAMA
         ============================================== */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`
          group flex items-center justify-center bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg 
          transition-all duration-300 ease-in-out hover:pr-6 hover:pl-4
          ${isOpen ? 'scale-0 opacity-0 absolute' : 'scale-100 opacity-100 relative'} 
        `}
      >
        <MessageCircle size={30} className="transition-transform duration-300 group-hover:rotate-12" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[100px] group-hover:ml-2 transition-[max-width,margin] duration-300 ease-in-out font-bold">
            Chat CS
        </span>
      </button>

    </div>
  );
};

export default ChatBot;