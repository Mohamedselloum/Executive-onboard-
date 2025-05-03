import React, { createContext, useState, useContext, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  discount: number;
  total: number;
}

interface Coupon {
  id: number;
  code: string;
  discountType: string;
  discountValue: string;
  minimumPurchase: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const { toast } = useToast();

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    const savedCoupon = localStorage.getItem("coupon");
    
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart from localStorage:", e);
      }
    }
    
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch (e) {
        console.error("Failed to parse coupon from localStorage:", e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  // Save coupon to localStorage whenever it changes
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem("coupon", JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem("coupon");
    }
  }, [appliedCoupon]);

  const addItem = (item: CartItem) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      
      if (existingItem) {
        toast({
          title: "Cart updated",
          description: `${item.name} quantity increased to ${existingItem.quantity + item.quantity}`,
        });
        
        return prevItems.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + item.quantity } 
            : i
        );
      } else {
        toast({
          title: "Item added to cart",
          description: `${item.name} has been added to your cart`,
        });
        
        return [...prevItems, item];
      }
    });
  };

  const removeItem = (id: number) => {
    setItems(prevItems => {
      const item = prevItems.find(i => i.id === id);
      if (item) {
        toast({
          title: "Item removed",
          description: `${item.name} has been removed from your cart`,
        });
      }
      return prevItems.filter(item => item.id !== id);
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity, 
    0
  );

  const applyCoupon = (coupon: Coupon) => {
    // Check if minimum purchase requirement is met
    if (coupon.minimumPurchase && parseFloat(coupon.minimumPurchase) > subtotal) {
      toast({
        title: "Coupon cannot be applied",
        description: `A minimum purchase of $${parseFloat(coupon.minimumPurchase).toFixed(2)} is required for this coupon`,
        variant: "destructive"
      });
      return;
    }
    
    setAppliedCoupon(coupon);
    toast({
      title: "Coupon applied",
      description: `${coupon.code} has been applied to your cart`
    });
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast({
      title: "Coupon removed",
      description: "The coupon has been removed from your cart"
    });
  };

  // Calculate discount amount
  const discount = appliedCoupon 
    ? appliedCoupon.discountType === "percentage"
      ? (subtotal * parseFloat(appliedCoupon.discountValue)) / 100
      : parseFloat(appliedCoupon.discountValue)
    : 0;

  // Calculate total after discount
  const total = Math.max(subtotal - discount, 0);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discount,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
