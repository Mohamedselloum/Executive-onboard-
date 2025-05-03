import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const couponFormSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
});

type CouponFormValues = z.infer<typeof couponFormSchema>;

export function CouponForm() {
  const { appliedCoupon, applyCoupon, removeCoupon, subtotal } = useCart();
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: CouponFormValues) => {
    try {
      setIsValidating(true);
      const response = await apiRequest("POST", "/api/coupons/validate", { code: data.code });
      const coupon = await response.json();

      // Check if minimum purchase requirement is met
      if (coupon.minimumPurchase && parseFloat(coupon.minimumPurchase) > subtotal) {
        toast({
          title: "Coupon cannot be applied",
          description: `A minimum purchase of $${parseFloat(coupon.minimumPurchase).toFixed(2)} is required for this coupon`,
          variant: "destructive"
        });
        return;
      }

      applyCoupon(coupon);
      form.reset();
    } catch (error) {
      toast({
        title: "Invalid Coupon",
        description: "The coupon code you entered is invalid or expired",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // If a coupon is already applied, show the applied coupon instead of the form
  if (appliedCoupon) {
    return (
      <div className="bg-gray-50 p-3 rounded-md flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">{appliedCoupon.code}</p>
            <p className="text-xs text-gray-500">
              {appliedCoupon.discountType === "percentage"
                ? `${appliedCoupon.discountValue}% off`
                : `$${appliedCoupon.discountValue} off`}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={removeCoupon}
          className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-medium mb-2">Apply Coupon Code</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="Enter coupon code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            variant="secondary" 
            size="sm"
            disabled={isValidating}
          >
            {isValidating ? "Validating..." : "Apply"}
          </Button>
        </form>
      </Form>
      
      <div className="mt-3">
        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 cursor-pointer">
          WELCOME15
        </Badge>
        <span className="text-xs text-gray-500 ml-2">
          Try our welcome coupon!
        </span>
      </div>
    </div>
  );
}
