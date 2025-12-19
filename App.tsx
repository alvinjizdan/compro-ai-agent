import React, { useState, useMemo, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, Coffee, Utensils, Sparkles, X, MapPin, Phone, Instagram, ArrowRight, Menu as MenuIcon, ChevronRight } from 'lucide-react';
import { Product, CartItem, ReceiptData } from './types';
import { ProductCard } from './components/ProductCard';
import { ReceiptModal } from './components/ReceiptModal';
import { getUpsellSuggestion } from './services/geminiService';
import { User } from "lucide-react";
import { ChatBot } from './components/Chatbot';
import { LoginModal } from './components/LoginModal'; 
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react'; 


// Mock Data
const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: "Nasi Goreng Spesial", category: "Makanan", price: 25000, image: "https://picsum.photos/seed/nasi/400/300" },
  { id: 2, name: "Es Teh Manis", category: "Minuman", price: 5000, image: "https://picsum.photos/seed/esteh/400/300" },
  { id: 3, name: "Kentang Goreng", category: "Camilan", price: 15000, image: "https://picsum.photos/seed/kentang/400/300" },
];

const CATEGORIES = ["Semua", "Makanan", "Minuman", "Camilan"];

type Page = 'home' | 'about' | 'menu' | 'location';

const App: React.FC = () => {
  // Navigation State
  const [activePage, setActivePage] = useState<Page>('home');
  
  // Cart & POS Data
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  
  // Login
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [username, setUsername] = useState("");

  const handleLogin = (user: string) => {
    setIsLoggedIn(true);
    setUsername(user);
    setShowLoginModal(false); 
  };

  const handleLogout = () => {

    setIsLoggedIn(false);
    setUsername("");
    setShowProfileMenu(false);
    setShowLoginModal(true);
    // navigateTo('home'); 
  };
  
  // UI States
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // AI Suggestion State
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Handle Scroll for Navbar styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Semua" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);
  const searchPreviewItems = useMemo(() => {
    if (searchQuery.length === 0) return [];
    return MOCK_PRODUCTS.filter((p) => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  // Cart Functions
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setAiSuggestion(null);
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
      })
      .filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const data: ReceiptData = {
      items: cart,
      subtotal,
      tax,
      total,
      date: new Date().toLocaleString('id-ID'),
      orderId: Math.random().toString(36).substr(2, 9).toUpperCase(),
    };
    setReceiptData(data);
    setIsReceiptOpen(true);
    setIsCartOpen(false);
  };

  const handleAiSuggestion = async () => {
    if (cart.length === 0) return;
    setIsLoadingAi(true);
    const itemNames = cart.map(item => item.name);
    const suggestion = await getUpsellSuggestion(itemNames);
    setAiSuggestion(suggestion);
    setIsLoadingAi(false);
  };

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  // Function to change page
  const navigateTo = (page: Page) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- SUB-COMPONENTS FOR PAGES ---

  const HeroSection = () => (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden animate-in fade-in duration-500 pb-16">
      <div className="absolute inset-0 z-0">
        <img 
          src="/bannerbg.png" 
          alt="Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>
      </div>
      <div className="container mx-auto px-6 relative z-10 text-center text-white pt-24 md:pt-16">
        <span className="inline-block py-1 px-3 rounded-full bg-green-500/20 border border-green-400/50 text-green-100 text-sm font-semibold tracking-wider mb-6 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-700">
          MEDIA TANAM KUALITAS PREMIUM
        </span>
        <h1 className="text-5xl md:text-6xl font-bold font-serif mb-6 mt-4 leading-tight animate-in slide-in-from-bottom-6 duration-1000">
          Tumbuh Lebih Cepat <br/>
          <span className="text-white-400">Dengan Media Tanam Kualitas Ekspor</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto mb-10 mt-9 leading-relaxed animate-in slide-in-from-bottom-8 duration-1000 delay-200">
          Jangan biarkan media tanam yang buruk menghambat omset panen Anda. Dapatkan standarisasi kualitas bersama PT Radhika Narya Daruna.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center animate-in zoom-in-95 duration-1000 delay-300">
          <button 
            onClick={() => navigateTo('menu')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-full transition flex items-center justify-center gap-2 group"
          >
            Pesan Sekarang 
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => navigateTo('about')}
            className="bg-green-600/30 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold py-4 px-8 rounded-full transition"
          >
            Tentang Kami
          </button>
        </div>
      </div>
    </section>
  );

  // Added isStandalone prop to adjust padding when shown on Home vs standalone page
  const AboutSection = ({ isStandalone = false }: { isStandalone?: boolean }) => (
    <section className={`${isStandalone ? 'min-h-screen pt-32 pb-20' : 'py-24'} bg-white animate-in slide-in-from-bottom-4 duration-500`}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
           <h2 className="text-orange-600 font-bold tracking-widest uppercase text-sm mb-2">Cerita Kami</h2>
           <h3 className="text-4xl md:text-3xl font-serif font-bold text-slate-900">Di Balik PT Radhika Narya Daruna</h3>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-orange-100 rounded-full z-0"></div>
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <img src="/tentangkami1.jpg" className="rounded-2xl w-full h-80 object-cover shadow-xl transform translate-y-8" alt="2" />
              <img src="/tentangkami2.jpg" className="rounded-2xl w-full h-80 object-cover shadow-xl" alt="1" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-3xl font-serif font-bold text-slate-900 mb-6">Solusi Media Tanam Berkualitas, Kini Hadir Dalam Genggaman Anda</h3>
            <p className="text-slate-600 leading-relaxed mb-6 text-lg">
              PT. Radhika Narya Daruna adalah perusahaan retail modern yang berkomitmen untuk menghadirkan transparansi dan kemudahan akses informasi bagi publik. Melalui platform digital ini, kami memperkuat identitas perusahaan dan menyajikan portofolio produk secara profesional, guna membangun kredibilitas serta kepercayaan di mata pelanggan dan mitra bisnis kami.
            </p>
            
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="flex items-start gap-4">
               <div className="bg-orange-100 p-3 rounded-xl text-orange-600 shrink-0">
                <Sparkles size={24} />
               </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Bahan Baku Premium</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                Diproduksi dari coconut coir pith berkualitas tinggi yang telah melalui proses washing (pencucian) ketat.
                </p>
              </div>
             </div>
             <div className="flex items-start gap-4">
               <div className="bg-orange-100 p-3 rounded-xl text-orange-600 shrink-0">
                <Sparkles size={24} />
               </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Media Tanam Premium</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                Media tanam 100% organik yang menawarkan aerasi akar yang optimal dan stabilitas pH yang netral.
                </p>
              </div>
             </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // New component specifically for Home page preview
  const HomeFavoritesSection = () => (
    <section className="py-7 bg-stone-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-orange-600 font-bold tracking-widest uppercase text-sm mb-2">Daftar Produk</h2>
          <h3 className="text-4xl font-serif font-bold text-slate-900 mb-4">Produk Pilihan Kami</h3>
          <p className="text-slate-600 max-w-xl mx-auto">
            Temukan Media Tanam yang Tepat untuk Setiap Fase Pertumbuhan.
          </p>
        </div>

        {/* Show only top 4 items */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {MOCK_PRODUCTS.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>

        <div className="text-center">
          <button 
            onClick={() => navigateTo('menu')}
            className="inline-flex items-center gap-2 bg-green-700 hover:bg-slate-800 text-white font-bold py-4 px-10 rounded-full transition shadow-lg hover:shadow-xl"
          >
            Lihat Semua Produk
            <ArrowRight size={25}/>
          </button>
        </div>
      </div>
    </section>
  );

  const MenuSection = () => (
    <section className="min-h-screen pt-32 pb-20 bg-stone-50 animate-in fade-in duration-500">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">Daftar Menu</h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Jelajahi berbagai hidangan lezat kami. Klik pada menu untuk menambahkan ke pesanan.
          </p>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 sticky top-24 z-20">
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
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
                <p>Maaf, menu tidak ditemukan.</p>
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

  // Added isStandalone prop
  const LocationSection = ({ isStandalone = false }: { isStandalone?: boolean }) => (
    <section className={`${isStandalone ? 'min-h-screen pt-32 pb-20' : 'py-24'} bg-white animate-in slide-in-from-bottom-4 duration-500`}>
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
                    <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Alamat Utama</h4>
                      <p className="text-slate-600">Apartement Educity Pakuwon City Tower Stamford Kalisari Street Dharma Selatan, Surabaya, Indonesia.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Telepon & Reservasi</h4>
                      <p className="text-slate-600">+62 21 555 0199</p>
                      <p className="text-slate-500 text-sm">Setiap hari: 09:00 - 21:00</p>
                    </div>
                  </div>

                  
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200">
                   <h4 className="font-bold text-slate-900 mb-3">Jam Operasional</h4>
                   <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex justify-between"><span>Senin - Jumat</span> <span className="font-medium">10:00 - 22:00</span></li>
                      <li className="flex justify-between"><span>Sabtu - Minggu</span> <span className="font-medium">09:00 - 23:00</span></li>
                   </ul>
                </div>
             </div>

             <div className="h-[500px] bg-slate-200 rounded-3xl overflow-hidden shadow-lg relative group">
                {/* Simulated Map */}
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop" 
                  alt="Map Location" 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="bg-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
                      <MapPin className="text-red-700" size={24}/>
                      <span className="font-bold text-slate-900">Lokasi Kami</span>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </section>
  );

  return (
    
    <div className="min-h-screen text-slate-800 font-sans relative bg-white">
      
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled || activePage !== 'home' ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-2 group -ml-5">
  
 <button onClick={() => navigateTo('home')} className="flex items-center gap-2 group">
  {/* Gambar Logo */}
  <img 
    src="/logobulet.png" 
    alt="Logo PT Radhika" 
    className="h-10 w-auto object-contain group-hover:rotate-3 transition-transform"
  />
  
  {/* Teks Nama PT */}
  <span className={`text-xl font-bold font-serif tracking-tight ${scrolled || activePage !== 'home' ? 'text-slate-900' : 'text-white'}`}>
    PT Radhika Narya Daruna
  </span>
</button>
</button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            <button 
              onClick={() => navigateTo('home')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${activePage === 'home' ? 'text-orange-600 bg-orange-200' : 'text-slate-600 hover:text-orange-600'}`}
            >
              Beranda
            </button>
            <button 
              onClick={() => navigateTo('about')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${activePage === 'about' ? 'text-orange-600 bg-orange-200' : (scrolled || activePage !== 'home' ? 'text-slate-600 hover:text-orange-600' : 'text-white hover:text-orange-200')}`}
            >
              Tentang Kami
            </button>
            <button 
              onClick={() => navigateTo('menu')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${activePage === 'menu' ? 'text-orange-600 bg-orange-200' : (scrolled || activePage !== 'home' ? 'text-slate-600 hover:text-orange-600' : 'text-white hover:text-orange-200')}`}
            >
              Menu & Pesan
            </button>
             <button 
              onClick={() => navigateTo('location')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${activePage === 'location' ? 'text-orange-600 bg-orange-200' : (scrolled || activePage !== 'home' ? 'text-slate-600 hover:text-orange-600' : 'text-white hover:text-orange-200')}`}
            >
              Lokasi
            </button>
            <div className="hidden lg:flex items-center relative mx-4 flex-1 max-w-md group">
  <Search className="absolute left-3 text-slate-400" size={18} />
  
  <input 
    type="text" 
    placeholder="Cari produk favorit..." 
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    // Jika tekan Enter -> Buka halaman menu
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        navigateTo('menu');
        window.scrollTo(0, 0);
      }
    }}
    className={`w-full pl-10 pr-10 py-2.5 rounded-full border text-sm transition-all outline-none ${
      scrolled || activePage !== 'home' 
        ? 'bg-white-200 border-slate-500 focus:bg-white focus:ring-3 focus:ring-orange-800' 
        : 'bg-white/20 border-white/50 text-white placeholder:text-white/70 focus:bg-white focus:text-slate-900'
    }`}
  />

  {/* Tombol Clear (X) - Muncul jika ada ketikan */}
  {searchQuery && (
    <button 
      onClick={() => setSearchQuery("")}
      className="absolute right-3 text-slate-400 hover:text-red-500"
    >
      <X size={16} />
    </button>
  )}

  {/* === DROPDOWN PREVIEW === */}
  {/* Hanya muncul jika ada ketikan & ada hasil */}
  {searchQuery && (
    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
      
      {searchPreviewItems.length > 0 ? (
        <>
          <div className="py-2">
            {searchPreviewItems.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  setSearchQuery(product.name); // Set teks pencarian
                  navigateTo('menu');          // Pindah ke menu
                  window.scrollTo(0, 0);       // Scroll ke atas
                }}
                className="w-full px-4 py-3 flex items-center gap-4 hover:bg-orange-50 transition text-left group/item"
              >
                {/* Gambar Kecil */}
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-10 h-10 rounded-lg object-cover bg-slate-100" 
                />
                
                {/* Teks Nama & Harga */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 group-hover/item:text-orange-700">
                    {product.name}
                  </p>
                  <p className="text-xs text-orange-600 font-bold">
                    {formatRupiah(product.price)}
                  </p>
                </div>

                {/* Arrow Icon (Hiasan) */}
                <ChevronRight size={16} className="text-slate-300 group-hover/item:text-orange-400" />
              </button>
            ))}
          </div>
          
          {/* Footer Dropdown (Lihat Semua) */}
          <button 
            onClick={() => navigateTo('menu')}
            className="w-full py-3 bg-slate-50 text-xs font-bold text-slate-600 border-t border-slate-100 hover:bg-slate-100 transition"
          >
            Lihat semua hasil untuk "{searchQuery}"
          </button>
        </>
      ) : (
        // Tampilan Jika Tidak Ada Hasil
        <div className="p-6 text-center text-slate-400">
          <p className="text-sm">Produk tidak ditemukan.</p>
        </div>
      )}
    </div>
  )}
