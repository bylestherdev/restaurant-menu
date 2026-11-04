import {
  Table,
  Order,
  OrderItem,
  MenuCategory,
  MenuItem,
  RestaurantSettings,
  AnalyticsData,
} from '@/types/admin';
import { menuItems as initialMenuItems, categories as initialCategories, restaurantConfig } from '@/data/menu';

// ============================================
// LOCALSTORAGE KEYS
// ============================================
const STORAGE_KEYS = {
  TABLES: 'admin-tables',
  ORDERS: 'admin-orders',
  MENU_CATEGORIES: 'admin-menu-categories',
  MENU_ITEMS: 'admin-menu-items',
  SETTINGS: 'admin-settings',
  ANALYTICS: 'admin-analytics',
} as const;

// ============================================
// INITIAL DATA
// ============================================
const INITIAL_TABLES: Table[] = Array.from({ length: 15 }, (_, i) => ({
  id: `table-${i + 1}`,
  number: i + 1,
  name: i < 8 ? `Terraza ${i + 1}` : `Salón ${i - 7}`,
  capacity: i < 8 ? 4 : (i < 12 ? 6 : 8),
  status: 'free' as const,
  position: {
    x: (i % 5) * 120 + 60,
    y: Math.floor(i / 5) * 100 + 60,
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
}));

const INITIAL_CATEGORIES: MenuCategory[] = initialCategories.map((cat, index) => ({
  id: cat.id,
  name: cat.name,
  description: cat.description,
  icon: cat.icon,
  order: cat.order,
  isActive: true,
  createdAt: Date.now() - 86400000 * 30,
  updatedAt: Date.now() - 86400000 * 30,
}));

const INITIAL_MENU_ITEMS: MenuItem[] = initialMenuItems.map(item => ({
  id: item.id,
  categoryId: item.category,
  name: item.name,
  description: item.description,
  price: item.price,
  cost: Math.round(item.price * 0.35 * 100) / 100, // 35% coste estimado
  allergens: item.allergens || [],
  dietaryTags: [
    item.isVegetarian && 'vegetarian',
    item.isVegan && 'vegan',
    item.isGlutenFree && 'gluten-free',
  ].filter(Boolean) as string[],
  spicyLevel: item.spicyLevel || 0,
  preparationTime: item.preparationTime || 10,
  isActive: true,
  isFeatured: ['principales-1', 'pescados-1', 'postres-1', 'entrantes-3'].includes(item.id),
  stock: -1,
  lowStockThreshold: 5,
  tags: item.isVegetarian ? ['vegetarian'] : [],
  createdAt: Date.now() - 86400000 * 30,
  updatedAt: Date.now() - 86400000 * 30,
}));

const INITIAL_SETTINGS: RestaurantSettings = {
  name: restaurantConfig.name,
  description: restaurantConfig.description,
  address: 'C/ Mayor 123, 28001 Madrid',
  phone: '+34 900 123 456',
  email: 'info@lacasadelsabor.es',
  currency: restaurantConfig.currency,
  taxRate: restaurantConfig.taxRate,
  serviceCharge: restaurantConfig.serviceCharge || 0,
  openingHours: [
    { day: 1, isOpen: true, openTime: '13:00', closeTime: '23:00' }, // Lunes
    { day: 2, isOpen: true, openTime: '13:00', closeTime: '23:00' },
    { day: 3, isOpen: true, openTime: '13:00', closeTime: '23:00' },
    { day: 4, isOpen: true, openTime: '13:00', closeTime: '23:00' },
    { day: 5, isOpen: true, openTime: '13:00', closeTime: '00:00' }, // Viernes
    { day: 6, isOpen: true, openTime: '13:00', closeTime: '00:00' }, // Sábado
    { day: 0, isOpen: true, openTime: '13:00', closeTime: '17:00' }, // Domingo
  ],
  tables: INITIAL_TABLES,
  printers: [
    { id: 'printer-1', name: 'Cocina Principal', type: 'kitchen', ipAddress: '192.168.1.100', port: 9100, isActive: true },
    { id: 'printer-2', name: 'Barra', type: 'bar', ipAddress: '192.168.1.101', port: 9100, isActive: true },
    { id: 'printer-3', name: 'Ticket', type: 'receipt', ipAddress: '192.168.1.102', port: 9100, isActive: true },
  ],
  notifications: {
    newOrder: true,
    orderReady: true,
    lowStock: true,
    tableCall: true,
    channels: ['push', 'sound', 'vibration'],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
function getFromStorage<T>(key: string, initial: T): T {
  if (typeof window === 'undefined') return initial;
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {
    console.error(`Error reading ${key} from localStorage`);
  }
  return initial;
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Dispatch custom event for real-time updates across tabs
    window.dispatchEvent(new CustomEvent('admin-data-updated', { detail: { key, data } }));
  } catch {
    console.error(`Error saving ${key} to localStorage`);
  }
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// TABLES API
// ============================================
export function getTables(): Table[] {
  return getFromStorage(STORAGE_KEYS.TABLES, INITIAL_TABLES);
}

export function getTable(id: string): Table | undefined {
  return getTables().find(t => t.id === id);
}

export function getTableByNumber(number: number): Table | undefined {
  return getTables().find(t => t.number === number);
}

export function saveTable(table: Omit<Table, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Table {
  const tables = getTables();
  const now = Date.now();
  
  if (table.id && tables.some(t => t.id === table.id)) {
    // Update
    const index = tables.findIndex(t => t.id === table.id);
    const updated = { ...tables[index], ...table, updatedAt: now };
    tables[index] = updated;
    saveToStorage(STORAGE_KEYS.TABLES, tables);
    return updated;
  } else {
    // Create
    const newTable: Table = {
      ...table,
      id: table.id || generateId('table'),
      createdAt: now,
      updatedAt: now,
    } as Table;
    tables.push(newTable);
    saveToStorage(STORAGE_KEYS.TABLES, tables);
    return newTable;
  }
}

export function deleteTable(id: string): boolean {
  const tables = getTables().filter(t => t.id !== id);
  saveToStorage(STORAGE_KEYS.TABLES, tables);
  return true;
}

export function updateTableStatus(id: string, status: Table['status']): Table | undefined {
  const tables = getTables();
  const index = tables.findIndex(t => t.id === id);
  if (index === -1) return undefined;
  
  tables[index] = { ...tables[index], status, updatedAt: Date.now() };
  saveToStorage(STORAGE_KEYS.TABLES, tables);
  return tables[index];
}

// ============================================
// ORDERS API
// ============================================
export function getOrders(): Order[] {
  return getFromStorage(STORAGE_KEYS.ORDERS, []);
}

export function getOrder(id: string): Order | undefined {
  return getOrders().find(o => o.id === id);
}

export function getOrdersByTable(tableId: string): Order[] {
  return getOrders().filter(o => o.tableId === tableId);
}

export function getOrdersByStatus(status: Order['status']): Order[] {
  return getOrders().filter(o => o.status === status);
}

export function getActiveOrders(): Order[] {
  return getOrders().filter(o => 
    ['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(o.status)
  );
}

export function createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
  const orders = getOrders();
  const now = Date.now();
  const newOrder: Order = {
    ...order,
    id: generateId('order'),
    createdAt: now,
    updatedAt: now,
  };
  orders.unshift(newOrder);
  saveToStorage(STORAGE_KEYS.ORDERS, orders);
  
  // Update table status
  updateTableStatus(order.tableId, 'occupied');
  
  return newOrder;
}

export function updateOrder(id: string, updates: Partial<Order>): Order | undefined {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return undefined;
  
  const updated = { ...orders[index], ...updates, updatedAt: Date.now() };
  orders[index] = updated;
  saveToStorage(STORAGE_KEYS.ORDERS, orders);
  
  // If order is paid/cancelled, free the table
  if (['paid', 'cancelled'].includes(updated.status)) {
    updateTableStatus(updated.tableId, 'free');
  }
  
  return updated;
}

export function updateOrderItemStatus(
  orderId: string, 
  itemId: string, 
  status: OrderItem['status']
): Order | undefined {
  const order = getOrder(orderId);
  if (!order) return undefined;
  
  const itemIndex = order.items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return undefined;
  
  const updatedItems = [...order.items];
  updatedItems[itemIndex] = { 
    ...updatedItems[itemIndex], 
    status,
    ...(status === 'preparing' && { preparedAt: Date.now() }),
    ...(status === 'served' && { servedAt: Date.now() }),
  };
  
  // Determine order status based on items
  const allServed = updatedItems.every(i => i.status === 'served' || i.status === 'cancelled');
  const anyPreparing = updatedItems.some(i => i.status === 'preparing');
  const anyReady = updatedItems.some(i => i.status === 'ready');
  const anyPending = updatedItems.some(i => i.status === 'pending');
  
  let newStatus: Order['status'] = order.status;
  if (allServed) newStatus = 'served';
  else if (anyPreparing) newStatus = 'preparing';
  else if (anyReady) newStatus = 'ready';
  else if (anyPending) newStatus = 'confirmed';
  
  return updateOrder(orderId, { items: updatedItems, status: newStatus });
}

export function addOrderItem(orderId: string, item: Omit<OrderItem, 'id'>): Order | undefined {
  const order = getOrder(orderId);
  if (!order) return undefined;
  
  const newItem: OrderItem = { ...item, id: generateId('item') };
  return updateOrder(orderId, { items: [...order.items, newItem] });
}

export function removeOrderItem(orderId: string, itemId: string): Order | undefined {
  const order = getOrder(orderId);
  if (!order) return undefined;
  
  return updateOrder(orderId, { 
    items: order.items.filter(i => i.id !== itemId) 
  });
}

// ============================================
// MENU CATEGORIES API
// ============================================
export function getMenuCategories(): MenuCategory[] {
  return getFromStorage(STORAGE_KEYS.MENU_CATEGORIES, INITIAL_CATEGORIES);
}

export function saveMenuCategory(category: Omit<MenuCategory, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): MenuCategory {
  const categories = getMenuCategories();
  const now = Date.now();
  
  if (category.id && categories.some(c => c.id === category.id)) {
    const index = categories.findIndex(c => c.id === category.id);
    const updated = { ...categories[index], ...category, updatedAt: now };
    categories[index] = updated;
    saveToStorage(STORAGE_KEYS.MENU_CATEGORIES, categories);
    return updated;
  } else {
    const newCategory: MenuCategory = {
      ...category,
      id: category.id || generateId('category'),
      createdAt: now,
      updatedAt: now,
    };
    categories.push(newCategory);
    saveToStorage(STORAGE_KEYS.MENU_CATEGORIES, categories);
    return newCategory;
  }
}

export function deleteMenuCategory(id: string): boolean {
  const categories = getMenuCategories().filter(c => c.id !== id);
  saveToStorage(STORAGE_KEYS.MENU_CATEGORIES, categories);
  // Also delete items in this category
  const items = getMenuItems().filter(i => i.categoryId !== id);
  saveToStorage(STORAGE_KEYS.MENU_ITEMS, items);
  return true;
}

// ============================================
// MENU ITEMS API
// ============================================
export function getMenuItems(): MenuItem[] {
  return getFromStorage(STORAGE_KEYS.MENU_ITEMS, INITIAL_MENU_ITEMS);
}

export function getMenuItem(id: string): MenuItem | undefined {
  return getMenuItems().find(i => i.id === id);
}

export function getMenuItemsByCategory(categoryId: string): MenuItem[] {
  return getMenuItems().filter(i => i.categoryId === categoryId && i.isActive);
}

export function saveMenuItem(item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): MenuItem {
  const items = getMenuItems();
  const now = Date.now();
  
  if (item.id && items.some(i => i.id === item.id)) {
    const index = items.findIndex(i => i.id === item.id);
    const updated = { ...items[index], ...item, updatedAt: now };
    items[index] = updated;
    saveToStorage(STORAGE_KEYS.MENU_ITEMS, items);
    return updated;
  } else {
    const newItem: MenuItem = {
      ...item,
      id: item.id || generateId('item'),
      createdAt: now,
      updatedAt: now,
    };
    items.push(newItem);
    saveToStorage(STORAGE_KEYS.MENU_ITEMS, items);
    return newItem;
  }
}

export function deleteMenuItem(id: string): boolean {
  const items = getMenuItems().filter(i => i.id !== id);
  saveToStorage(STORAGE_KEYS.MENU_ITEMS, items);
  return true;
}

export function toggleMenuItemActive(id: string): MenuItem | undefined {
  const items = getMenuItems();
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return undefined;
  
  items[index] = { ...items[index], isActive: !items[index].isActive, updatedAt: Date.now() };
  saveToStorage(STORAGE_KEYS.MENU_ITEMS, items);
  return items[index];
}

// ============================================
// SETTINGS API
// ============================================
export function getSettings(): RestaurantSettings {
  return getFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
}

export function saveSettings(settings: Partial<RestaurantSettings>): RestaurantSettings {
  const current = getSettings();
  const updated = { ...current, ...settings };
  saveToStorage(STORAGE_KEYS.SETTINGS, updated);
  return updated;
}

// ============================================
// ANALYTICS API
// ============================================
export function getAnalytics(): AnalyticsData {
  const orders = getOrders();
  const items = getMenuItems();
  const tables = getTables();
  
  const completedOrders = orders.filter(o => o.status === 'paid' || o.status === 'served');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const averageTicket = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  
  // Orders by hour
  const ordersByHour: Record<string, number> = {};
  completedOrders.forEach(o => {
    const hour = new Date(o.createdAt).getHours();
    ordersByHour[hour] = (ordersByHour[hour] || 0) + 1;
  });
  
  // Orders by category
  const ordersByCategory: Record<string, number> = {};
  completedOrders.forEach(o => {
    o.items.forEach(item => {
      const menuItem = items.find(i => i.id === item.menuItemId);
      if (menuItem) {
        ordersByCategory[menuItem.categoryId] = (ordersByCategory[menuItem.categoryId] || 0) + item.quantity;
      }
    });
  });
  
  // Top items
  const itemStats = new Map<string, { count: number; revenue: number }>();
  completedOrders.forEach(o => {
    o.items.forEach(item => {
      const stat = itemStats.get(item.menuItemId) || { count: 0, revenue: 0 };
      stat.count += item.quantity;
      stat.revenue += item.price * item.quantity;
      itemStats.set(item.menuItemId, stat);
    });
  });
  
  const topItems = Array.from(itemStats.entries())
    .map(([itemId, stat]) => {
      const item = items.find(i => i.id === itemId);
      return { itemId, name: item?.name || 'Desconocido', ...stat };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Table occupancy
  const tableOccupancy: Record<string, number> = {};
  tables.forEach(t => {
    const tableOrders = orders.filter(o => o.tableId === t.id && (o.status === 'paid' || o.status === 'served'));
    tableOccupancy[t.id] = tableOrders.length;
  });
  
  return {
    totalOrders: completedOrders.length,
    totalRevenue,
    averageTicket,
    ordersByHour,
    ordersByCategory,
    topItems,
    tableOccupancy,
    waiterPerformance: [], // TODO: implement when we have waiter tracking
  };
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeToAdminData(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners() {
  listeners.forEach(l => l());
}

if (typeof window !== 'undefined') {
  window.addEventListener('admin-data-updated', notifyListeners);
  window.addEventListener('storage', (e) => {
    if (Object.values(STORAGE_KEYS).includes(e.key as any)) {
      notifyListeners();
    }
  });
}