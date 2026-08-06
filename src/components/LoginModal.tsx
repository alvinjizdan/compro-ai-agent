import React, { useState } from 'react';
import { ArrowLeft, User, Lock, LogIn } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string) => void;
}

export const LoginModal = ({ isOpen, onClose, onLogin }: LoginModalProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Jika tidak open, jangan tampilkan apa-apa
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "12345") {
      onLogin(username);
      setError("");
      setUsername("");
      setPassword("");
    } else {
      setError("Username atau Password salah!");
    }
  };

  return (
    // Z-INDEX 60 agar menutupi Navbar dan Chatbot
    <div className="fixed inset-0 z-[9999] bg-white flex min-h-screen animate-in slide-in-from-bottom-10 duration-500">
      
      {/* BAGIAN KIRI: GAMBAR / BRANDING (Hidden di HP, Muncul di Laptop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
        {/* Background Pattern Abstrak */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/100 to-green-900/20"></div>
        
        <div className="relative z-10 text-center p-12">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 inline-block mb-6">
             <img src="/logobulet.png" alt="Logo" className="w-24 h-24 object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">PT Radhika Narya Daruna</h1>
          <p className="text-slate-300 text-lg max-w-md mx-auto leading-relaxed">
            Penjualan Media Tanam Kualitas Ekspor.
          </p>
        </div>
      </div>

      {/* BAGIAN KANAN: FORM LOGIN */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-16 bg-white relative">
        
        {/* Tombol Kembali */}
        <button 
          onClick={onClose}
          className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors font-medium group"
        >
          <div className="bg-slate-100 p-2 rounded-full group-hover:bg-orange-100 transition-colors">
            <ArrowLeft size={20} />
          </div>
          Kembali ke Beranda
        </button>

        <div className="max-w-md mx-auto w-full">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Selamat Datang</h2>
            <p className="text-slate-500">Silakan masuk untuk memesan produk.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-200 flex items-center gap-2 animate-in shake">
                 ⚠️ {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <a href="#" className="text-xs text-blue-600 hover:underline">Lupa password?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-700 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-orange-500/30 active:scale-95 flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              Masuk Sekarang
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            © 2025 PT Radhika Narya Daruna. Secure Login.
          </p>
        </div>
      </div>
    </div>
  );
};