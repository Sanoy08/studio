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
      
      const currentQty = existingItem ? existingItem.quantity : 0;
      const maxStock = product.stock || 100;

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // সার্ভারে ডেটা পাঠানোর ফাংশন
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

  // ★★★ ১. ইনিশিয়াল লোড এবং সিঙ্ক লজিক (ফিক্সড) ★★★
  useEffect(() => {
    const initializeCart = async () => {
        const token = localStorage.getItem('token');
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        let localItems: CartItem[] = [];
        
        // প্রথমে লোকাল ডেটা লোড করি (তাৎক্ষনিক দেখানোর জন্য)
        if (storedCart) {
            try {
                const parsed = JSON.parse(storedCart);
                if (parsed.items) {
                    localItems = parsed.items;
                    dispatch({ type: 'SET_CART', payload: { items: localItems } });
                }
            } catch (e) {}
        }

        if (token) {
            try {
                // সার্ভার থেকে কার্ট আনি
                const res = await fetch('/api/cart', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                
                if (data.success) {
                    const serverItems = data.items || [];
                    
                    // ★★★ লজিক ফিক্স: ডুপ্লিকেশন বন্ধ করা ★★★
                    if (serverItems.length > 0) {
                        // যদি সার্ভারে ডেটা থাকে, তবে সেটাই আসল। লোকাল ডেটা ওভাররাইট হবে।
                        // এটি রিফ্রেশ করলে ২১ -> ৪২ হওয়ার সমস্যা সমাধান করে।
                        dispatch({ type: 'SET_CART', payload: { items: serverItems } });
                        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: serverItems }));
                    } else if (localItems.length > 0) {
                        // যদি সার্ভার খালি থাকে কিন্তু লোকালে আইটেম থাকে (যেমন: গেস্ট ইউজার লগইন করল)
                        // তখন লোকাল ডেটা সার্ভারে পাঠাবো।
                        await syncToDatabase(localItems);
                    }
                }
            } catch (e) {
                console.error("Error fetching cart:", e);
            }
        }
        
        setIsInitialized(true);
    };

    initializeCart();
  }, [syncToDatabase]);

  // ২. রিয়েল-টাইম লিসেনার (Pusher)
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
              console.log("Cart updated from server!");
              dispatch({ type: 'SET_CART', payload: { items: data.items } });
              localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: data.items }));
          }
      });

      return () => { pusher.unsubscribe(`user-${userId}`); };
  }, [isInitialized, isSyncing]);

  // ৩. স্টেট সেভ করা (Debounced Sync)
  useEffect(() => {
    if (isInitialized) {
        // লোকাল আপডেট সাথে সাথে
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
        
        const token = localStorage.getItem('token');
        if (token && !isSyncing) {
            // সার্ভার আপডেট একটু দেরি করে (২ সেকেন্ড), যাতে সার্ভারে লোড কম পড়ে
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            
            timeoutRef.current = setTimeout(() => {
                syncToDatabase(state.items);
            }, 2000);
        }
    }
  }, [state, isInitialized, syncToDatabase]);

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