</div>
            <div className={`ml-2 pl-4 border-l flex items-center gap-3 transition-colors duration-300 ${
   scrolled || activePage !== 'home' 
     ? 'border-slate-700'   // Warna saat Scroll (Abu-abu)
     : 'border-white/300'    // Warna saat di Atas (Putih Transparan)
}`}>

            {/* 1. TOMBOL KERANJANG (Desktop) */}
             <button 
               onClick={() => setIsCartOpen(true)} 
               className={`relative p-2 rounded-full transition ${scrolled || activePage !== 'home' ? 'text-slate-600 hover:bg-orange-50 hover:text-orange-600' : 'text-white hover:bg-white/10'}`}
            >
               <ShoppingCart size={20} />
    
            {/* Badge Merah (Jumlah Item) */}
             {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
               {cart.length}
              </span>
             )}
             </button>
        {isLoggedIn ? (
        // --- KONDISI SUDAH LOGIN ---
        <div className="relative z-50"> {/* Tambah z-50 biar menu selalu di atas */}
          
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-full transition-all border border-slate-200 active:scale-95"
          >
            <div className="bg-orange-500 p-1 rounded-full text-white">
              <UserIcon size={16} />
            </div>
            <span className="font-semibold text-sm">Hai, {username}</span>
            <ChevronDown 
              size={14} 
              className={`transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} 
            />
          </button>
          <div 
            className={`
              absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden
              transform origin-top-right transition-all duration-300 ease-out z-[100]
              ${showProfileMenu 
                ? 'opacity-100 scale-100 translate-y-0 visible pointer-events-auto' 
                : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'}
            `}
          >
            {/* Header Dropdown */}
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Masuk sebagai</p>
              <p className="font-bold text-slate-800 truncate text-sm">{username}</p>
              <div className="flex items-center gap-1 mt-2">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                 <span className="text-[10px] text-green-600 font-medium">Akun Aktif</span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
               <button 
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg flex items-center gap-2 transition-colors font-medium"
              >
                <LogOut size={16} />
                Keluar (Logout)
              </button>
            </div>
          </div>
        </div>
      ) : (
        // --- KONDISI BELUM LOGIN (TOMBOL LOGIN) ---
        <button 
          onClick={() => setShowLoginModal(true)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full font-semibold transition-all shadow-lg shadow-green-700/30 active:scale-95"
        >
          <UserIcon size={18} />
          Login
        </button>
      )}
</div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2"
            >
              <ShoppingCart size={24} className={scrolled || activePage !== 'home' ? 'text-slate-900' : 'text-white'} />
              {cart.length > 0 && <span className="absolute top-1 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
              {isMobileMenuOpen 
                ? <X size={24} className={scrolled || activePage !== 'home' ? 'text-slate-900' : 'text-white'} /> 
                : <MenuIcon size={24} className={scrolled || activePage !== 'home' ? 'text-slate-900' : 'text-white'} />
              }
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-slate-100 p-4 flex flex-col gap-2 animate-in slide-in-from-top-2">
            {[
              { id: 'home', label: 'Beranda' }, 
              { id: 'about', label: 'Tentang Kami' }, 
              { id: 'menu', label: 'Menu Favorit' }, 
              { id: 'location', label: 'Lokasi' }
            ].map((item) => (
              <button 
                key={item.id} 
                onClick={() => navigateTo(item.id as Page)}
                className={`text-left px-4 py-3 rounded-xl font-medium transition flex justify-between items-center ${
                  activePage === item.id ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
                {activePage === item.id && <ChevronRight size={16} />}
              </button>
            ))}
          </div>
        )}
      </nav>
      {/* DYNAMIC CONTENT RENDERING */}
      <main>
        {activePage === 'home' ? (
          <>
            <HeroSection />
            <AboutSection isStandalone={false} />
            <HomeFavoritesSection />
            <LocationSection isStandalone={false} />
          </>
        ) : (
          <>
            {activePage === 'about' && <AboutSection isStandalone={true} />}
            {activePage === 'menu' && <MenuSection />}
            {activePage === 'location' && <LocationSection isStandalone={true} />}
          </>
        )}
      </main>
      
      {/* GLOBAL FOOTER (Now visible on all pages including Home to allow scrolling) */}
      <footer className="bg-green-800 text-slate-300 py-12 border-t border-slate-800">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <img 
             src="/logobulet.png" 
             alt="Logo PT Radhika" 
             className="h-10 w-auto object-contain group-hover:rotate-3 transition-transform"
            />
            <span className="text-lg font-bold font-serif text-white">
              PT Radhika Narya Daruna
            </span>
          </div>
          <p className="text-xs text-white">&copy; {new Date().getFullYear()} PT Radhika Narya Daruna. All rights reserved.</p>
        </div>
      </footer>

      {/* CART DRAWER (Floating Side Panel) */}
      {/* Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />
      )}
      
      {/* Drawer Panel */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full md:w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col z-[9999] ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900">Pesanan Anda</h2>
            <p className="text-xs text-slate-500">{cart.length} item dipilih</p>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-slate-200 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                <ShoppingCart size={32} className="opacity-20" />
              </div>
              <p className="text-sm font-medium">Keranjang masih kosong</p>
              <button 
                onClick={() => { setIsCartOpen(false); navigateTo('menu'); }}
                className="text-orange-600 text-sm font-semibold hover:underline"
              >
                Lihat Produk
              </button>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl border border-slate-100" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-orange-600 font-bold text-sm">{formatRupiah(item.price)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-100">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-orange-600 active:scale-95 transition"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-orange-600 active:scale-95 transition"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-300 hover:text-red-500 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* AI Upsell Feature */}
              <div className="mt-6 pt-6 border-t border-dashed border-slate-200">
                {!aiSuggestion ? (
                  <button
                    onClick={handleAiSuggestion}
                    disabled={isLoadingAi}
                    className="w-full py-3 px-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl text-orange-700 text-xs font-semibold flex items-center justify-center gap-2 hover:shadow-md transition"
                  >
                    <Sparkles size={16} className={isLoadingAi ? "animate-spin" : "text-orange-500"} />
                    {isLoadingAi ? "Chef AI sedang berpikir..." : "Rekomendasi Chef (AI)"}
                  </button>
                ) : (
                  <div className="bg-slate-900 p-4 rounded-xl text-white shadow-xl relative animate-in fade-in slide-in-from-bottom-2">
                     <div className="flex items-start gap-3">
                        <div className="bg-white/10 p-2 rounded-full">
                          <Sparkles size={16} className="text-yellow-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-bold">Rekomendasi Chef</p>
                          <p className="text-sm font-medium leading-relaxed italic">"{aiSuggestion}"</p>
                        </div>
                        <button onClick={() => setAiSuggestion(null)} className="text-white/40 hover:text-white transition">
                          <XIcon size={14} />
                        </button>
                     </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Totals */}
        <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Pajak (10%)</span>
              <span>{formatRupiah(tax)}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-xl pt-3 border-t border-dashed border-slate-200">
              <span>Total</span>
              <span>{formatRupiah(total)}</span>
            </div>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition shadow-xl shadow-slate-200 active:scale-[0.98] flex justify-between px-8"
          >
            <span>Konfirmasi Pesanan</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Receipt Modal (Unchanged functionality) */}
      <ReceiptModal 
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          clearCart();
          setAiSuggestion(null);
        }}
        data={receiptData}
      />
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
      <ChatBot 
      />
   </div>
);
}
const XIcon = ({size}: {size:number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default App;