import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); // Reset pesan sebelumnya

    try {
      // Kirim username ke backend untuk dicek emailnya
      const res = await axios.post('http://localhost:5000/api/forgot-password', { username });
      setMessage(res.data.message); // Tampilkan pesan sukses dari server
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || "Gagal memproses permintaan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-stone-200">
        
        {/* Tombol Kembali */}
        <button 
          onClick={() => navigate('/login')} 
          className="flex items-center text-stone-500 mb-6 hover:text-orange-600 transition"
        >
          <ArrowLeft size={18} className="mr-2"/> Kembali ke Login
        </button>

        <h2 className="text-2xl font-bold text-stone-800 mb-2">Lupa Password?</h2>
        <p className="text-stone-500 mb-6 text-sm">
          Masukkan <b>Username</b> Anda. Kami akan mengirimkan link reset password ke email yang terdaftar.
        </p>

        {/* Jika Pesan Sukses Muncul */}
        {message ? (
          <div className="p-4 bg-green-100 text-green-800 rounded-xl text-center border border-green-200">
            <p className="font-bold mb-2">Email Terkirim! ✅</p>
            <p className="text-sm">{message}</p>
            <p className="text-xs mt-4 text-green-700">Silakan cek Inbox atau folder Spam email Anda.</p>
          </div>
        ) : (
          /* Form Input Username */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">Username</label>
              <input 
                type="text" 
                placeholder="Masukkan username Anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition disabled:opacity-50"
            >
              {loading ? "Mengirim..." : <><Send size={18}/> Kirim Link Reset</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}