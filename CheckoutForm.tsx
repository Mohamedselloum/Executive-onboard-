import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderSummary } from "@/components/checkout/OrderSummary";

const checkoutFormSchema = z.object({
  shippingAddress: z.string().min(5, "Address must be at least 5 characters"),
  shippingCity: z.string().min(2, "City must be at least 2 characters"),
  shippingState: z.string().min(2, "State must be at least 2 characters"),
  shippingZip: z.string().min(5, "ZIP code must be at least 5 characters"),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export function CheckoutForm() {
  const { user, isAuthenticated } = useAuth();
  const { items, subtotal, total, appliedCoupon, discount, clearCart } = useCart();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      shippingAddress: "",
      shippingCity: "",
      shippingState: "",
      shippingZip: "",
    },
  });

  React.useEffect(() => {
    // If not logged in, redirect to login page
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to proceed with checkout",
        variant: "destructive",
      });
      navigate("/login?redirect=/checkout");
    }

    // If cart is empty, redirect to cart page
    if (items.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Your cart is empty. Add items to checkout.",
        variant: "destructive",
      });
      navigate("/cart");
    }
  }, [isAuthenticated, items, navigate, toast]);

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Login Required",
        description: "Please log in to proceed with checkout",
        variant: "destructive",
      });
      navigate("/login?redirect=/checkout");
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Your cart is empty. Add items to checkout.",
        variant: "destructive",
      });
      navigate("/cart");
      return;
    }

    try {
      setIsSubmitting(true);

      const orderData = {
        ...data,
        total: total.toString(),
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        couponId: appliedCoupon?.id,
        couponDiscount: discount.toFixed(2),
      };

      const response = await apiRequest("POST", "/api/orders", orderData);
      const order = await response.json();

      // Clear the cart
      clearCart();

      // Invalidate orders query to refetch orders list
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });

      toast({
        title: "Order Placed Successfully",
        description: `Order #${order.id} has been placed. Thank you for your purchase!`,
      });

      // Redirect to order confirmation page
      navigate(`/account/orders/${order.id}`);
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Failed",
        description: "There was a problem processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="shippingAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="shippingCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shippingState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shippingZip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="ZIP Code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div>
                  <Label>Payment Method</Label>
                  <div className="mt-2 bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600">
                      This is a demo store. No actual payment will be processed.
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Your order will be placed with a simulated payment.
                    </p>
                  </div>
                </div>

                <div className="mt-4 lg:hidden">
                  <OrderSummary />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:block">
        <OrderSummary />
      </div>
    </div>
  );
}
