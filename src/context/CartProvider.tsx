// src/context/CartProvider.tsx

'use client';

import React, { createContext, useReducer, ReactNode, useEffect, useState, useCallback } from 'react';
import type { CartItem, Product } from '@/lib/types';
import { toast } from 'sonner';
import Pusher from 'pusher-js';

const CART_STORAGE_KEY = 'bumbas-kitchen-cart';

// ★ ১. নতুন টাইপ যোগ (Checkout Data এর জন্য)
type CheckoutState = {
    couponCode: string;
    couponDiscount: number;
    useCoins: boolean;
};

type CartState = {
  items: CartItem[];
  checkoutState: CheckoutState; // ★ স্টেটে যোগ করা হলো
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: { items: CartItem[] } }
  | { type: 'SET_CHECKOUT_DATA'; payload: Partial<CheckoutState> }; // ★ নতুন অ্যাকশন

const initialState: CartState = { 
    items: [],
    checkoutState: { couponCode: '', couponDiscount: 0, useCoins: false } // ★ ডিফল্ট মান
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === product.id);
      
      const maxStock = product.stock || 100; 
      const currentQty = existingItem ? existingItem.quantity : 0;

      if (currentQty + quantity > maxStock) {
         toast.error(`Only ${maxStock} items available.`);
         return state;
      }

      let newItems;
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        const newItem: CartItem = {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.images && product.images.length > 0 ? product.images[0] : { id: 'def', url: '', alt: product.name },
          quantity: quantity,
        };
        newItems = [...state.items, newItem];
      }
      return { ...state, items: newItems };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((item) => item.id !== action.payload.id) };
    case 'UPDATE_QUANTITY':
        if (action.payload.quantity <= 0) return { ...state, items: state.items.filter((item) => item.id !== action.payload.id) };
        return { ...state, items: state.items.map((item) => item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item) };
    case 'CLEAR_CART':
      return { ...state, items: [], checkoutState: { couponCode: '', couponDiscount: 0, useCoins: false } }; // কার্ট ক্লিয়ার হলে ডিসকাউন্টও যাবে
    case 'SET_CART':
      return { ...state, items: action.payload.items };
    
    // ★ ২. চেকআউট ডেটা সেট করার লজিক
    case 'SET_CHECKOUT_DATA':
        return { ...state, checkoutState: { ...state.checkoutState, ...action.payload } };
        
    default:
      return state;
  }
};

export const CartContext = createContext<any>(undefined);

function getUserIdFromToken(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload)._id;
    } catch (e) { return null; }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDirty, setIsDirty] = useState(false); 
  const [isSyncing, setIsSyncing] = useState(false);

  // ডাটাবেস সিঙ্ক (আগের মতোই)
  const syncToDatabase = useCallback(async (items: CartItem[]) => {
      const token = localStorage.getItem('token');
      if (!token) return;
      setIsSyncing(true);
      try {
          await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ items })
          });
          setIsDirty(false);
      } catch (error) { console.error("Sync failed", error); } 
      finally { setIsSyncing(false); }
  }, []);

  // ইনিশিয়াল লোড (আগের মতোই)
  useEffect(() => {
    const initializeCart = async () => {
        const token = localStorage.getItem('token');
        let localItems: CartItem[] = [];
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
            try {
                const parsed = JSON.parse(storedCart);
                if (parsed.items) localItems = parsed.items;
            } catch (e) {}
        }

        if (token) {
            try {
                const res = await fetch('/api/cart', { headers: { 'Authorization': `Bearer ${token}` } });
                const data = await res.json();
                if (data.success) {
                    dispatch({ type: 'SET_CART', payload: { items: data.items || [] } });
                    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: data.items || [] }));
                } else {
                    dispatch({ type: 'SET_CART', payload: { items: localItems } });
                }
            } catch (e) {
                dispatch({ type: 'SET_CART', payload: { items: localItems } });
            }
        } else {
            dispatch({ type: 'SET_CART', payload: { items: localItems } });
        }
        setIsInitialized(true);
    };
    initializeCart();
  }, []);

  // স্টেট সেভ (আগের মতোই)
  useEffect(() => {
    if (isInitialized) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isInitialized]);

  // পিরিওডিক সিঙ্ক (আগের মতোই)
  useEffect(() => {
    const interval = setInterval(() => {
        const token = localStorage.getItem('token');
        if (token && isDirty && !isSyncing) syncToDatabase(state.items);
    }, 30000);
    return () => clearInterval(interval);
  }, [isDirty, isSyncing, state.items, syncToDatabase]);

  // পুশার (আগের মতোই)
  useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token || !isInitialized) return;
      const userId = getUserIdFromToken(token);
      if (!userId) return;

      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      });
      const channel = pusher.subscribe(`user-${userId}`);
      channel.bind('cart-updated', (data: any) => {
          if (!isSyncing) {
              dispatch({ type: 'SET_CART', payload: { items: data.items } });
              localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: data.items }));
              setIsDirty(false); 
          }
      });
      return () => { pusher.unsubscribe(`user-${userId}`); };
  }, [isInitialized, isSyncing]);

  // অ্যাকশনস
  const addItem = (product: Product, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
    setIsDirty(true);
    toast.success(`Added "${product.name}" to cart`);
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    setIsDirty(true);
    toast.info("Item removed");
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    setIsDirty(true);
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    setIsDirty(true);
    const token = localStorage.getItem('token');
    if (token) syncToDatabase([]); 
  };

  // ★ ৩. নতুন ফাংশন: চেকআউট ডেটা সেট করা
  const setCheckoutData = (data: Partial<CheckoutState>) => {
      dispatch({ type: 'SET_CHECKOUT_DATA', payload: data });
  };

  const itemCount = state.items.reduce((count, item) => count + item.quantity, 0);
  const totalPrice = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setCheckoutData, // এক্সপোর্ট করা হলো
        itemCount,
        totalPrice,
        checkoutState: state.checkoutState, // স্টেট এক্সপোর্ট
        isInitialized,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};