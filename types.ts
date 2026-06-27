export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  stock?: number;
  satuan?: string;
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