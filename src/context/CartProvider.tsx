// src/context/CartProvider.tsx

'use client';

import React, { createContext, useReducer, ReactNode, useEffect, useState, useCallback } from 'react';
import type { CartItem, Product } from '@/lib/types';
import { toast } from 'sonner';
// আমরা useAuth সরাসরি এখানে ব্যবহার করতে পারব না (Circular Dependency হতে পারে),
// তাই আমরা token চেক করব ম্যানুয়ালি বা প্যারেন্ট থেকে সিঙ্ক করব।

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
        image: product.images && product.images.length > 0 ? product.images[0] : { id: 'default', url: '', alt: product.name },
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

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // ডাটাবেসে সিঙ্ক করার ফাংশন
  const syncToDatabase = useCallback(async (items: CartItem[]) => {
      const token = localStorage.getItem('token');
      if (!token) return; // লগইন না থাকলে দরকার নেই

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
      }
  }, []);

  // ডাটাবেস থেকে ফেচ করার ফাংশন
  const fetchFromDatabase = useCallback(async () => {
      const token = localStorage.getItem('token');
      if (!token) return false; // লগইন নেই

      try {
          const res = await fetch('/api/cart', {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success && data.items.length > 0) {
              // সার্ভার থেকে ডেটা পেলে সেট করো
              dispatch({ type: 'SET_CART', payload: { items: data.items } });
              return true;
          }
      } catch (error) {
          console.error("Failed to fetch cart", error);
      }
      return false;
  }, []);

  // ১. ইনিশিয়াল লোড (প্রথমে লোকাল স্টোরেজ, তারপর সার্ভার চেক)
  useEffect(() => {
    const initializeCart = async () => {
        // প্রথমে লোকাল স্টোরেজ চেক
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        let localItems: CartItem[] = [];
        
        if (storedCart) {
            try {
                const parsed = JSON.parse(storedCart);
                if (parsed.items) localItems = parsed.items;
                dispatch({ type: 'SET_CART', payload: { items: localItems } });
            } catch (e) {}
        }

        // তারপর সার্ভার চেক (যদি লগইন থাকে)
        const token = localStorage.getItem('token');
        if (token) {
            // মার্জ লজিক: যদি লোকালে কিছু থাকে, সেটা সার্ভারে পাঠাবো। নাহলে সার্ভার থেকে আনবো।
            if (localItems.length > 0) {
                await syncToDatabase(localItems); // সার্ভারে আপডেট
            } else {
                await fetchFromDatabase(); // সার্ভার থেকে ডাউনলোড
            }
        }
        
        setIsInitialized(true);
    };

    initializeCart();
  }, [syncToDatabase, fetchFromDatabase]);

  // ২. স্টেট চেঞ্জ হলে সেভ করা (লোকাল + সার্ভার)
  useEffect(() => {
    if (isInitialized) {
        // লোকালে সেভ
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
        
        // সার্ভারে সিঙ্ক (ডিবাউন্স করা ভালো, কিন্তু সিম্পল রাখার জন্য সরাসরি দিচ্ছি)
        const token = localStorage.getItem('token');
        if (token) {
            syncToDatabase(state.items);
        }
    }
  }, [state, isInitialized, syncToDatabase]);

  const addItem = (product: Product, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
    toast.success(`Added "${product.name}" to cart`);
  };

  const removeItem = (id: string) => {
    const itemToRemove = state.items.find((item) => item.id === id);
    if (itemToRemove) {
      dispatch({ type: 'REMOVE_ITEM', payload: { id } });
      toast.info(`Removed "${itemToRemove.name}" from cart`);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const itemCount = state.items.reduce((count, item) => count + item.quantity, 0);
  const totalPrice = state.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

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