// src/context/CartProvider.tsx

'use client';

import React, { createContext, useReducer, ReactNode, useEffect, useState, useCallback, useContext } from 'react';
import type { CartItem, Product } from '@/lib/types';
import { toast } from 'sonner';
import Pusher from 'pusher-js';

// যেহেতু এখানে useAuth ব্যবহার করলে সার্কুলার ডিপেন্ডেন্সি হতে পারে,
// তাই আমরা টোকেন থেকে ইউজার আইডি ডিকোড করব বা লোকাল স্টোরেজ চেক করব।

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

const initialState: CartState = {
  items: [],
};

export const CartContext = createContext<
  | {
      state: CartState;
      addItem: (product: Product, quantity?: number) => void;
      removeItem: (id: string) => void;
      updateQuantity: (id: string, quantity: number) => void;
      clearCart: () => void;
      itemCount: number;
      totalPrice: number;
      isInitialized: boolean;
    }
  | undefined
>(undefined);

// হেল্পার: টোকেন থেকে ইউজার আইডি বের করা (সিম্পল ডিকোড)
function getUserIdFromToken(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload)._id;
    } catch (e) {
        return null;
    }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false); // লুপ আটকানোর জন্য ফ্ল্যাগ

  // ১. ডাটাবেস থেকে ফেচ করা (বাধ্যতামূলক)
  const fetchFromDatabase = useCallback(async (token: string) => {
      try {
          const res = await fetch('/api/cart', {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
              // সার্ভারের ডেটাই আসল (Source of Truth)
              dispatch({ type: 'SET_CART', payload: { items: data.items } });
              // লোকাল স্টোরেজও আপডেট করে দিই
              localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: data.items }));
          }
      } catch (error) {
          console.error("Failed to fetch cart", error);
      }
  }, []);

  // ২. ডাটাবেসে সেভ করা
  const syncToDatabase = useCallback(async (items: CartItem[]) => {
      const token = localStorage.getItem('token');
      if (!token) return;

      setIsSyncing(true); // সিঙ্কিং শুরু
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
          setIsSyncing(false); // সিঙ্কিং শেষ
      }
  }, []);

  // ৩. ইনিশিয়াল লোড
  useEffect(() => {
    const initializeCart = async () => {
        const token = localStorage.getItem('token');
        
        if (token) {
            // যদি লগইন থাকে, সরাসরি সার্ভার থেকে আনব (লোকাল ইগনোর করব যাতে কনফ্লিক্ট না হয়)
            await fetchFromDatabase(token);
        } else {
            // লগইন না থাকলে লোকাল স্টোরেজ থেকে আনব
            const storedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (storedCart) {
                try {
                    const parsed = JSON.parse(storedCart);
                    if (parsed.items) dispatch({ type: 'SET_CART', payload: parsed });
                } catch (e) {}
            }
        }
        setIsInitialized(true);
    };

    initializeCart();
  }, [fetchFromDatabase]);

  // ৪. রিয়েল-টাইম লিসেনার (Pusher)
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
          // যদি আমি নিজে সিঙ্ক করছি, তবে ইভেন্ট ইগনোর করব (ডুপ্লিকেট রেন্ডার এড়াতে)
          if (!isSyncing) {
              console.log("Cart updated from another device!");
              dispatch({ type: 'SET_CART', payload: { items: data.items } });
              localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: data.items }));
          }
      });

      return () => {
          pusher.unsubscribe(`user-${userId}`);
      };
  }, [isInitialized, isSyncing]);

  // ৫. স্টেট পরিবর্তন হলে সেভ করা
  useEffect(() => {
    if (isInitialized) {
        // লোকাল আপডেট
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
        
        // সার্ভার আপডেট (যদি লগইন থাকে এবং এটা সার্ভার থেকে আসা আপডেট না হয়)
        const token = localStorage.getItem('token');
        if (token && !isSyncing) {
             // ডিবাউন্স করার জন্য টাইমআউট ব্যবহার করা ভালো, কিন্তু সিম্পল রাখার জন্য ডাইরেক্ট দিচ্ছি
             syncToDatabase(state.items);
        }
    }
  }, [state, isInitialized]); // syncToDatabase ডিপেন্ডেন্সি থেকে সরানো হয়েছে লুপ এড়াতে

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