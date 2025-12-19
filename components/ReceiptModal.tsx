import React, { useEffect, useRef } from 'react';
import { ReceiptData } from '../types';
import { CheckCircle, Printer, X } from 'lucide-react';

interface ReceiptModalProps {
  data: ReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ data, isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen || !data) return null;

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-emerald-500 p-6 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-100 hover:text-white hover:bg-emerald-600/50 p-2 rounded-full transition"
          >
            <X size={20} />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <CheckCircle className="text-white w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white">Pembayaran Sukses!</h2>
          <p className="text-emerald-100 text-sm mt-1">Order ID: #{data.orderId}</p>
        </div>

        {/* Receipt Body */}
        <div className="p-6 overflow-y-auto flex-grow bg-slate-50">
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-4 print:shadow-none print:border-0">
            <div className="text-center border-b border-dashed border-slate-200 pb-4">
              <h3 className="font-bold text-slate-800 text-lg">Nusantara POS</h3>
              <p className="text-slate-500 text-xs">Jl. Teknologi Masa Depan No. 10</p>
              <p className="text-slate-500 text-xs">{data.date}</p>
            </div>

            <div className="space-y-2">
              {data.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <span className="font-medium text-slate-700">{item.name}</span>
                    <div className="text-xs text-slate-500">{item.quantity} x {formatRupiah(item.price)}</div>
                  </div>
                  <span className="font-medium text-slate-700">{formatRupiah(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-slate-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>{formatRupiah(data.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Pajak (10%)</span>
                <span>{formatRupiah(data.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-100 mt-2">
                <span>Total</span>
                <span>{formatRupiah(data.total)}</span>
              </div>
            </div>
            
            <div className="text-center pt-4">
              <p className="text-xs text-slate-400">Terima kasih atas kunjungan Anda!</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Printer size={18} />
            Cetak
          </button>
          <button 
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition shadow-lg shadow-blue-200"
          >
            Transaksi Baru
          </button>
        </div>
      </div>
    </div>
  );
};