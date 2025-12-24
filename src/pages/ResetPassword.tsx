import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Lock } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams(); // Mengambil token unik dari URL
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Kirim password baru + token ke backend
      await axios.post(`http://localhost:5000/api/reset-password/${token}`, { newPassword: password });
      alert("Sukses! Password berhasil diubah. Silakan Login dengan password baru.");
      navigate('/login');
    } catch (error: any) {
      alert(error.response?.data?.error || "Token kadaluarsa atau tidak valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-stone-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={24} />
          </div>
          <h2 className="text-2xl font-bold text-stone-800">Buat Password Baru</h2>
          <p className="text-stone-500 text-sm mt-1">Silakan masukkan password baru untuk akun Anda.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Password Baru</label>
            <input 
              type="password" 
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
              required
              minLength={3}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition shadow-lg shadow-orange-200"
          >
            {loading ? "Menyimpan..." : <><Save size={18}/> Simpan Password</>}
          </button>
        </form>
      </div>
    </div>
  );
}
