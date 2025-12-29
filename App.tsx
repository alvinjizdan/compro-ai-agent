import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios'; 
import ProductCard from './components/ProductCard';
import { Search, ShoppingCart, Trash2, Plus, Minus, Sparkles, X, MapPin, Phone, ArrowRight, Menu as MenuIcon, ChevronRight, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { Product, CartItem, ReceiptData } from './types';
import ChatBot from './components/Chatbot';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './src/pages/Login';
import ForgotPassword from './src/pages/ForgotPassword';
import ResetPassword from './src/pages/ResetPassword';
import AdminDashboard from './src/pages/AdminDashboard';

// Kategori Tetap Statis
const CATEGORIES = ["Semua", "Bahan Baku", "Kopra", "Kelapa Utuh"];

// =================================================================
// 1. KOMPONEN HOME (Terima props 'products')
// =================================================================
const HomePage = ({ navigateTo, products, addToCart }: { navigateTo: (path: string) => void, products: Product[], addToCart: any }) => (
  <>
    {/* Hero Section */}
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pb-16">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-slate-900/50"></div> 
        <img src="/bannerbg.png" alt="Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>
      </div>
      <div className="container mx-auto px-6 relative z-10 text-center text-white pt-24 md:pt-16">
        <span className="inline-block py-1 px-3 rounded-full bg-green-500/20 border border-green-400/50 text-green-100 text-sm font-semibold tracking-wider mb-6 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-700">
          KOPRA KUALITAS PREMIUM
        </span>
        <h1 className="text-5xl md:text-6xl font-bold font-serif mb-6 mt-4 leading-tight animate-in slide-in-from-bottom-6 duration-1000">
          Pasokan Terjaga<br/>
          <span className="text-white-400">Bisnis Anda Tetap Menyala.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto mb-10 mt-9 leading-relaxed animate-in slide-in-from-bottom-8 duration-1000 delay-200">
          Jangan biarkan gudang kosong menghambat cuan. PT Radhika Narya Daruna siap menjadi mitra suplai kopra rutin dengan tonase yang bisa diandalkan.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center animate-in zoom-in-95 duration-1000 delay-300">
          <button onClick={() => navigateTo('/menu')} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-full transition flex items-center justify-center gap-2 group">
            Pesan Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={() => navigateTo('/about')} className="bg-green-600/30 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold py-4 px-8 rounded-full transition">
            Tentang Kami
          </button>
        </div>
      </div>
    </section>

    <AboutSection isStandalone={false} />
    
    {/* Home Favorites - MENGGUNAKAN DATA DATABASE */}
    <section className="py-2 bg-stone-50">
       <div className="container mx-auto px-6">
         <div className="text-center mb-10">
           <h2 className="text-orange-600 font-bold tracking-widest uppercase text-sm mb-2">Daftar Produk</h2>
           <h3 className="text-4xl font-serif font-bold text-slate-900 mb-4">Produk Pilihan Kami</h3>
         </div>
         {/* Tampilkan 4 Produk Teratas */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
           {products.slice(0, 4).map((product) => (
             <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
           ))}
         </div>
       </div>
    </section>

    <LocationSection isStandalone={false} />
  </>
);

// 2. ABOUT SECTION
const AboutSection = ({ isStandalone = false }: { isStandalone?: boolean }) => (
  <section className={`${isStandalone ? 'min-h-screen pt-32 pb-20' : 'py-32'} bg-white animate-in slide-in-from-bottom-4 duration-500`}>
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
          <h2 className="text-orange-600 font-bold tracking-widest uppercase text-sm mb-2">Tentang Kami</h2>
          <h3 className="text-4xl md:text-3xl font-serif font-bold text-slate-900">Dedikasi untuk Kualitas Komoditas Indonesia.</h3>
      </div>
      <div className="flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 relative">
           <div className="grid grid-cols-2 gap-4 relative z-10">
              <img src="/tentangkami1.jpg" className="rounded-2xl w-full h-80 object-cover shadow-xl transform translate-y-8" alt="2" />
              <img src="/tentangkami2.jpg" className="rounded-2xl w-full h-80 object-cover shadow-xl" alt="1" />
           </div>
        </div>
        <div className="flex-1">
          <h3 className="text-3xl font-serif font-bold text-slate-900 mb-6">Kenapa Bermitra dengan Kami?</h3>
          <p className="text-slate-600 leading-relaxed mb-6 text-lg">
            Di PT Radhika Narya Daruna, kami memahami bahwa konsistensi adalah kunci bisnis Anda. Kami memastikan setiap kilogram Kopra dan produk kelapa yang Anda terima memiliki spesifikasi yang tepat.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="flex items-start gap-4">
              <div className="bg-orange-100 p-3 rounded-xl text-orange-600 shrink-0"><Sparkles size={24} /></div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Sortir Grade Transparan</h4>
                <p className="text-sm text-slate-500">Kami memisahkan Kopra Regular dan Asongan secara tegas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// 3. MENU PAGE (Menerima products dari database)
interface MenuPageProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  addToCart: (p: Product, q: number) => void;
  products: Product[]; // ✅ TERIMA DATA DATABASE
}

const MenuPage: React.FC<MenuPageProps> = ({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, addToCart, products }) => {
  // Filter Data Database
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Semua" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, products]);


  return (
    <section className="min-h-screen pt-24 pb-20 bg-stone-50 animate-in fade-in duration-500">
      <div className="container mx-auto px-6">
        {/* Filter & Search */}
        <div className="w-fit flex flex-col md:flex-row justify-start items-center gap-6 mb-10 bg-white p-4 rounded-2xl shadow-sm border-2 border-slate-300 sticky top-24 z-20">
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat ? 'bg-orange-200 text-orange-600 shadow-md' : 'bg-stone-200 text-slate-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                <Search size={48} className="mb-4 opacity-30" />
                <p>Maaf, produk tidak ditemukan atau belum dimuat.</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))
            )}
        </div>
      </div>
    </section>
  );
};

