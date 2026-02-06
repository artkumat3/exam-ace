 import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
 
 export interface CartItem {
   id: string;
   name: string;
   price: number;
   productType: 'book' | 'addon';
   classLevel: string;
   subject?: string;
   coverImage?: string;
 }
 
 interface CartContextType {
   items: CartItem[];
   addItem: (item: CartItem) => void;
   removeItem: (id: string) => void;
   clearCart: () => void;
   getBookCount: () => number;
   getAddonCount: () => number;
   getSubtotal: () => number;
   getDiscount: () => number;
   getTotal: () => number;
   isInCart: (id: string) => boolean;
 }
 
 const CartContext = createContext<CartContextType | undefined>(undefined);
 
 export function CartProvider({ children }: { children: React.ReactNode }) {
   const [items, setItems] = useState<CartItem[]>([]);
 
   const addItem = useCallback((item: CartItem) => {
     setItems(prev => {
       if (prev.find(i => i.id === item.id)) return prev;
       return [...prev, item];
     });
   }, []);
 
   const removeItem = useCallback((id: string) => {
     setItems(prev => prev.filter(item => item.id !== id));
   }, []);
 
   const clearCart = useCallback(() => {
     setItems([]);
   }, []);
 
   const getBookCount = useCallback(() => {
     return items.filter(item => item.productType === 'book').length;
   }, [items]);
 
   const getAddonCount = useCallback(() => {
     return items.filter(item => item.productType === 'addon').length;
   }, [items]);
 
   const getSubtotal = useCallback(() => {
     return items.reduce((sum, item) => sum + item.price, 0);
   }, [items]);
 
  // Dynamic pricing: 2 books = ₹99, 4 books = ₹249, addons are ₹19 each
  const getDiscount = useCallback(() => {
    const bookCount = getBookCount();
    const addonCount = getAddonCount();
    
    const bookSubtotal = items
      .filter(item => item.productType === 'book')
      .reduce((sum, item) => sum + item.price, 0);
    
    let bookTotal = bookSubtotal;
    
    if (bookCount >= 4) {
      bookTotal = 249;
    } else if (bookCount >= 2) {
      bookTotal = 99;
    }
    
    // Addons are ₹19 each
    const addonTotal = addonCount * 19;
    const actualTotal = bookTotal + addonTotal;
    const subtotal = getSubtotal();
    
    return subtotal - actualTotal;
  }, [items, getBookCount, getAddonCount, getSubtotal]);
 
   const getTotal = useCallback(() => {
     return getSubtotal() - getDiscount();
   }, [getSubtotal, getDiscount]);
 
   const isInCart = useCallback((id: string) => {
     return items.some(item => item.id === id);
   }, [items]);
 
   const value = useMemo(() => ({
     items,
     addItem,
     removeItem,
     clearCart,
     getBookCount,
     getAddonCount,
     getSubtotal,
     getDiscount,
     getTotal,
     isInCart,
   }), [items, addItem, removeItem, clearCart, getBookCount, getAddonCount, getSubtotal, getDiscount, getTotal, isInCart]);
 
   return (
     <CartContext.Provider value={value}>
       {children}
     </CartContext.Provider>
   );
 }
 
 export function useCart() {
   const context = useContext(CartContext);
   if (!context) {
     throw new Error('useCart must be used within a CartProvider');
   }
   return context;
 }