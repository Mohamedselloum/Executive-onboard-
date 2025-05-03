import React from "react";
import { useCart } from "@/context/CartContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";

export function OrderSummary() {
  const { items, subtotal, appliedCoupon, discount, total } = useCart();

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Your cart is empty</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div className="flex items-start gap-2">
                <span className="text-gray-700 font-medium">{item.quantity} ×</span>
                <span className="text-gray-800">{item.name}</span>
              </div>
              <span className="text-gray-900 font-medium">
                ${(parseFloat(item.price) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-sm text-green-600">
              <div className="flex items-center gap-1">
                <span>Discount</span>
                <span className="text-xs text-gray-500">({appliedCoupon.code})</span>
              </div>
              <span className="font-medium">-${discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-900 font-medium">Free</span>
          </div>

          <Separator />

          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Coupon display */}
        {appliedCoupon && (
          <div className="bg-green-50 border border-green-100 p-3 rounded-md mt-2 flex items-start gap-2">
            <Tag className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Coupon: {appliedCoupon.code}
              </p>
              <p className="text-xs text-green-700">
                {appliedCoupon.discountType === "percentage"
                  ? `${appliedCoupon.discountValue}% off`
                  : `$${appliedCoupon.discountValue} off`}
              </p>
            </div>
          </div>
        )}

        {/* Estimated delivery info */}
        <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-600">
          <p>
            Standard delivery: 3-7 business days
          </p>
          <p className="mt-1">
            Express delivery available at checkout for an additional fee.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
