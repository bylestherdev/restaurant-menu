export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  allergens?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  spicyLevel?: 0 | 1 | 2 | 3;
  preparationTime?: number; // en minutos
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  tableNumber?: number;
  customerName?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: Date;
  total: number;
  notes?: string;
}

export interface RestaurantConfig {
  name: string;
  description: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  currency: string;
  taxRate: number;
  serviceCharge?: number;
}