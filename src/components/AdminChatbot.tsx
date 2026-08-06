import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Headset, X, Send, Loader2, Bot, User, Settings } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

interface AdminChatbotProps {
  onActionSuccess?: () => void;
}

const AdminChatbot: React.FC<AdminChatbotProps> = ({ onActionSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [history, setHistory] = useState<ChatMessage[]>([
    {
      role: 'model',
      parts: 'Halo Admin! Saya Asisten Operasional Anda. Ada produk atau status pesanan yang perlu saya perbarui hari ini?'
    }
  ]);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [history, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', parts: input };
    setHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        '/api/admin/chat',
        { message: input, history: history },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const botMessage: ChatMessage = {
        role: 'model',
        parts: response.data.reply
      };

      setHistory(prev => [...prev, botMessage]);

      // Jika database diperbarui oleh agen, beri tahu parent (Dashboard) untuk refresh data
      if (response.data.dbUpdated && onActionSuccess) {
        onActionSuccess();
      }
    } catch (error: any) {
      console.error("Error Admin Chatbot:", error);
      let errorMsg = 'Maaf, terjadi kesalahan komunikasi dengan server.';
      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMsg = 'Akses ditolak. Sesi Anda mungkin telah habis atau Anda bukan Admin.';
      }
      setHistory(prev => [...prev, { role: 'model', parts: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans flex flex-col items-end gap-4 pointer-events-none">
      {/* WINDOW CHAT */}
      <div
        className={`
          w-[350px] h-[550px] max-h-[80vh] bg-stone-50 rounded-2xl shadow-2xl border border-green-200 overflow-hidden flex flex-col
          transition-all duration-300 ease-out origin-bottom-right transform
          ${isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-10 pointer-events-none h-0'
          }
        `}
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-green-800 to-green-800 p-4 flex justify-between items-center text-white shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <Settings size={20} className="text-white animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-bold text-sm">AI Agent (Admin)</h3>
              <div className="flex items-center gap-1.5 opacity-90">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <p className="text-[10px] font-medium tracking-wide">ONLINE</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* AREA PESAN */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
          {history.map((msg, index) => (
            <div key={index} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 rounded-2xl shadow-sm text-sm ${msg.role === 'user' ? 'bg-orange-600 text-white rounded-tr-sm' : 'bg-white text-stone-700 border border-stone-200 rounded-tl-sm leading-relaxed'}`}>
                  {msg.parts}
                </div>
                <span className="text-[10px] text-stone-400 font-medium px-1">
                  {msg.role === 'user' ? 'Anda (Admin)' : 'Sistem AI'}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 shadow-sm">
                <Bot size={16} />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-stone-200 shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="text-green-600 animate-spin" />
                <span className="text-xs text-stone-500 font-medium">Memproses database...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div className="p-3 bg-white border-t border-stone-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-full pr-1 pl-4 py-1 focus-within:ring-2 focus-within:ring-green-500/50 focus-within:border-green-500 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Perintah admin..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-stone-700 placeholder-stone-400 py-2"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-stone-300 text-white p-2.5 rounded-full transition-colors shadow-sm"
            >
              <Send size={16} className={input.trim() && !isLoading ? 'translate-x-0.5 -translate-y-0.5 transition-transform' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* TOMBOL FLOATING */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          pointer-events-auto flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105
          ${isOpen ? 'bg-stone-800 text-white rotate-90' : 'bg-gradient-to-r from-green-800 to-green-800 text-white hover:shadow-green-500/30'}
        `}
      >
        {isOpen ? <X size={24} className="-rotate-90 transition-transform" /> : <Headset size={24} />}
      </button>
    </div>
  );
};

export default AdminChatbot;
