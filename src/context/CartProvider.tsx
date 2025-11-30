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
      
      // স্টক চেক (Optional)
      const currentQty = existingItem ? existingItem.quantity : 0;
      const maxStock = product.stock || 100; 
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
  const [isDirty, setIsDirty] = useState(false); // চেঞ্জ ট্র্যাক করার জন্য
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
          setIsDirty(false); // সিঙ্ক সফল হলে ডার্টি ফ্ল্যাগ বন্ধ
      } catch (error) {
          console.error("Failed to sync cart", error);
      } finally {
          setIsSyncing(false);
      }
  }, []);

  // ২. ইনিশিয়াল লোড (Best Logic for preventing doubling)
  useEffect(() => {
    const initializeCart = async () => {
        // প্রথমে লোকাল স্টোরেজ থেকে লোড করি (ফাস্ট রেন্ডারের জন্য)
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        let localItems: CartItem[] = [];
        if (storedCart) {
            try {
                const parsed = JSON.parse(storedCart);
                if (parsed.items) {
                    localItems = parsed.items;
                    dispatch({ type: 'SET_CART', payload: { items: localItems } });
                }
            } catch (e) {}
        }

        const token = localStorage.getItem('token');
        if (token) {
            try {
                // সার্ভার থেকে লেটেস্ট কার্ট আনি
                const res = await fetch('/api/cart', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                
                if (data.success) {
                    const serverItems = data.items || [];

                    if (serverItems.length > 0) {
                        // ★ FIX: যদি সার্ভারে ডেটা থাকে, তবে সেটাই ফাইনাল।
                        // লোকাল ডেটা আর যোগ হবে না (এতেই ডাবলিং ফিক্স হবে)
                        dispatch({ type: 'SET_CART', payload: { items: serverItems } });
                        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: serverItems }));
                    } else if (localItems.length > 0) {
                        // যদি সার্ভার খালি থাকে কিন্তু লোকালে ডেটা থাকে (Guest User Login scenario)
                        // তবে লোকাল ডেটা সার্ভারে পাঠাবো
                        syncToDatabase(localItems);
                    }
                }
            } catch (e) {
                console.error("Error fetching server cart:", e);
            }
        }
        
        setIsInitialized(true);
    };

    initializeCart();
  }, [syncToDatabase]);

  // ৩. স্টেট পরিবর্তন হলে Local Storage আপডেট এবং Dirty Flag অন করা
  useEffect(() => {
    if (isInitialized) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
        
        // যদি এটি সার্ভার থেকে আসা আপডেট না হয়, তবেই ডার্টি মার্ক করব
        if (!isSyncing) {
            setIsDirty(true); 
        }
    }
  }, [state, isInitialized, isSyncing]);

  // ৪. পর্যায়ক্রমিক সিঙ্ক (Periodic Sync - 30 Seconds)
  useEffect(() => {
    const interval = setInterval(() => {
        const token = localStorage.getItem('token');
        // যদি লগইন থাকে এবং নতুন চেঞ্জ (Dirty) থাকে, তবেই সেভ হবে
        if (token && isDirty && !isSyncing) {
            syncToDatabase(state.items);
        }
    }, 30000); // ৩০ সেকেন্ড = ৩০০০০ মিলিসেকেন্ড

    return () => clearInterval(interval);
  }, [isDirty, isSyncing, state.items, syncToDatabase]);

  // ৫. রিয়েল-টাইম লিসেনার (Pusher) - অন্য ডিভাইস আপডেট করলে পাওয়ার জন্য
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
          // যদি আমি নিজে সিঙ্ক করছি না, তখন অন্য ডিভাইসের আপডেট নিব
          if (!isSyncing) {
              console.log("Cart updated from another device!");
              dispatch({ type: 'SET_CART', payload: { items: data.items } });
              localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: data.items }));
              setIsDirty(false); // সার্ভার থেকে এসেছে, তাই ডার্টি নয়
          }
      });

      return () => { pusher.unsubscribe(`user-${userId}`); };
  }, [isInitialized, isSyncing]);


  // অ্যাকশন ফাংশনগুলো
  const addItem = (product: Product, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
    toast.success(`Added "${product.name}" to cart`);
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    toast.info("Item removed");
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    // কার্ট ক্লিয়ার করলে সাথে সাথে সার্ভারেও ক্লিয়ার করা ভালো
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