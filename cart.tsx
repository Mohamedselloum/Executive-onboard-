import React from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const { items, clearCart } = useCart();
  
  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to empty your cart?")) {
      clearCart();
    }
  };
  
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Your Shopping Cart</h1>
          
          {items.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="mx-auto w-20 h-20 flex items-center justify-center bg-gray-100 rounded-full mb-4">
                <ShoppingBag className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">
                Looks like you haven't added any products to your cart yet.
              </p>
              <Link href="/products">
                <Button>Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Cart Items ({items.length})</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleClearCart}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      Clear Cart
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {items.map(item => (
                        <CartItem
                          key={item.id}
                          id={item.id}
                          name={item.name}
                          price={item.price}
                          image={item.image}
                          quantity={item.quantity}
                        />
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Link href="/products">
                      <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Continue Shopping
                      </Button>
                    </Link>
                    <Link href="/checkout">
                      <Button>
                        Proceed to Checkout
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
              
              {/* Cart Summary */}
              <div>
                <CartSummary />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
