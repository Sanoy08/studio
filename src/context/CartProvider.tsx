// src/context/CartProvider.tsx

'use client';

import React, { createContext, useReducer, ReactNode, useEffect, useState, useCallback } from 'react';
import type { CartItem, Product } from '@/lib/types';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth'; // Auth Hook লাগবে

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
      // Image Structure Normalize
      let imgUrl = '';
      if (product.images && product.images.length > 0) {
          imgUrl = product.images[0].url;
      }
      
      const newItem: CartItem = {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: { id: 'img', url: imgUrl, alt: product.name },
        quantity: quantity,
      };
      return { ...state, items: [...state.items, newItem] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((item) => item.id !== action.payload.id) };
    case 'UPDATE_QUANTITY':
       if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter((item) => item.id !== action.payload.id) };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      };
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

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth(); // ইউজার আছে কি না দেখার জন্য

  // ১. কার্ট সিঙ্ক করার ফাংশন (ডাটাবেসে সেভ)
  const syncCartToDB = useCallback(async (cartItems: CartItem[]) => {
     const token = localStorage.getItem('token');
     if (!token) return;
     try {
        await fetch('/api/user/cart', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ items: cartItems })
        });
     } catch (error) {
        console.error("Failed to sync cart", error);
     }
  }, []);

  // ২. ইনিশিয়াল লোড (লগইন থাকলে ডিবি থেকে, না থাকলে লোকাল থেকে)
  useEffect(() => {
    const initializeCart = async () => {
        const token = localStorage.getItem('token');
        
        // যদি লগইন থাকে, সার্ভার থেকে কার্ট আনো
        if (user && token) {
            try {
                const res = await fetch('/api/user/cart', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                
                if (data.success) {
                    dispatch({ type: 'SET_CART', payload: { items: data.items } });
                    
                    // যদি সার্ভার বলে কিছু আইটেম রিমুভ হয়েছে (Out of Stock)
                    if (data.message && data.message.includes("removed")) {
                        toast.warning("Some items were removed because they are out of stock.");
                    }
                }
            } catch (error) {
                console.error("DB Cart Load Error", error);
            }
        } else {
            // গেস্ট ইউজার: লোকাল স্টোরেজ থেকে লোড করো
            const storedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (storedCart) {
                try {
                    const parsedCart = JSON.parse(storedCart);
                    if (parsedCart && Array.isArray(parsedCart.items)) {
                        dispatch({ type: 'SET_CART', payload: parsedCart });
                    }
                } catch (e) { localStorage.removeItem(CART_STORAGE_KEY); }
            }
        }
        setIsInitialized(true);
    };

    initializeCart();
  }, [user]); // ইউজার পরিবর্তন হলে (লগইন/লগআউট) আবার রান হবে

  // ৩. কার্ট পরিবর্তন হলে সেভ করা
  useEffect(() => {
    if (!isInitialized) return;

    // লোকাল স্টোরেজে সবসময় সেভ রাখব (ব্যাকআপ হিসেবে)
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));

    // যদি ইউজার লগইন থাকে, তবে ডাটাবেসেও আপডেট পাঠাব (Debounce করা ভালো, তবে সিম্পল রাখছি)
    if (user) {
        const timeoutId = setTimeout(() => {
            syncCartToDB(state.items);
        }, 500); // ৫০০ms ডিলে দিয়ে সেভ হবে যাতে নেটওয়ার্ক জ্যাম না হয়
        return () => clearTimeout(timeoutId);
    }
  }, [state, isInitialized, user, syncCartToDB]);

  const addItem = (product: Product, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
    toast.success(`Added "${product.name}"`);
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
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart, itemCount, totalPrice, isInitialized }}>
      {children}
    </CartContext.Provider>
  );
};