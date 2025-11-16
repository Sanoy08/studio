'use client';

import React, { createContext, useReducer, ReactNode, useState, useEffect } from 'react';
import type { CartItem, Product } from '@/lib/types';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { CheckCircle } from 'lucide-react';

type CartState = {
  items: CartItem[];
};

type AlertState = {
  isOpen: boolean;
  title: string;
  description: string;
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

const SweetAlert = ({ open, onOpenChange, title, description }: { open: boolean, onOpenChange: (open: boolean) => void, title: string, description: string }) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="w-[90vw] max-w-sm rounded-lg">
                <AlertDialogHeader className="items-center text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <AlertDialogTitle className="text-2xl font-bold">{title}</AlertDialogTitle>
                    <p className="text-muted-foreground">{description}</p>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => onOpenChange(false)} className="w-full">OK</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [alertState, setAlertState] = useState<AlertState>(null);

  useEffect(() => {
    if (alertState?.isOpen) {
      const timer = setTimeout(() => {
        setAlertState(null);
      }, 3000); // Auto-close after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [alertState]);

  const showAlert = (title: string, description: string) => {
    setAlertState({ isOpen: true, title, description });
  };

  const addItem = (product: Product, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
    showAlert("Added to Cart!", `${quantity} x ${product.name} has been added.`);
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
      {alertState?.isOpen && (
        <SweetAlert 
            open={alertState.isOpen}
            onOpenChange={(open) => setAlertState(open ? alertState : null)}
            title={alertState.title}
            description={alertState.description}
        />
      )}
    </CartContext.Provider>
  );
};
