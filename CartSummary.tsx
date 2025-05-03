import React from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CouponForm } from "@/components/coupon/CouponForm";

interface CartSummaryProps {
  showCouponForm?: boolean;
}

export function CartSummary({ showCouponForm = true }: CartSummaryProps) {
  const [location] = useLocation();
  const { items, subtotal, appliedCoupon, discount, total } = useCart();
  const isCheckoutPage = location === "/checkout";
  
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cart Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Your cart is empty</p>
        </CardContent>
        <CardFooter>
          <Link href="/products">
            <Button className="w-full">Shop Now</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cart Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Summary */}
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="text-sm font-medium">${subtotal.toFixed(2)}</span>
          </div>
          
          {appliedCoupon && (
            <div className="flex justify-between text-green-600">
              <span className="text-sm flex items-center gap-1">
                Discount
                <span className="text-xs text-gray-500">({appliedCoupon.code})</span>
              </span>
              <span className="text-sm font-medium">-${discount.toFixed(2)}</span>
            </div>
          )}
          
          <Separator className="my-2" />
          
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Coupon Form */}
        {showCouponForm && (
          <div className="pt-2">
            <CouponForm />
          </div>
        )}
        
        {/* Checkout info */}
        {!isCheckoutPage && (
          <div className="text-xs text-gray-500 mt-4">
            <p>Shipping and taxes calculated at checkout</p>
          </div>
        )}
      </CardContent>
      
      {!isCheckoutPage && (
        <CardFooter>
          <Link href="/checkout">
            <Button className="w-full">Proceed to Checkout</Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
