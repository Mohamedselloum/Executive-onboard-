import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Tag, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Truck, 
  ShieldCheck, 
  RefreshCw 
} from "lucide-react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductDetailProps {
  productId: number;
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addItem } = useCart();
  
  const { data: product, isLoading, error } = useQuery({
    queryKey: [`/api/products/${productId}`]
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="h-96 w-full rounded-md" />
          <div className="flex space-x-2">
            <Skeleton className="h-20 w-20 rounded-md" />
            <Skeleton className="h-20 w-20 rounded-md" />
            <Skeleton className="h-20 w-20 rounded-md" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Product</CardTitle>
          <CardDescription>
            We couldn't load the product information. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const gallery = product.gallery ? JSON.parse(product.gallery) : [product.image];
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity
    });
  };

  // Calculate discount percentage if there's a compare at price
  const discountPercentage = product.compareAtPrice 
    ? Math.round(((parseFloat(product.compareAtPrice) - parseFloat(product.price)) / parseFloat(product.compareAtPrice)) * 100)
    : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="border rounded-lg overflow-hidden bg-white h-96 flex items-center justify-center">
          <img 
            src={gallery[activeImage]} 
            alt={product.name} 
            className="max-h-full max-w-full object-contain"
          />
        </div>
        
        {gallery.length > 1 && (
          <Carousel className="w-full">
            <CarouselContent className="h-20">
              {gallery.map((image: string, index: number) => (
                <CarouselItem key={index} className="basis-1/4 h-full">
                  <div 
                    className={`h-full border rounded-md p-1 cursor-pointer transition-all ${activeImage === index ? 'border-primary' : 'border-gray-200'}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} view ${index + 1}`} 
                      className="h-full w-full object-cover object-center rounded-sm"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        )}
      </div>
      
      {/* Product Info */}
      <div className="space-y-6">
        <div>
          {product.category && (
            <p className="text-sm text-gray-500 mb-1">{product.category.name}</p>
          )}
          <h1 className="text-2xl font-bold">{product.name}</h1>
          
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-2xl font-semibold">${parseFloat(product.price).toFixed(2)}</span>
            {product.compareAtPrice && (
              <>
                <span className="text-lg text-gray-500 line-through">${parseFloat(product.compareAtPrice).toFixed(2)}</span>
                <Badge variant="destructive">{discountPercentage}% OFF</Badge>
              </>
            )}
          </div>
        </div>
        
        {product.isDropshipped && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <Tag className="h-3.5 w-3.5 mr-1" /> Dropshipped Item
          </Badge>
        )}
        
        <p className="text-gray-700">{product.description}</p>
        
        {/* Quantity and Add to Cart */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="mx-4 text-lg font-medium w-8 text-center">{quantity}</span>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleQuantityChange(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <Button onClick={handleAddToCart} className="w-full md:w-auto" size="lg">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart
          </Button>
        </div>
        
        <Separator />
        
        {/* Product features */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-start space-x-3">
            <Truck className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Shipping Information</p>
              <p className="text-sm text-gray-600">
                {product.isDropshipped 
                  ? "Ships directly from supplier in 3-7 business days" 
                  : "In stock, ships within 1-2 business days"}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Satisfaction Guarantee</p>
              <p className="text-sm text-gray-600">30-day money-back guarantee</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <RefreshCw className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Return Policy</p>
              <p className="text-sm text-gray-600">Easy returns within 30 days of purchase</p>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Product tabs */}
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="returns">Returns</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="text-sm text-gray-700 space-y-2 pt-4">
            <p>
              {product.description}
            </p>
            <ul className="list-disc list-inside pl-4 pt-2">
              <li>High-quality materials</li>
              <li>Expert craftsmanship</li>
              <li>Designed for everyday use</li>
              <li>Satisfaction guaranteed</li>
            </ul>
          </TabsContent>
          <TabsContent value="shipping" className="text-sm text-gray-700 space-y-2 pt-4">
            {product.isDropshipped ? (
              <>
                <p>This item ships directly from our supplier partner.</p>
                <p>Estimated delivery time: 3-7 business days</p>
                <p>Shipping carrier will be selected by the supplier.</p>
                <p>Free shipping on orders over $75.</p>
              </>
            ) : (
              <>
                <p>This item ships from our warehouse.</p>
                <p>Estimated delivery time: 1-2 business days</p>
                <p>Standard and expedited shipping options available.</p>
                <p>Free shipping on orders over $75.</p>
              </>
            )}
          </TabsContent>
          <TabsContent value="returns" className="text-sm text-gray-700 space-y-2 pt-4">
            <p>We offer a 30-day money-back guarantee on all purchases.</p>
            <p>If you're not completely satisfied with your purchase, you can return it within 30 days for a full refund.</p>
            <p>Please note that items must be returned in their original condition and packaging.</p>
            <p>For dropshipped items, our customer service team will guide you through the return process.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
