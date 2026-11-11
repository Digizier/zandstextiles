"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem } from "./types";

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem, openDrawer?: boolean) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "zs_textiles_cart";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
    setIsHydrated(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setCart(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Save cart to LocalStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      window.dispatchEvent(new Event("kb_cart_updated"));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart, isHydrated]);

  const addToCart = (item: CartItem, openDrawer = true) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (i) => i.product_id === item.product_id && i.size === item.size && i.color === item.color
      );
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }
      return [...prevCart, item];
    });

    if (openDrawer) {
      setIsCartDrawerOpen(true);
    }
  };

  const removeFromCart = (productId: string, size?: string, color?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product_id === productId && (!size || item.size === size) && (!color || item.color === color))
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product_id === productId && (!size || item.size === size) && (!color || item.color === color)) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        cartTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
