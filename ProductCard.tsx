import React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Tag, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  id: number;
  name: string;
  price: string;
  compareAtPrice?: string | null;
  image: string;
  isDropshipped: boolean;
  categoryId: number;
  category?: {
    name: string;
  };
}

export function ProductCard({ id, name, price, compareAtPrice, image, isDropshipped, categoryId, category }: ProductCardProps) {
  const { addItem } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id,
      name,
      price,
      image,
      quantity: 1
    });
  };
  
  // Calculate discount percentage if there's a compare at price
  const discountPercentage = compareAtPrice 
    ? Math.round(((parseFloat(compareAtPrice) - parseFloat(price)) / parseFloat(compareAtPrice)) * 100)
    : 0;
  
  return (
    <Link href={`/products/${id}`}>
      <Card className="overflow-hidden h-full hover:shadow-md transition-shadow group border">
        <div className="relative h-48 overflow-hidden bg-gray-100">
          {/* Product Image */}
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isDropshipped && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                <Tag className="h-3 w-3 mr-1" /> Drop Ship
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge variant="destructive">
                {discountPercentage}% OFF
              </Badge>
            )}
          </div>
        </div>
        
        <CardContent className="p-4">
          {/* Category */}
          {category && (
            <p className="text-xs text-gray-500 mb-1">{category.name}</p>
          )}
          
          {/* Product Name */}
          <h3 className="text-sm font-medium line-clamp-2 mb-1 group-hover:text-primary transition-colors">{name}</h3>
          
          {/* Price */}
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-gray-900">${parseFloat(price).toFixed(2)}</span>
            {compareAtPrice && (
              <span className="text-sm text-gray-500 line-through">${parseFloat(compareAtPrice).toFixed(2)}</span>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <Button 
            onClick={handleAddToCart} 
            className="w-full"
            variant="outline"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