// 4. LOCATION PAGE
const LocationSection = ({ isStandalone = false }: { isStandalone?: boolean }) => (
  <section className={`${isStandalone ? 'min-h-screen pt-32 pb-20' : 'py-8'} bg-white animate-in slide-in-from-bottom-4 duration-500`}>
     <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">Kunjungi Kami</h2>
          <p className="text-slate-600">Kami menantikan kehadiran Anda dan keluarga.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-start">
           <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Informasi Kontak</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-full text-orange-600"><MapPin size={24} /></div>
                  <div>
                    <h4 className="font-bold text-slate-900">Alamat Utama</h4>
                    <p className="text-slate-600">Apartement Educity Pakuwon City Tower Stamford Kalisari Street Dharma Selatan, Surabaya.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-full text-orange-600"><Phone size={24} /></div>
                  <div>
                    <h4 className="font-bold text-slate-900">Telepon</h4>
                    <p className="text-slate-600">+62 21 555 0199</p>
                  </div>
                </div>
              </div>
           </div>
           
           {/* PETA */}
           <div className="h-[500px] bg-slate-200 rounded-3xl overflow-hidden shadow-lg relative group">
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop" alt="Map" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center">
                <a href="https://maps.app.goo.gl/suC8TopfzE9wuNLj7" target="_blank" rel="noopener noreferrer" className="bg-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce hover:bg-slate-50 transition-colors cursor-pointer text-slate-900">
                  <MapPin className="text-red-600" size={24}/>
                  <span className="font-bold">Lokasi Kami</span>
                </a>
              </div>
           </div>
        </div>
     </div>
  </section>
);

