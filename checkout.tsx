import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export default function CheckoutPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { items } = useCart();

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">Loading...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Login Required</h1>
              <p className="text-gray-600 mb-6">
                Please log in to your account to proceed with checkout.
              </p>
              <Link href="/login?redirect=/checkout">
                <Button className="w-full">Log In</Button>
              </Link>
              <p className="mt-4 text-sm text-gray-500">
                Don't have an account?{" "}
                <Link href="/register">
                  <a className="text-primary hover:underline">Register</a>
                </Link>
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="mx-auto w-20 h-20 flex items-center justify-center bg-gray-100 rounded-full mb-4">
                <ShoppingBag className="h-10 w-10 text-gray-400" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
              <p className="text-gray-600 mb-6">
                You need to add items to your cart before proceeding to checkout.
              </p>
              <Link href="/products">
                <Button className="w-full">Browse Products</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>
          <CheckoutForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
