import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Package, Plus, Trash2, ClipboardList, 
  ShoppingCart, Users, Menu, X, Save, Edit 
} from 'lucide-react';

// Tipe Data
interface Product {
  id?: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description?: string; // Tambahkan optional description agar tidak error di form
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // --- STATE DATA ---
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // --- STATE UI (Tab & Modal) ---
  const [activeTab, setActiveTab] = useState('recap'); // 'dashboard', 'products', 'orders'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // --- STATE MOBILE MENU (BARU) ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hitung Total Pendapatan
  const totalRevenue = orders.reduce((sum, order) => {
    return order.status === 'Batal' ? sum : sum + order.totalPrice;
  }, 0);

  // Hitung Jumlah Pesanan: Hanya hitung yang TIDAK batal
  const totalOrderCount = orders.filter(order => order.status !== 'Batal').length;
  
  // --- STATE FORM ---
  const [formData, setFormData] = useState<Product>({
    name: '', category: 'Bahan Baku', price: 0, stock: 0, image: '', description: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // 1. CEK LOGIN & AMBIL DATA
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('username'); 

    if (!token) {
      navigate('/login');
    } else {
      setAdminName(user || "Admin");
      fetchProducts();
      fetchOrders();
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      setUsers(res.data);
    } catch (error) {
      console.error("Gagal ambil user");
    }
  };

  // GANTI ROLE USER
  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}/role`, { role: newRole });
      fetchUsers(); // Refresh tabel
      alert(`Role berhasil diubah menjadi ${newRole}`);
    } catch (error) {
      alert("Gagal mengubah role");
    }
  };

  // HAPUS USER
  const handleDeleteUser = async (userId: number, usernameTarget: string) => {
    const currentAdmin = localStorage.getItem('username');
    if (usernameTarget === currentAdmin) {
      alert("Anda tidak bisa menghapus akun Anda sendiri saat sedang login!");
      return;
    }

    if (window.confirm(`Yakin ingin menghapus user ${usernameTarget}?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${userId}`);
        fetchUsers();
      } catch (error) {
        alert("Gagal menghapus user");
      }
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error("Gagal ambil data order", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Gagal ambil data", error);
    }
  };

  // 2. FUNGSI HANDLE TOMBOL
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'stock') {
      const numValue = Number(value);
      if (numValue < 0) return; 
      setFormData({ ...formData, [name]: numValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, { status: newStatus });
      fetchOrders(); 
    } catch (error) {
      alert("Gagal mengubah status.");
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (window.confirm("Yakin ingin menghapus riwayat pesanan ini?")) {
      try {
        await axios.delete(`http://localhost:5000/api/orders/${orderId}`);
        fetchOrders(); 
      } catch (error) {
        alert("Gagal menghapus pesanan.");
      }
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ name: '', category: 'Bahan Baku', price: 0, stock: 0, image: '', description: '' });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setIsEditing(true);
    setFormData(product);
    setImageFile(null);
    setIsModalOpen(true);
  };

  // 3. TOMBOL SIMPAN (CREATE / UPDATE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('price', formData.price.toString());
    data.append('stock', formData.stock.toString());
    data.append('description', formData.description || "");

    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (isEditing && formData.id) {
        await axios.put(`http://localhost:5000/api/products/${formData.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' } 
        });
        alert("Produk berhasil diperbarui!");
      } else {
        await axios.post('http://localhost:5000/api/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert("Produk baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      fetchProducts(); 
    } catch (error) {
      alert("Gagal menyimpan data.");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Yakin ingin menghapus produk ini?")) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        alert("Produk dihapus.");
        fetchProducts();
      } catch (error) {
        alert("Gagal menghapus.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-green-900 text-white shadow-lg sticky top-0 z-40">
        <div className="px-4 md:px-8 py-4 flex justify-between items-center">
          
          {/* 1. LOGO & BRAND */}
          <div className="flex items-center gap-3">
            <div className="bg-transparent p-2 rounded-lg text-white shadow-lg">
              <img src="/logobulet.png" alt="Logo" className="h-8 md:h-10 w-auto" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold tracking-wide leading-none">DASHBOARD ADMIN</h1>
              <p className="text-[10px] text-green-200 tracking-wider">PT RADHIKA NARYA DARUNA</p>
            </div>
          </div>

          {/* 2. MENU DESKTOP (Hidden di Mobile) */}
          <div className="hidden md:flex items-center gap-4">
            {['recap', 'products', 'orders', 'users'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  activeTab === tab 
                  ? 'bg-green-800 text-white shadow-inner ring-1 ring-green-700' 
                  : 'text-green-200 hover:text-white hover:bg-green-800/50'
                }`}
              >
                {tab === 'recap' && <ClipboardList size={18} />}
                {tab === 'products' && <Package size={18} />}
                {tab === 'orders' && <ShoppingCart size={18} />}
                {tab === 'users' && <Users size={18} />}
                <span className="capitalize">
                    {tab === 'products' ? 'Produk' : tab === 'orders' ? 'Pesanan' : tab === 'users' ? 'Pengguna' : 'Ringkasan'}
                </span>
              </button>
            ))}
          </div>

          {/* 3. LOGOUT & HAMBURGER (Kanan) */}
          <div className="flex items-center gap-4">
            {/* User Info (Desktop) */}
            <span className="text-green-200 text-sm hidden md:block">Halo, <b>{adminName}</b></span>
            
            {/* Tombol Logout (Desktop) */}
            <button onClick={handleLogout} className="hidden md:flex bg-red-600/90 hover:bg-red-600 p-2 rounded-lg text-white transition shadow-md items-center gap-2">
              <LogOut size={18} /> <span className="text-sm font-bold">Keluar</span>
            </button>

            {/* Tombol Hamburger (MOBILE ONLY) */}
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-white hover:bg-green-800 rounded-lg transition"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* --- DROPDOWN MENU MOBILE (BARU) --- */}
        {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-green-800 border-t border-green-700 shadow-xl animate-in slide-in-from-top-2">
                <div className="flex flex-col p-4 space-y-2">
                    {/* Menu Items */}
                    {['recap', 'products', 'orders', 'users'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all text-left ${
                                activeTab === tab 
                                ? 'bg-green-900 text-white border border-green-700 shadow-sm' 
                                : 'text-green-100 hover:bg-green-700 hover:text-white'
                            }`}
                        >
                            {tab === 'recap' && <ClipboardList size={20} />}
                            {tab === 'products' && <Package size={20} />}
                            {tab === 'orders' && <ShoppingCart size={20} />}
                            {tab === 'users' && <Users size={20} />}
                            <span className="capitalize">
                                {tab === 'products' ? 'Produk' : tab === 'orders' ? 'Pesanan' : tab === 'users' ? 'Pengguna' : 'Ringkasan'}
                            </span>
                        </button>
                    ))}

                    <div className="h-px bg-green-700 my-2"></div>

                    {/* Logout Mobile */}
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg border border-red-500 bg-red-900 text-white hover:bg-red-900 hover:text-white font-bold transition-all text-left mt-2"
                    >
                        <LogOut size={20} />
                        <span>Keluar (Logout)</span>
                    </button>
                </div>
            </div>
        )}
      </nav>

      {/* --- CONTENT UTAMA --- */}
      <main className="p-4 md:p-8 container mx-auto">
        
        {/* --- 1. TAB RINGKASAN --- */}
        {activeTab === 'recap' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KARTU STATISTIK */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
                <div className="p-4 bg-green-100 text-green-700 rounded-full"><ClipboardList size={24}/></div>
                <div>
                  <p className="text-sm text-stone-500 font-bold">Total Pendapatan</p>
                  <h4 className="text-2xl font-bold text-stone-800">Rp {totalRevenue.toLocaleString('id-ID')}</h4>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
                <div className="p-4 bg-orange-100 text-orange-700 rounded-full"><ShoppingCart size={24}/></div>
                <div>
                  <p className="text-sm text-stone-500 font-bold">Total Transaksi</p>
                  <h4 className="text-2xl font-bold text-stone-800">{totalOrderCount} Pesanan</h4>
                </div>
              </div>
            </div>

            {/* TABEL RIWAYAT PENJUALAN SINGKAT */}
            <div className="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden">
              <div className="p-6 border-b border-stone-100 bg-stone-50">
                <h3 className="font-bold text-lg text-stone-800">Riwayat Penjualan Terbaru</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-stone-100 text-stone-600 text-sm uppercase">
                    <tr>
                      <th className="p-4">Tanggal</th>
                      <th className="p-4">Pelanggan</th>
                      <th className="p-4">Detail Barang</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-stone-400">Belum ada data penjualan.</td></tr>
                    ) : (
                      orders.slice(0, 5).map((order) => { // Tampilkan max 5 saja di ringkasan
                        let itemsList = [];
                        try { itemsList = JSON.parse(order.items); } catch(e) {}
                        
                        return (
                          <tr key={order.id} className="hover:bg-stone-50">
                            <td className="p-4 text-sm text-stone-500">
                              {new Date(order.date).toLocaleDateString('id-ID')}
                            </td>
                            <td className="p-4 font-bold text-stone-800">{order.customerName}</td>
                            <td className="p-4 text-sm text-stone-600">
                              {itemsList.map((i: any, idx:number) => (
                                <div key={idx}>{i.name} x{i.quantity}</div>
                              ))}
                            </td>
                            <td className="p-4 font-bold text-green-600">
                              Rp {order.totalPrice.toLocaleString('id-ID')}
                            </td>
                            <td className="p-4">
                              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* --- 2. TAB PRODUK --- */}
        {activeTab === 'products' && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-800">Manajemen Produk</h2>
                <p className="text-stone-500 mt-1 text-sm md:text-base">Atur stok, harga, dan ketersediaan barang di sini.</p>
              </div>
              <button 
                onClick={openAddModal}
                className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-orange-200 transition transform hover:-translate-y-1"
              >
                <Plus size={20} /> <span>Tambah Produk</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden">
              {loading ? (
                <div className="p-10 text-center text-stone-400 animate-pulse">Sedang memuat data...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-green-50 border-b border-green-100">
                      <tr>
                        <th className="p-5 text-sm font-bold text-green-800 uppercase">Produk</th>
                        <th className="p-5 text-sm font-bold text-green-800 uppercase">Kategori</th>
                        <th className="p-5 text-sm font-bold text-green-800 uppercase">Harga</th>
                        <th className="p-5 text-sm font-bold text-green-800 uppercase w-32">Stok</th>
                        <th className="p-5 text-sm font-bold text-green-800 uppercase text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {products.map((item) => (
                        <tr key={item.id} className="hover:bg-orange-50 transition duration-200">
                          <td className="p-5">
                            <div className="flex items-center gap-4">
                              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-stone-200 border border-stone-200" />
                              <span className="font-bold text-stone-800">{item.name}</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-5 font-medium text-stone-700">
                            Rp {item.price.toLocaleString('id-ID')}
                          </td>
                          <td className="p-5">
                            <span className={`font-bold ${item.stock < 50 ? 'text-red-600' : 'text-green-600'}`}>
                              {item.stock}
                            </span> 
                            <span className="text-xs text-stone-400"> kg/pcs</span>
                          </td>
                          <td className="p-5 text-center">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => openEditModal(item)}
                                className="text-stone-400 hover:text-orange-500 transition p-2 hover:bg-orange-50 rounded-full" 
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>

                              <button 
                                onClick={() => handleDelete(item.id!)}
                                className="text-stone-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-full" 
                                title="Hapus"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- 3. TAB PESANAN --- */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <div>
                <h3 className="font-bold text-xl text-stone-800">Daftar Pesanan Masuk</h3>
                <p className="text-stone-500 text-sm">Kelola status pesanan pelanggan di sini.</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-100 text-stone-600 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Pelanggan</th>
                    <th className="p-4">Item Belanja</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((order) => {
                    let itemsList = [];
                    try { itemsList = JSON.parse(order.items); } catch(e) {}

                    return (
                      <tr key={order.id} className={`hover:bg-stone-50 transition duration-150 ${order.status === 'Batal' ? 'opacity-50 bg-stone-100 grayscale' : ''}`}>
                        <td className="p-4 text-sm text-stone-500 font-bold">
                          {new Date(order.date).toLocaleDateString('id-ID')}
                          <div className="text-xs text-stone-400">{new Date(order.date).toLocaleTimeString('id-ID')}</div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-stone-800">{order.customerName}</span>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-stone-600 space-y-1">
                            {itemsList.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                                {item.name} <span className="text-xs font-bold text-stone-400">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 font-bold text-green-700">
                          Rp {order.totalPrice.toLocaleString('id-ID')}
                        </td>
                        <td className="p-4">
                          <select 
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-full border-none cursor-pointer focus:ring-2 focus:ring-offset-1 outline-none transition
                              ${order.status === 'Selesai' ? 'bg-green-100 text-green-700 focus:ring-green-500' : 
                                order.status === 'Dikirim' ? 'bg-blue-100 text-blue-700 focus:ring-blue-500' :
                                order.status === 'Batal' ? 'bg-red-100 text-red-700 focus:ring-red-500' :
                                'bg-yellow-100 text-yellow-700 focus:ring-yellow-500'
                              }`}
                          >
                            <option value="Menunggu Konfirmasi">Menunggu</option>
                            <option value="Diproses">Diproses</option>
                            <option value="Dikirim">Dikirim</option>
                            <option value="Selesai">Selesai</option>
                            <option value="Batal">Batal</option>
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                            title="Hapus Pesanan"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="p-10 text-center text-stone-400 bg-stone-50/50">Belum ada pesanan masuk.</div>
              )}
            </div>
          </div>
        )}

        {/* --- 4. TAB PENGGUNA --- */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="p-6 border-b border-stone-100 bg-stone-50">
              <h3 className="font-bold text-xl text-stone-800">Daftar Pengguna</h3>
              <p className="text-stone-500 text-sm">Kelola akses dan daftar user terdaftar.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-100 text-stone-600 text-xs uppercase font-bold">
                  <tr>
                    <th className="p-4">Tanggal Daftar</th>
                    <th className="p-4">Username</th>
                    <th className="p-4">Role / Akses</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-stone-50 transition">
                      <td className="p-4 text-stone-500 text-sm">
                        {new Date(user.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-4 font-bold text-stone-800 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        {user.username}
                        {user.username === localStorage.getItem('username') && (
                          <span className="text-[10px] bg-stone-200 px-2 py-0.5 rounded-full text-stone-600">You</span>
                        )}
                      </td>
                      <td className="p-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border-none cursor-pointer outline-none transition
                            ${user.role === 'ADMIN' 
                              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                        >
                          <option value="USER">User (Pembeli)</option>
                          <option value="ADMIN">Admin (Pengelola)</option>
                        </select>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="text-stone-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                          title="Hapus User"
                          disabled={user.username === localStorage.getItem('username')}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="p-10 text-center text-stone-400">Belum ada user terdaftar.</div>
              )}
            </div>
          </div>
        )}
        
      </main>

      {/* --- MODAL POPUP (FORM TAMBAH/EDIT) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-green-900 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                {isEditing ? <Edit size={18}/> : <Plus size={18}/>}
                {isEditing ? "Edit Produk" : "Tambah Produk Baru"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Nama Produk</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full border border-stone-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none transition" placeholder="Contoh: Kopra Super" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">Kategori</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border border-stone-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-orange-500 outline-none transition">
                    <option value="Bahan Baku">Bahan Baku</option>
                    <option value="Kopra">Kopra</option>
                    <option value="Kelapa Utuh">Kelapa Utuh</option>
                    <option value="Minyak">Minyak</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">Harga (Rp)</label>
                  <input type="number" name="price" min ="0" value={formData.price === 0 ? '' : formData.price} onChange={handleInputChange} required placeholder="0" className="w-full border border-stone-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none transition" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Stok Tersedia</label>
                <input type="number" name="stock" min="0"value={formData.stock === 0 ? '' : formData.stock} onChange={handleInputChange} required placeholder="0" className="w-full border border-stone-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none transition" />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Deskripsi Produk</label>
                <textarea 
                  name="description" 
                  value={formData.description || ""} 
                  onChange={handleInputChange} 
                  rows={3}
                  className="w-full border border-stone-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none transition" 
                  placeholder="Contoh: Kopra kering kualitas super, kadar air 5%..." 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Upload Gambar</label>
                {/* PREVIEW GAMBAR (Jika Edit) */}
                {formData.image && !imageFile && (
                  <img src={formData.image} alt="Preview" className="w-20 h-20 object-cover rounded mb-2 border" />
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0]); 
                    }
                  }}
                  className="w-full border border-stone-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 transition" 
                />
                <p className="text-[10px] text-stone-400 mt-1">*Format: JPG, PNG, JPEG (Maks 2MB)</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-stone-300 text-stone-600 font-bold rounded-lg hover:bg-stone-50 transition">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 shadow-lg transition flex items-center justify-center gap-2">
                  <Save size={18} /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}