// =================================================================
// MAIN APP COMPONENT
// =================================================================

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  
  // ✅ STATE UNTUK DATA DATABASE (PENGGANTI MOCK DATA)
  const [products, setProducts] = useState<Product[]>([]);

  // ✅ FETCH DATA DARI DATABASE SAAT WEBSITE DIBUKA
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Login States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [username, setUsername] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // Check Login Status on Route Change
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedUser = localStorage.getItem('username');
    
    if (token) {
      setIsLoggedIn(true);
      setUsername(storedRole === 'ADMIN' ? 'Admin' : (storedUser || 'User')); 
    } else {
      setIsLoggedIn(false);
      setUsername("");
    }
  }, [location.pathname]);

  // Cart Persistence
  useEffect(() => {
    const savedCart = localStorage.getItem('shopping-cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('shopping-cart', JSON.stringify(cart));
  }, [cart]);

  // Handle Scroll Styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cart Functions
  const addToCart = (product: Product, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) return prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      return [...prev, { ...product, quantity: quantity }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) => prev.map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0));
  };

  const removeFromCart = (id: number) => setCart((prev) => prev.filter((item) => item.id !== id));

  const handleCheckout = async () => {
    // 1. Cek Login
    if (!isLoggedIn) {
      alert("Silakan Login terlebih dahulu untuk menyelesaikan pesanan.");
      navigate('/login');
      setIsCartOpen(false);
      return;
    }

    // 2. Cek Keranjang Kosong
    if (cart.length === 0) {
      alert("Keranjang belanja Anda kosong.");
      return;
    }

    // 3. Hitung Data (Untuk Database & WA)
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const totalPayment = subtotal + tax;

    // --- PROSES SIMPAN KE DATABASE (REKAP ADMIN) ---
    try {
      // Kita pakai 'await' agar WA baru terbuka SETELAH data tersimpan
      await axios.post('http://localhost:5000/api/orders', {
        customerName: username,   // Nama User yang sedang login
        items: cart,              // Daftar belanjaan
        totalPrice: totalPayment  // Total bayar
      });
      
      // Opsional: Console log untuk memastikan sukses
      console.log("Data berhasil disimpan ke Rekap Admin");

    } catch (error) {
      console.error("Gagal menyimpan ke database:", error);
      // Pilihan: Mau tetap lanjut ke WA meski database error?
      // Jika ya, biarkan saja. Jika tidak, return di sini.
      alert("Terjadi kesalahan sistem, namun Anda tetap akan diarahkan ke WhatsApp.");
    }

    // --- PROSES KIRIM KE WHATSAPP ---
    const phoneNumber = "628886268884"; 
    let message = `Halo Admin PT Radhika Narya Daruna,\n\nSaya *${username}* ingin memesan:\n\n`;
    
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* (${item.quantity} pcs) - ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price * item.quantity)}\n`;
    });
    
    message += `\nSubtotal: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(subtotal)}`;
    message += `\nPajak (10%): ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tax)}`;
    message += `\n*TOTAL: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalPayment)}*`;
    message += `\n\nMohon diproses, terima kasih.`;
    
    // Buka WA di tab baru
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');

    // --- BERSIHKAN KERANJANG ---
    setCart([]);
    localStorage.removeItem('shopping-cart');
    setIsCartOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    localStorage.removeItem('shopping-cart');
    setIsLoggedIn(false);
    setUsername("");
    setCart([]);
    setShowProfileMenu(false);
    navigate('/');
  };

  const formatRupiah = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  // Search Preview Logic - MENGGUNAKAN DATA DATABASE
  const searchPreviewItems = useMemo(() => {
    if (searchQuery.length === 0) return [];
    return products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
  }, [searchQuery, products]);

  const isLoginPage = location.pathname === '/login';
  const isAdminPage = location.pathname.startsWith('/admin');

  const [isOpen, setIsOpen] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen text-slate-800 font-sans relative bg-white">
      
      {/* NAVBAR */}
      {!isLoginPage && !isAdminPage && (
        <nav 
          className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
            scrolled || location.pathname !== '/' 
              ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' 
              : 'bg-transparent py-5'
          }`}
        >
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center">
              
              {/* 1. LOGO */}
              <button onClick={() => navigate('/')} className="flex items-center gap-2 group -ml-5">
                <img 
                  src="/logobulet.png" 
                  alt="Logo" 
                  className="h-10 w-auto object-contain group-hover:rotate-3 transition-transform" 
                />
                <span className={`text-xl font-bold font-serif tracking-tight ${
                  scrolled || location.pathname !== '/' ? 'text-slate-900' : 'text-white'
                }`}>
                  PT Radhika Narya Daruna
                </span>
              </button>

              {/* 2. DESKTOP MENU (Hanya muncul di Layar Medium ke atas) */}
              {/* Perhatikan 'hidden md:flex' -> Artinya HILANG di HP */}
              <div className="hidden md:flex items-center gap-1">
                {[
                  { path: '/', label: 'Beranda' },
                  { path: '/about', label: 'Tentang Kami' },
                  { path: '/menu', label: 'Menu & Pesan' },
                  { path: '/location', label: 'Lokasi' },
                ].map((link) => (
                  <button 
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      location.pathname === link.path 
                      ? 'text-orange-600 bg-orange-200' 
                      : (scrolled || location.pathname !== '/' ? 'text-slate-600 hover:text-orange-600' : 'text-white hover:text-orange-200')
                    }`}
                  >
                    {link.label}
                  </button>
                ))}

                {/* SEARCH BAR (Hanya Desktop) */}
                <div className="hidden lg:flex items-center relative mx-4 flex-1 max-w-md group">
                    <Search className="absolute left-3 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Cari produk..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') navigate('/menu'); }}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-full border text-sm transition-all outline-none ${
                        scrolled || location.pathname !== '/' 
                          ? 'bg-white-200 border-slate-500 focus:bg-white focus:ring-3 focus:ring-orange-800' 
                          : 'bg-white/20 border-white/50 text-white placeholder:text-white/70 focus:bg-white focus:text-slate-900'
                      }`}
                    />
                    {searchQuery && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                          {searchPreviewItems.map((product) => (
                            <button key={product.id} onClick={() => { setSearchQuery(product.name); navigate('/menu'); }} className="w-full px-4 py-3 flex items-center gap-4 hover:bg-orange-50 transition text-left">
                               <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                               <div className="flex-1"><p className="text-sm font-medium text-slate-900">{product.name}</p></div>
                            </button>
                          ))}
                      </div>
                    )}
                </div>
              </div>

              {/* 3. ICON KANAN (Cart, User, & Hamburger) */}
              <div className={`ml-2 pl-4 flex items-center gap-3 transition-colors duration-300 ${
                  scrolled || location.pathname !== '/' ? 'border-l border-slate-700' : 'md:border-l border-white/30'
                }`}>
                
                {/* Cart Icon */}
                <button onClick={() => setIsCartOpen(true)} className={`relative p-2 rounded-full transition ${
                  scrolled || location.pathname !== '/' ? 'text-slate-600 hover:bg-orange-50' : 'text-white hover:bg-white/10'
                }`}>
                   <ShoppingCart size={20} />
                   {cart.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-bounce">{cart.length}</span>}
                </button>

                {/* User Menu (Desktop Only) */}
                <div className="hidden md:block">
                  {isLoggedIn ? (
                    <div className="relative z-50">
                      <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-full transition-all border border-slate-200">
                        <div className="bg-orange-500 p-1 rounded-full text-white"><UserIcon size={16} /></div>
                        <span className="font-semibold text-sm">Hai, {username}</span>
                        <ChevronDown size={14} className={`transition ${showProfileMenu ? 'rotate-180' : ''}`} />
                      </button>
                      {showProfileMenu && (
                          <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[100]">
                            <div className="p-2">
                                <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 font-medium">
                                  <LogOut size={16} /> Keluar
                                </button>
                            </div>
                          </div>
                      )}
                    </div>
                  ) : (
                    <button onClick={() => navigate('/login')} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full font-semibold transition-all shadow-lg">
                      <UserIcon size={18} /> Login
                    </button>
                  )}
                </div>

                {/* TOMBOL HAMBURGER (Hanya muncul di HP / Mobile) */}
                <button 
                  className={`md:hidden p-2 rounded-md transition-colors ${
                    scrolled || location.pathname !== '/' ? 'text-slate-800' : 'text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
                </button>

              </div>
            </div>
          </div>

          {/* 4. MOBILE DROPDOWN MENU (Baru ditambahkan) */}
          {/* Menu ini muncul di bawah navbar saat tombol hamburger diklik */}
          <div className={`md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-slate-100 transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="flex flex-col p-4 space-y-2">
              {[
                { path: '/', label: 'Beranda' },
                { path: '/about', label: 'Tentang Kami' },
                { path: '/menu', label: 'Menu & Pesan' },
                { path: '/location', label: 'Lokasi' },
              ].map((link) => (
                <button 
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setIsMobileMenuOpen(false); // Tutup menu setelah klik
                  }}
                  className={`text-left px-4 py-3 rounded-lg text-sm font-semibold transition ${
                    location.pathname === link.path 
                    ? 'bg-orange-50 text-orange-600' 
                    : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              {/* Login/Logout Khusus Mobile (Karena tombol desktop di-hide) */}
              <div className="border-t border-slate-100 mt-2 pt-3">
                {isLoggedIn ? (
                   <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-lg flex items-center gap-2">
                      <LogOut size={18} /> Keluar (Logout)
                   </button>
                ) : (
                   <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold shadow-md active:scale-95 transition flex justify-center items-center gap-2">
                      <UserIcon size={18} /> Login Sekarang
                   </button>
                )}
              </div>
            </div>
          </div>

        </nav>
      )}

      {/* ROUTES */}
      <main>
        <Routes>
          <Route path="/" element={<HomePage navigateTo={navigate} products={products} addToCart={addToCart} />} />
          <Route path="/about" element={<AboutSection isStandalone={true} />} />
          <Route path="/menu" element={
            <MenuPage 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              selectedCategory={selectedCategory} 
              setSelectedCategory={setSelectedCategory}
              addToCart={addToCart} 
              products={products} // ✅ KIRIM DATA DATABASE
            />
          } />
          <Route path="/location" element={<LocationSection isStandalone={true} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </main>
      
      {/* FOOTER */}
      {!isLoginPage && !isAdminPage && (
        <footer className="bg-green-800 text-slate-300 py-12 border-t border-slate-800">
          <div className="container mx-auto px-6 text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <img src="/logobulet.png" alt="Logo" className="h-10 w-auto" />
              <span className="text-lg font-bold font-serif text-white">PT Radhika Narya Daruna</span>
            </div>
            <p className="text-xs text-white">© {new Date().getFullYear()} PT Radhika Narya Daruna. All rights reserved.</p>
          </div>
        </footer>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999]" onClick={() => setIsCartOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-[9999] w-full md:w-[400px] bg-white shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold font-serif text-slate-900">Pesanan Anda</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center text-slate-400 mt-20">Keranjang kosong</div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                    <div className="flex-1">
                       <h4 className="font-semibold text-slate-800">{item.name}</h4>
                       <p className="text-orange-600 font-bold">{formatRupiah(item.price)}</p>
                       <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-slate-100 rounded"><Minus size={14}/></button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-slate-100 rounded"><Plus size={14}/></button>
                          <button onClick={() => removeFromCart(item.id)} className="ml-auto text-red-500"><Trash2 size={16}/></button>
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-white border-t border-slate-100 shadow-xl">
                 <div className="flex justify-between mb-2 text-sm"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
                 <div className="flex justify-between mb-4 text-sm"><span>Pajak (10%)</span><span>{formatRupiah(tax)}</span></div>
                 <div className="flex justify-between mb-6 font-bold text-xl"><span>Total</span><span>{formatRupiah(total)}</span></div>
                 <button onClick={handleCheckout} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold">Konfirmasi Pesanan</button>
              </div>
            )}
          </div>
        </>
      )}

      {!isAdminPage && (
        <ChatBot products={products} />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;