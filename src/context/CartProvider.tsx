'use client';

import React, { createContext, useReducer, ReactNode, useState, useEffect } from 'react';
import type { CartItem, Product } from '@/lib/types';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type CartState = {
  items: CartItem[];
};

type AlertState = {
  id: number;
  message: string;
} | null;

type CartAction =
  | { type: 'ADD_ITEM'; payload: {product: Product, quantity: number} }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id:string; quantity: number } }
  | { type: 'CLEAR_CART' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
          ),
        };
      }
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: quantity,
      };
      return { ...state, items: [...state.items, newItem] };
    }
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
      };
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
};

export const CartContext = createContext<{
  state: CartState;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalPrice: number;
} | undefined>(undefined);

const SweetAlertToast = ({ message, onDismiss }: { message: string, onDismiss: () => void }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onDismiss, 300); // Wait for fade-out animation
        }, 2000);

        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className={cn(
            "fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] p-3 rounded-lg shadow-lg bg-background border flex items-center gap-3 transition-all duration-300 w-auto",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}>
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm text-foreground whitespace-nowrap">{message}</p>
        </div>
    );
};


export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [alerts, setAlerts] = useState<AlertState[]>([]);

  const showAlert = (message: string) => {
    setAlerts(prevAlerts => [...prevAlerts, { id: Date.now(), message }]);
  };
  
  const dismissAlert = (id: number) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
  }

  const addItem = (product: Product, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
    const existingItem = state.items.find(item => item.id === product.id);
    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;
    if (newQuantity > 1 && existingItem) {
       // Don't show toast for quantity updates, only new items
    } else {
       showAlert(`Added ${quantity} "${product.name}" to cart!`);
    }
  };

  const removeItem = (id: string) => {
    const itemToRemove = state.items.find(item => item.id === id);
    if(itemToRemove){
        dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const itemCount = state.items.reduce((count, item) => count + item.quantity, 0);
  const totalPrice = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart, itemCount, totalPrice }}>
      {children}
      <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 flex flex-col items-center gap-2 pointer-events-none">
          {alerts.map((alert) => (
            <SweetAlertToast 
                key={alert.id}
                message={alert.message}
                onDismiss={() => dismissAlert(alert.id)}
            />
          ))}
      </div>
    </CartContext.Provider>
  );
};
