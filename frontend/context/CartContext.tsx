'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  cartId: string; // unique string: id-spice-notes-portion
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  isVeg: boolean;
  spiceLevel: string;
  itemNotes: string;
  portion: string; // e.g. "Half", "Full", "Single", "Standard"
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: any, quantity: number, spiceLevel: string, itemNotes: string, portion?: string) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  packagingFee: number;
  deliveryFee: number;
  setDeliveryFee: (fee: number) => void;
  gst: number;
  discount: number;
  grandTotal: number;
  couponCode: string;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  deliveryType: 'Delivery' | 'Pickup' | 'Dine-In';
  setDeliveryType: (type: 'Delivery' | 'Pickup' | 'Dine-In') => void;
  tableNo: string;
  setTableNo: (no: string) => void;
  specialInstructions: string;
  setSpecialInstructions: (notes: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [deliveryType, setDeliveryType] = useState<'Delivery' | 'Pickup' | 'Dine-In'>('Delivery');
  const [tableNo, setTableNo] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('vantillu_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // Save cart to localStorage on changes
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('vantillu_cart', JSON.stringify(newCart));
  };

  const addToCart = (item: any, quantity: number, spiceLevel: string, itemNotes: string, portion: string = 'Standard') => {
    const cartId = `${item.id}-${spiceLevel}-${itemNotes.trim()}-${portion}`;
    const existingIndex = cart.findIndex((i) => i.cartId === cartId);

    // Calculate actual price based on portion choice
    let actualPrice = item.price || 0;
    if (portion === 'Half' && item.halfPrice !== undefined) actualPrice = item.halfPrice;
    else if (portion === 'Full' && item.fullPrice !== undefined) actualPrice = item.fullPrice;
    else if (portion === 'Single' && item.singlePrice !== undefined) actualPrice = item.singlePrice;
    else if (portion === 'Family' && item.familyPrice !== undefined) actualPrice = item.familyPrice;
    else if (portion === 'Jumbo' && item.jumboPrice !== undefined) actualPrice = item.jumboPrice;

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += quantity;
      saveCart(updatedCart);
    } else {
      const newItem: CartItem = {
        cartId,
        id: item.id,
        name: item.name,
        price: actualPrice,
        quantity,
        image: item.image,
        isVeg: item.isVeg,
        spiceLevel,
        itemNotes: itemNotes.trim(),
        portion,
      };
      saveCart([...cart, newItem]);
    }
  };

  const removeFromCart = (cartId: string) => {
    const updatedCart = cart.filter((i) => i.cartId !== cartId);
    saveCart(updatedCart);
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    const updatedCart = cart.map((item) =>
      item.cartId === cartId ? { ...item, quantity } : item
    );
    saveCart(updatedCart);
  };

  const clearCart = () => {
    saveCart([]);
    setCouponCode('');
    setDiscountPercent(0);
    setSpecialInstructions('');
    setTableNo('');
  };

  const applyCoupon = (code: string): boolean => {
    const sanitized = code.trim().toUpperCase();
    if (sanitized === 'WELCOME50' || sanitized === 'VANTILLUHOME' || sanitized === 'FESTIVAL20') {
      setCouponCode(sanitized);
      if (sanitized === 'WELCOME50') setDiscountPercent(50); // 50% off first order (max discount handles later or simple percent)
      else if (sanitized === 'VANTILLUHOME') setDiscountPercent(15); // 15% off
      else if (sanitized === 'FESTIVAL20') setDiscountPercent(20); // 20% off
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountPercent(0);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const packagingFee = 0; // Removed per request
  const gst = 0; // Removed per request
  
  // Calculate discount based on subtotal
  const discount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
  
  const grandTotal = Math.max(0, subtotal + packagingFee + deliveryFee + gst - discount);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        packagingFee,
        deliveryFee,
        setDeliveryFee,
        gst,
        discount,
        grandTotal,
        couponCode,
        applyCoupon,
        removeCoupon,
        deliveryType,
        setDeliveryType,
        tableNo,
        setTableNo,
        specialInstructions,
        setSpecialInstructions,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
