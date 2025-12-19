import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

// Pastikan tipe datanya menerima jumlah (quantity)
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  satuan?: string; // Opsional (default: kg)
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void; // Kita update ini biar terima quantity
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  // State untuk menyimpan angka inputan (Default 1)
  const [inputQty, setInputQty] = useState<number>(1);

  const handleAdd = () => {
    if (inputQty > 0) {
      onAddToCart(product, inputQty);
      setInputQty(1); // Reset ke 1 setelah masuk keranjang
      alert(`Berhasil menambahkan ${inputQty} ${product.satuan || 'kg'} ke keranjang!`);
    } else {
      alert("Jumlah pesanan minimal 1");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-slate-100 flex flex-col h-full">
      {/* Gambar Produk */}
      <div className="relative h-48 overflow-hidden group">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-green-700 shadow-sm">
          Stok Ready
        </div>
      </div>

      {/* Konten Produk */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-4">
          <span className="text-xs font-bold text-black tracking-wider uppercase bg-slate-200 px-2 py-1 rounded">
            {product.category}
          </span>
          <h3 className="text-xl font-bold text-slate-800 mt-2 mb-1 leading-tight">{product.name}</h3>
          <p className="text-sm text-slate-500 line-clamp-2">{product.description}</p>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Harga per {product.satuan || 'kg'}</p>
              <p className="text-xl font-bold text-orange-600">
                Rp {product.price.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* 🔥 BAGIAN INPUT MANUAL (KG/TON) 🔥 */}
          <div className="flex gap-2">
            <div className="relative w-1/3">
               <input 
                 type="number" 
                 min="1"
                 value={inputQty}
                 onChange={(e) => setInputQty(Number(e.target.value))}
                 className="w-full border-2 border-slate-200 rounded-lg py-2 px-2 text-center font-bold text-slate-700 focus:border-green-500 focus:outline-none"
               />
               <span className="absolute right-1 top-2.5 text-xs text-slate-400 font-medium bg-white px-1">
                 {product.satuan || 'kg'}
               </span>
            </div>

            <button 
              onClick={handleAdd}
              className="flex-1 bg-green-700 hover:bg-green-600 text-white py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} />
              <span>Pesan</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductCard;