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
      
      // ★ স্টক চেক লজিক (সিম্পল)
      const currentQty = existingItem ? existingItem.quantity : 0;
      const maxStock = product.stock || 100; // ডিফল্ট ১০০ যদি স্টক না থাকে

      if (currentQty + quantity > maxStock) {
          toast.error(`Sorry, only ${maxStock} items available in stock.`);
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
      // ★ স্টক চেক আপডেট করার সময়ও
      // (এখানে product অবজেক্ট নেই, তাই সরাসরি চেক করা কঠিন, তবে বেসিক চেক রাখা যায়)
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
  const [isSyncing, setIsSyncing] = useState(false);
  
  // ★ Debounce এর জন্য রিফ
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ১. কার্ট মার্জিং ফাংশন (Local + Server)
  const mergeCarts = (localItems: CartItem[], serverItems: CartItem[]) => {
      const mergedMap = new Map();

      // সার্ভারের আইটেমগুলো আগে ম্যাপে রাখি
      serverItems.forEach(item => mergedMap.set(item.id, item));

      // লোকাল আইটেমগুলো যোগ করি
      localItems.forEach(localItem => {
          if (mergedMap.has(localItem.id)) {
              // যদি দুই জায়গাতেই থাকে, তবে কোয়ান্টিটি যোগ করব (বা ম্যাক্স নেব)
              const existing = mergedMap.get(localItem.id);
              // অপশন ১: যোগ করা (User Friendly)
              existing.quantity = Math.min(existing.quantity + localItem.quantity, 100); 
              mergedMap.set(localItem.id, existing);
          } else {
              // নতুন আইটেম
              mergedMap.set(localItem.id, localItem);
          }
      });

      return Array.from(mergedMap.values());
  };

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
      } catch (error) {
          console.error("Failed to sync cart", error);
      } finally {
          setIsSyncing(false);
      }
  }, []);

  // ২. ইনিশিয়াল লোড (স্মার্ট মার্জিং সহ)
  useEffect(() => {
    const initializeCart = async () => {
        const token = localStorage.getItem('token');
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        let localItems: CartItem[] = [];
        
        if (storedCart) {
            try {
                const parsed = JSON.parse(storedCart);
                if (parsed.items) localItems = parsed.items;
            } catch (e) {}
        }

        if (token) {
            try {
                // সার্ভার থেকে কার্ট আনা
                const res = await fetch('/api/cart', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                
                if (data.success) {
                    const serverItems = data.items || [];
                    // ★ মার্জ করা হচ্ছে
                    const finalItems = mergeCarts(localItems, serverItems);
                    
                    dispatch({ type: 'SET_CART', payload: { items: finalItems } });
                    
                    // যদি মার্জ করার ফলে নতুন কিছু তৈরি হয়, তা সার্ভারে আপডেট করে দেওয়া
                    if (JSON.stringify(finalItems) !== JSON.stringify(serverItems)) {
                        syncToDatabase(finalItems);
                    }
                } else {
                    // সার্ভার এরর হলে লোকালটাই দেখাও
                    dispatch({ type: 'SET_CART', payload: { items: localItems } });
                }
            } catch (e) {
                dispatch({ type: 'SET_CART', payload: { items: localItems } });
            }
        } else {
            // লগইন নেই, শুধু লোকাল
            dispatch({ type: 'SET_CART', payload: { items: localItems } });
        }
        setIsInitialized(true);
    };

    initializeCart();
  }, [syncToDatabase]); // Only dependency needed for initial load logic extraction

  // ৩. রিয়েল-টাইম লিসেনার
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
          }
      });

      return () => { pusher.unsubscribe(`user-${userId}`); };
  }, [isInitialized, isSyncing]);

  // ৪. স্টেট সেভ করা (Debounced)
  useEffect(() => {
    if (isInitialized) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
        
        const token = localStorage.getItem('token');
        if (token && !isSyncing) {
            // ★ Debounce Logic (২ সেকেন্ড অপেক্ষা করবে)
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            
            timeoutRef.current = setTimeout(() => {
                syncToDatabase(state.items);
            }, 2000);
        }
    }
  }, [state, isInitialized, syncToDatabase]); // isSyncing removed to avoid loop, logic handled inside

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