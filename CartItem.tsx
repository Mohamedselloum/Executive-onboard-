import React from "react";
import { Link } from "wouter";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Trash, Minus, Plus } from "lucide-react";

interface CartItemProps {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

export function CartItem({ id, name, price, image, quantity }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  
  const itemTotal = parseFloat(price) * quantity;
  
  const handleIncrement = () => {
    updateQuantity(id, quantity + 1);
  };
  
  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(id, quantity - 1);
    } else {
      removeItem(id);
    }
  };
  
  const handleRemove = () => {
    removeItem(id);
  };
  
  return (
    <div className="flex items-start py-4 border-b last:border-b-0">
      {/* Product Image */}
      <Link href={`/products/${id}`}>
        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100 cursor-pointer">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover object-center"
          />
        </div>
      </Link>
      
      {/* Product Details */}
      <div className="ml-4 flex flex-1 flex-col">
        <div className="flex justify-between">
          <div>
            <Link href={`/products/${id}`}>
              <h3 className="text-base font-medium text-gray-900 hover:text-primary cursor-pointer">
                {name}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-gray-500">${parseFloat(price).toFixed(2)}</p>
          </div>
          <p className="text-sm font-medium text-gray-900">
            ${itemTotal.toFixed(2)}
          </p>
        </div>
        
        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-l-md"
              onClick={handleDecrement}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="px-3 py-1 text-center w-10 text-sm">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-r-md"
              onClick={handleIncrement}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-gray-500 hover:text-red-500"
          >
            <Trash className="h-4 w-4 mr-1" />
            <span className="text-xs">Remove</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
