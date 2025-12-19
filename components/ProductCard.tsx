import React from 'react';
import { Product } from '../types';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div 
      onClick={() => onAddToCart(product)}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 group flex flex-col h-full"
    >
      <div className="relative h-32 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <button className="absolute bottom-2 right-2 bg-blue-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <Plus size={16} />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{product.category}</span>
        <h3 className="text-slate-800 font-bold text-sm leading-tight mb-2 flex-grow">{product.name}</h3>
        <p className="text-orange-600 font-bold text-base">{formatRupiah(product.price)}</p>
      </div>
    </div>
  );
};