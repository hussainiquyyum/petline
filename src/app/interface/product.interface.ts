export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'essentials' | 'toys' | 'food';
  imageUrl: string;
  stock: number;
  rating?: number;
  reviews?: number;
} 