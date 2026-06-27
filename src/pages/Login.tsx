import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, UserPlus, LogIn, Eye, EyeOff, Mail } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  
  // State untuk Mode: Apakah sedang Login atau Register?
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // State Form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);// Default Role: USER
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegisterMode) {
      await axios.post('/api/register', {
       username,
       email, // 👈 Kirim email ke server
       password,
      });
      
        alert("Registrasi Berhasil! Silakan Login.");
        setIsRegisterMode(false); // Kembali ke mode login
      } else {
        // --- LOGIKA LOGIN ---
        const response = await axios.post('/api/login', {
          username,
          password
        });
        
        // Simpan Token & Data User
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);
        localStorage.setItem('username', response.data.username);

        alert("Login Sukses!");

        // Arahkan sesuai Role
        if (response.data.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-200 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-stone-200">
        
        {/* JUDUL */}
        <div className="text-center mb-8">
          <img src="/logobulet.png" alt="Logo" className="w-16 h-auto mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-stone-800 font-serif">
            {isRegisterMode ? "Buat Akun Baru" : "Selamat Datang"}
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            {isRegisterMode ? "Lengkapi data untuk mendaftar" : "Masuk untuk melanjutkan pesanan"}
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Input Username */}
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-stone-400 pointer-events-none" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition relative z-50 text-stone-900 bg-white"
                placeholder="Masukkan username"
                autoComplete="off"
                required
              />
            </div>
          </div>

{isRegisterMode && (
  <div>
    <label className="block text-sm font-bold text-stone-700 mb-1">Email</label>
    <div className="relative">
      <Mail className="absolute left-3 top-3 text-stone-400 pointer-events-none" size={18} />
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition relative z-50 text-stone-900 bg-white"
        placeholder="nama@email.com"
        required
      />
    </div>
  </div>
)}

          {/* Input Password */}
<div>
  <label className="block text-sm font-bold text-stone-700 mb-1">Password</label>
  <div className="relative">
    {/* Ikon Gembok (Kiri) */}
    <Lock className="absolute left-3 top-3 text-stone-400 pointer-events-none" size={18} />
    
    <input 
      // 👇 1. Tipe berubah sesuai state
      type={showPassword ? "text" : "password"} 
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      // 👇 2. Tambah 'pr-10' agar teks tidak tertutup tombol mata
      className="w-full pl-10 pr-10 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition relative z-50 text-stone-900 bg-white"
      placeholder="Masukkan password"
      autoComplete="off"
      required
    />

    {/* 👇 3. TOMBOL MATA (KANAN) */}
    <button
      type="button" // Wajib type="button" agar tidak submit form
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-4 text-stone-400 hover:text-orange-600 transition cursor-pointer"
      title={showPassword ? "Sembunyikan Password" : "Lihat Password"}
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>

  </div>
</div>

          <div className="text-right mt-2">
          <button 
           type="button" // Penting agar tidak dianggap submit form
           onClick={() => navigate('/forgot-password')} 
           className="text-xs font-bold text-orange-600 hover:underline transition"
          >
            Lupa Password?
          </button>
         </div>

          {/* Tombol Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            {loading ? "Memproses..." : (isRegisterMode ? "Daftar Sekarang" : "Login")}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* TOGGLE: Pindah antara Login & Register */}
        <div className="mt-6 text-center pt-6 border-t border-stone-100">
          <p className="text-sm text-stone-500 mb-2">
            {isRegisterMode ? "Sudah punya akun?" : "Belum punya akun?"}
          </p>
          <button 
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setUsername("");
              setPassword("");
            }}
            className="text-blue-600 font-bold text-sm hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            {isRegisterMode ? <><LogIn size={16}/> Login Disini</> : <><UserPlus size={16}/> Buat Akun Baru</>}
          </button>
        </div>

      </div>
    </div>
  );
}