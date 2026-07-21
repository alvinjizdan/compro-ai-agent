import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen flex w-full bg-white font-sans overflow-hidden">
      {/* LEFT COLUMN (Orange Side) */}
      <div className="hidden md:flex md:w-1/2 lg:w-[45%] bg-orange-600 bg-gradient-to-br from-orange-500 to-orange-700 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decorative lines */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-[30%] -right-[30%] w-[160%] h-[160%] rounded-full border-[1px] border-white scale-[1.2]" />
          <div className="absolute -top-[30%] -right-[30%] w-[160%] h-[160%] rounded-full border-[1px] border-white scale-[1.0]" />
          <div className="absolute -top-[30%] -right-[30%] w-[160%] h-[160%] rounded-full border-[1px] border-white scale-[0.8]" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 mt-10">
          <Sparkles size={64} className="text-white mb-2" strokeWidth={1.5} />
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Hello!
          </h1>
          <p className="text-orange-100 text-base md:text-lg max-w-md leading-relaxed mt-2 opacity-90">
            Kelola penjualan dan pesanan dengan efisien. Lebih produktif melalui otomatisasi cerdas dan hemat banyak waktu Anda!
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-orange-200">
          © 2026 PT Radhika Narya Daruna. All rights reserved.
        </div>
      </div>

      {/* RIGHT COLUMN (Form Side) */}
      <div className="w-full md:w-1/2 lg:w-[55%] flex flex-col p-8 md:p-16 lg:px-24 justify-center relative bg-white h-screen overflow-y-auto">
        
        {/* Logo Text Top Left */}
        <div className="absolute top-8 left-8 md:top-12 md:left-16 font-bold text-xl text-stone-900 tracking-tight flex items-center gap-2">
          <img src="/logobulet.png" alt="Logo" className="w-8 h-8" />
          PT Radhika Narya Daruna
        </div>

        <div className="w-full max-w-sm lg:max-w-md mx-auto mt-16 md:mt-0">
          <h2 className="text-3xl font-bold text-stone-900 mb-2">
            {isRegisterMode ? "Create Account" : "Welcome Back!"}
          </h2>
          <p className="text-stone-500 text-sm mb-10">
            {isRegisterMode ? "Please fill in your details to register." : "Please enter your details to login."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="relative">
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full py-3 border-b-2 border-stone-200 focus:border-orange-500 outline-none transition bg-transparent text-stone-900 placeholder-stone-400 font-medium"
                placeholder="Username"
                autoComplete="off"
                required
              />
            </div>

            {isRegisterMode && (
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 border-b-2 border-stone-200 focus:border-orange-500 outline-none transition bg-transparent text-stone-900 placeholder-stone-400 font-medium"
                  placeholder="Email Address"
                  required
                />
              </div>
            )}

            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-3 border-b-2 border-stone-200 focus:border-orange-500 outline-none transition bg-transparent text-stone-900 placeholder-stone-400 font-medium pr-10"
                placeholder="Password"
                autoComplete="off"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-3 text-stone-400 hover:text-orange-500 transition"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-lg transition mt-8 shadow-md"
            >
              {loading ? "Processing..." : (isRegisterMode ? "Register Now" : "Login Now")}
            </button>

            <div className="text-center pt-4">
              <p className="text-stone-500 text-sm mb-4">
                {isRegisterMode 
                  ? "Already have an account? " 
                  : "Don't have an account? "}
                <button 
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setUsername("");
                    setPassword("");
                  }}
                  className="text-orange-600 font-bold underline decoration-2 underline-offset-2 hover:text-orange-700 transition"
                >
                  {isRegisterMode ? "Login now" : "Create a new account now"}
                </button>
              </p>

              {!isRegisterMode && (
                <button 
                  type="button" 
                  onClick={() => navigate('/forgot-password')} 
                  className="text-sm text-stone-500 hover:text-stone-900 transition mt-2 block w-full"
                >
                  Forget password <span className="font-bold underline text-stone-800">Click here</span>
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}