// src/context/CartProvider.tsx

'use client';

import React, { createContext, useReducer, ReactNode, useEffect, useState, useCallback, useRef } from 'react';
import type { CartItem, Product } from '@/lib/types';
import { toast } from 'sonner';
import Pusher from 'pusher-js';

const CART_STORAGE_KEY = 'bumbas-kitchen-cart';

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: CartState };

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

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      const newItem: CartItem = {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : { id: 'def', url: '', alt: product.name },
        quantity: quantity,
      };
      return { ...state, items: [...state.items, newItem] };
    }
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id),
      };
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'SET_CART':
      return action.payload;
    default:
      return state;
  }
};

const initialState: CartState = { items: [] };

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
  
  // ★ এই ফ্ল্যাগটি আসল ম্যাজিক করবে। এটি ট্র্যাক করবে ইউজার নিজে কিছু চেঞ্জ করেছে কি না।
  const [isDirty, setIsDirty] = useState(false); 
  const [isSyncing, setIsSyncing] = useState(false);

  // ১. ডাটাবেসে সিঙ্ক করার ফাংশন
  const syncToDatabase = useCallback(async (items: CartItem[]) => {
      const token = localStorage.getItem('token');
      if (!token) return;

      setIsSyncing(true);
      try {
          await fetch('/api/cart', {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ items })
          });
          console.log("Cart synced to database.");
          setIsDirty(false); // ★ সিঙ্ক হয়ে গেলে ডার্টি ফ্ল্যাগ বন্ধ করে দেব
      } catch (error) {
          console.error("Failed to sync cart", error);
      } finally {
          setIsSyncing(false);
      }
  }, []);

  // ২. ইনিশিয়াল লোড (সার্ভার থেকে ডেটা আনা)
  useEffect(() => {
    const initializeCart = async () => {
        const token = localStorage.getItem('token');
        
        // ডিফল্টভাবে লোকাল কার্ট লোড করার চেষ্টা
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
                // সার্ভার থেকে লেটেস্ট কার্ট আনি
                const res = await fetch('/api/cart', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                
                if (data.success) {
                    const serverItems = data.items || [];
                    // ★ সার্ভারের ডেটাই ফাইনাল। এটি সেট করার সময় আমরা isDirty TRUE করব না।
                    dispatch({ type: 'SET_CART', payload: { items: serverItems } });
                    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: serverItems }));
                } else {
                    // সার্ভার ফেইল করলে লোকাল ডেটা সেট করি
                    dispatch({ type: 'SET_CART', payload: { items: localItems } });
                }
            } catch (e) {
                console.error("Error fetching server cart:", e);
                dispatch({ type: 'SET_CART', payload: { items: localItems } });
            }
        } else {
            // লগইন নেই, তাই লোকাল ডেটাই ফাইনাল
            dispatch({ type: 'SET_CART', payload: { items: localItems } });
        }
        
        setIsInitialized(true);
    };

    initializeCart();
  }, []);

  // ৩. স্টেট সেভ করা (Local Storage - Always, Server - Conditional)
  useEffect(() => {
    if (isInitialized) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isInitialized]);

  // ৪. পর্যায়ক্রমিক সিঙ্ক (Periodic Sync - 30 Seconds)
  useEffect(() => {
    const interval = setInterval(() => {
        const token = localStorage.getItem('token');
        // ★ মূল ফিক্স: যদি ইউজার লগইন থাকে এবং সে নিজে কিছু পরিবর্তন করে থাকে (isDirty), তবেই সেভ হবে।
        // যদি Device A তে কার্ট খালি থাকে এবং ইউজার কিছু না করে, তবে isDirty false থাকবে এবং সেভ হবে না।
        if (token && isDirty && !isSyncing) {
            syncToDatabase(state.items);
        }
    }, 30000);

    return () => clearInterval(interval);
  }, [isDirty, isSyncing, state.items, syncToDatabase]);

  // ৫. রিয়েল-টাইম লিসেনার (Pusher)
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
          // অন্য ডিভাইস আপডেট করলে সেটা রিসিভ করা
          if (!isSyncing) {
              console.log("Cart updated from another device!");
              dispatch({ type: 'SET_CART', payload: { items: data.items } });
              localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: data.items }));
              setIsDirty(false); // সার্ভার থেকে এসেছে, তাই এটি ফ্রেশ ডেটা
          }
      });

      return () => { pusher.unsubscribe(`user-${userId}`); };
  }, [isInitialized, isSyncing]);


  // ★ অ্যাকশন ফাংশনগুলো (এখানেই isDirty = true করা হচ্ছে)
  const addItem = (product: Product, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
    setIsDirty(true); // ইউজার চেঞ্জ করেছে
    toast.success(`Added "${product.name}" to cart`);
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    setIsDirty(true); // ইউজার চেঞ্জ করেছে
    toast.info("Item removed");
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    setIsDirty(true); // ইউজার চেঞ্জ করেছে
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    setIsDirty(true); // ইউজার চেঞ্জ করেছে
    // কার্ট ক্লিয়ার করলে সাথে সাথে সার্ভারেও ক্লিয়ার করা ভালো (দেরি না করে)
    const token = localStorage.getItem('token');
    if (token) syncToDatabase([]); 
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
        itemCount,
        totalPrice,
        isInitialized,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};