'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CartItem, MenuItem, RestaurantConfig } from '@/types/menu';
import { restaurantConfig } from '@/data/menu';

interface CartState {
  items: CartItem[];
  tableNumber: number | null;
  customerName: string;
  notes: string;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { item: MenuItem; quantity: number; notes?: string } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'UPDATE_NOTES'; payload: { id: string; notes: string } }
  | { type: 'SET_TABLE'; payload: number | null }
  | { type: 'SET_CUSTOMER'; payload: string }
  | { type: 'SET_NOTES'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

const initialState: CartState = {
  items: [],
  tableNumber: null,
  customerName: '',
  notes: '',
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, quantity, notes } = action.payload;
      const existingIndex = state.items.findIndex(i => i.id === item.id && i.notes === notes);
      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex].quantity += quantity;
        return { ...state, items: newItems };
      }
      return {
        ...state,
        items: [...state.items, { ...item, quantity, notes }],
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(item => item.id !== action.payload) };
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter(item => item.id !== action.payload.id) };
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      };
    }
    case 'UPDATE_NOTES':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? { ...item, notes: action.payload.notes } : item
        ),
      };
    case 'SET_TABLE':
      return { ...state, tableNumber: action.payload };
    case 'SET_CUSTOMER':
      return { ...state, customerName: action.payload };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'CLEAR_CART':
      return initialState;
    case 'LOAD_CART':
      return action.payload;
    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (item: MenuItem, quantity?: number, notes?: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  setTableNumber: (table: number | null) => void;
  setCustomerName: (name: string) => void;
  setOrderNotes: (notes: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getServiceCharge: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  config: RestaurantConfig;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Persist cart to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('restaurant-cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_CART', payload: parsed });
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('restaurant-cart', JSON.stringify(state));
  }, [state]);

  const addItem = (item: MenuItem, quantity = 1, notes?: string) => {
    dispatch({ type: 'ADD_ITEM', payload: { item, quantity, notes } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const updateNotes = (id: string, notes: string) => {
    dispatch({ type: 'UPDATE_NOTES', payload: { id, notes } });
  };

  const setTableNumber = (table: number | null) => {
    dispatch({ type: 'SET_TABLE', payload: table });
  };

  const setCustomerName = (name: string) => {
    dispatch({ type: 'SET_CUSTOMER', payload: name });
  };

  const setOrderNotes = (notes: string) => {
    dispatch({ type: 'SET_NOTES', payload: notes });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getSubtotal = () => {
    return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getTax = () => {
    return getSubtotal() * restaurantConfig.taxRate;
  };

  const getServiceCharge = () => {
    return getSubtotal() * (restaurantConfig.serviceCharge || 0);
  };

  const getTotal = () => {
    return getSubtotal() + getTax() + getServiceCharge();
  };

  const getItemCount = () => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        updateNotes,
        setTableNumber,
        setCustomerName,
        setOrderNotes,
        clearCart,
        getSubtotal,
        getTax,
        getServiceCharge,
        getTotal,
        getItemCount,
        config: restaurantConfig,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}