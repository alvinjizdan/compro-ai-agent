// File: components/ChatBot.tsx

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

// ✅ PERUBAHAN DISINI:
// Gunakan '..' untuk naik satu folder, lalu masuk ke 'services'
import { getGeminiResponse } from '../services/geminiService'; 

interface Message {
  text: string;
  isUser: boolean;
}

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Halo! Selamat datang di PT Radhika. Ada yang bisa saya bantu terkait media tanam?", isUser: false }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll ke bawah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { text: userMsg, isUser: true }]);
    setInput("");
    setIsLoading(true);

    // Panggil AI
    const botReply = await getGeminiResponse(userMsg);

    setMessages(prev => [...prev, { text: botReply, isUser: false }]);
    setIsLoading(false);
  };

 return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* ============================================================ */}
      {/* JENDELA CHAT (Selalu di-render, tapi mainkan Opacity/Scale)  */}
      {/* ============================================================ */}
      <div 
        className={`
          bg-white w-full md:w-96 h-[450px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col mb-4 overflow-hidden
          transition-all duration-500 ease-out transform origin-bottom-right
          ${isOpen 
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto visible' 
            : 'opacity-0 scale-90 translate-y-10 pointer-events-none invisible h-0 mb-0'}
        `}
      >
        
        {/* Header Chat (Warna Hijau Anda) */}
        <div className="bg-green-700 p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-green-200 p-1.5 rounded-full">
              <Bot className="text-green-700" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm">CS Udin</h3>
              <span className="flex items-center gap-1.5 w-fit mt-0.5 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-200/50">
                <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                <span className="text-[10px] font-semibold text-green-400 uppercase tracking-wide">
                  Online
                </span>
              </span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-slate-800 p-1 rounded transition">
            <X size={20} />
          </button>
        </div>

        {/* Isi Pesan (Background Hijau Muda Anda) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-green-200">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.isUser 
                  ? 'bg-green-800 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none text-slate-500 text-xs italic shadow-sm">
                  Sedang mengetik...
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tulis pertanyaan..."
            className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white p-2.5 rounded-full transition disabled:bg-slate-300"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TOMBOL LAUNCHER (Animasi Mengecil saat Chat Dibuka)          */}
      {/* ============================================================ */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`
          bg-green-700 hover:bg-green-600 text-white p-4 rounded-full shadow-xl flex items-center gap-2 group
          transition-all duration-300 ease-in-out transform
          ${isOpen ? 'scale-0 opacity-0 pointer-events-none absolute' : 'scale-100 opacity-100 hover:scale-110'}
        `}
      >
        <MessageCircle size={28} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-bold text-sm">
          Customer Service
        </span>
      </button>
    </div>
  );
};