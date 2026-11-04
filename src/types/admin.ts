export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'manager' | 'waiter' | 'kitchen';
  avatar?: string;
  createdAt: number;
  lastLogin?: number;
}

export interface Table {
  id: string;
  number: number;
  name?: string;
  capacity: number;
  status: 'free' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance';
  position?: { x: number; y: number }; // Para plano de sala
  qrCode?: string;
  currentOrderId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  waiterId?: string;
  waiterName?: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  priority: 'normal' | 'urgent' | 'vip';
  notes?: string;
  allergyAlert?: boolean;
  createdAt: number;
  updatedAt: number;
  servedAt?: number;
  paidAt?: number;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  paymentMethod?: 'cash' | 'card' | 'mobile' | 'split';
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  preparedAt?: number;
  servedAt?: number;
  category: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  cost?: number; // Precio de coste para márgenes
  image?: string;
  allergens: string[];
  dietaryTags: string[]; // vegetarian, vegan, gluten-free, etc.
  spicyLevel: 0 | 1 | 2 | 3;
  preparationTime: number; // minutos
  isActive: boolean;
  isFeatured: boolean; // Plato del día / recomendado
  stock?: number; // -1 = ilimitado
  lowStockThreshold?: number;
  tags: string[]; // 'popular', 'new', 'chef-special', etc.
  createdAt: number;
  updatedAt: number;
}

export interface RestaurantSettings {
  name: string;
  description: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  taxRate: number;
  serviceCharge: number;
  openingHours: OpeningHours[];
  tables: Table[];
  printers: PrinterConfig[];
  notifications: NotificationConfig;
}

export interface OpeningHours {
  day: number; // 0-6
  isOpen: boolean;
  openTime: string; // "13:00"
  closeTime: string; // "23:00"
}

export interface PrinterConfig {
  id: string;
  name: string;
  type: 'kitchen' | 'bar' | 'receipt' | 'invoice';
  ipAddress: string;
  port: number;
  isActive: boolean;
}

export interface NotificationConfig {
  newOrder: boolean;
  orderReady: boolean;
  lowStock: boolean;
  tableCall: boolean;
  channels: ('push' | 'sound' | 'vibration' | 'print')[];
}

export interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  averageTicket: number;
  ordersByHour: Record<string, number>;
  ordersByCategory: Record<string, number>;
  topItems: Array<{ itemId: string; name: string; count: number; revenue: number }>;
  tableOccupancy: Record<string, number>;
  waiterPerformance: Array<{ waiterId: string; name: string; orders: number; revenue: number; avgTime: number }>;
}