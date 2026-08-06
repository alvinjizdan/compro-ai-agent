import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, ShoppingCart } from 'lucide-react'; // BARU: Tambah icon ShoppingCart
import { getGeminiResponse } from '../services/geminiService';

interface ChatBotProps {
  products: any[];
  onAddToCart: (productId: number | string) => void;
}

// BARU: Buat interface untuk tipe data history agar TypeScript tidak komplain
interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
  productIds?: string[];
}

const ChatBot: React.FC<ChatBotProps> = ({ products, onAddToCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // BARU: Gunakan interface ChatMessage pada state
  const [history, setHistory] = useState<ChatMessage[]>([
    {
      role: 'model',
      parts: 'Halo! Saya CS Virtual PT Radhika. Ada yang bisa saya bantu jelaskan tentang produk kami?',
      productIds: []
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

  // BARU: Fungsi untuk menangani klik Tambah ke Keranjang
  const handleAddToCartClick = (id: number | string) => {
    // 1. Panggil fungsi asli dari props
    onAddToCart(id);

    // 2. Alert (Opsional, untuk penanda saja)
    alert('Memproses produk ke keranjang...');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', parts: input };
    setHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // PERHATIAN: Pastikan getGeminiResponse sekarang me-return object JSON dari backend
      // Contoh: { reply: "teks balasan", productId: 12 }
      const responseData = await getGeminiResponse(history, input, products);

      const botMessage: ChatMessage = {
        role: 'model',
        parts: responseData.reply || responseData, // Fallback jika format lama
        productIds: responseData.productIds || (responseData.productId ? [responseData.productId] : [])
      };

      setHistory(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error Gemini:", error);
      setHistory(prev => [...prev, { role: 'model', parts: 'Maaf, koneksi sedang tidak stabil. Mohon coba lagi.', productIds: [] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] font-sans flex flex-col items-end gap-4 pointer-events-none">
      <div
        className={`
          w-[350px] h-[550px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col
          transition-all duration-300 ease-out origin-bottom-right transform pointer-events-auto
          ${isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-10 pointer-events-none h-0'
          }
        `}
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-orange-700 to-orange-600 p-4 flex justify-between items-center text-white shadow-md z-10">
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
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-2 flex-shrink-0 border border-green-200">
                  <Bot size={14} className="text-orange-700" />
                </div>
              )}

              <div className={`max-w-[75%] p-3.5 text-sm shadow-sm ${msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-2xl rounded-tr-none'
                  : 'bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-none'
                }`}>
                <div className="whitespace-pre-wrap leading-relaxed">{msg.parts}</div>

                {/* BARU: LOGIKA PEMUNCULAN TOMBOL ADD TO CART DENGAN DETAIL PRODUK (MULTIPLE) */}
                {msg.role === 'model' && msg.productIds && msg.productIds.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col gap-3">
                    {msg.productIds.map((pid, idx) => {
                      const suggestedProduct = products.find(p => String(p.id) === String(pid));
                      if (!suggestedProduct) return null;

                      return (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col gap-3 relative overflow-hidden">
                          {/* Aksen kiri */}
                          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>

                          <div className="flex justify-between items-center pl-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Rekomendasi Produk</span>
                              <span className="font-bold text-slate-800 text-sm leading-tight">{suggestedProduct.name}</span>
                            </div>
                            <span className="text-orange-600 font-bold text-sm bg-orange-50 px-2 py-1 rounded-md whitespace-nowrap">
                              Rp {suggestedProduct.price.toLocaleString('id-ID')}
                            </span>
                          </div>

                          <button
                            onClick={() => handleAddToCartClick(pid)}
                            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg font-semibold transition-all duration-200 shadow-sm active:scale-[0.98]"
                          >
                            <ShoppingCart size={16} />
                            Tambah ke Keranjang
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

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
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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

      {/* TOMBOL UTAMA */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          pointer-events-auto flex items-center justify-center bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg 
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