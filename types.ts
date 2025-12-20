export interface Product {
  id: number;
  name: string;
  category: 'Bahan Baku' | 'Kopra' | 'Kelapa Utuh';
  price: number;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ReceiptData {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  date: string;
  orderId: string;
}