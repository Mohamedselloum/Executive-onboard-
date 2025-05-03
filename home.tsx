import React, { useEffect } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OfferBanner } from "@/components/coupon/OfferBanner";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product/ProductCard";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// Define interfaces for type safety
interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
  createdAt?: string;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: string;
  compareAtPrice?: string | null;
  image: string;
  categoryId: number;
  isDropshipped: boolean;
  category?: {
    id: number;
    name: string;
  };
}

interface ProductsResponse {
  products: Product[];
  total: number;
}

export default function Home() {
  // Fetch featured products (most recent)
  const { data: featuredProductsResponse, isLoading: featuredLoading } = useQuery<ProductsResponse>({
    queryKey: ["/api/products?limit=8&sortBy=createdAt&sortDirection=desc"],
  });

  // Fetch featured categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Set up scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('appear');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '10px',
      }
    );
    
    // Observe all animatable elements
    const animatableElements = document.querySelectorAll('.fade-in-up');
    animatableElements.forEach(el => observer.observe(el));
    
    return () => {
      animatableElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  // Get products from the response
  const featuredProducts = featuredProductsResponse?.products || [];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Banner */}
        <section className="relative h-[600px] bg-gradient-to-r from-primary to-accent overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-accent/70 backdrop-blur-sm z-10"></div>
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
              alt="Mercatus Banner"
              className="w-full h-full object-cover object-center scale-105"
            />
          </div>
          <div className="container mx-auto px-6 h-full flex items-center relative z-20">
            <div className="max-w-2xl text-white">
              <div className="fade-in-up">
                <span className="inline-block text-sm font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-4">Premium Shopping Experience</span>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  Welcome to <span className="bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">Mercatus</span>
                </h1>
                <p className="text-xl mb-8 text-white/90 max-w-xl">
                  The ultimate destination for premium products shipped directly from our trusted suppliers.
                </p>
              </div>
              <div className="mb-6 fade-in-up" style={{ animationDelay: '0.2s' }}>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const searchInput = e.currentTarget.querySelector('input') as HTMLInputElement;
                  const searchTerm = searchInput.value.trim();
                  if (searchTerm) {
                    window.location.href = `/products?search=${encodeURIComponent(searchTerm)}`;
                  }
                }} className="flex w-full max-w-md">
                  <div className="relative flex-grow">
                    <input 
                      type="search" 
                      placeholder="Search for products..." 
                      className="w-full h-12 px-4 py-2 rounded-l-full bg-white/90 border-0 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </div>
                  <Button type="submit" size="lg" className="rounded-l-none rounded-r-full bg-gradient-to-r from-primary to-accent hover:opacity-90 border-0">
                    Search
                  </Button>
                </form>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Link href="/products">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
                    Shop Now
                  </Button>
                </Link>
                <Link href="/products?isDropshipped=true">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 backdrop-blur-sm">
                    Explore Dropshipped Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Special Offers Banner */}
        <section className="container mx-auto px-4 py-8">
          <OfferBanner />
        </section>

        {/* Featured Product Categories */}
        <section className="container mx-auto px-6 py-14">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text fade-in-up">Shop by Category</h2>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {categories && categories.slice(0, 4).map((category, index) => (
                <div
                  key={category.id}
                  className="fade-in-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <Link 
                    href={`/products?categoryId=${category.id}`}
                    className="relative h-40 overflow-hidden rounded-xl group shadow-md block"
                    onClick={(e) => {
                      // Force navigation by setting window.location directly
                      window.location.href = `/products?categoryId=${category.id}`;
                      e.preventDefault();
                    }}
                  >
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                        <span className="text-primary text-xl">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-5">
                      <h3 className="text-white text-lg font-medium">{category.name}</h3>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <Separator className="my-4" />

        {/* Featured Products */}
        <section className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 fade-in-up">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text mb-4 md:mb-0">Featured Products</h2>
            <Link href="/products" className="self-start md:self-auto">
              <Button variant="outline" className="rounded-full shadow-sm">
                View All Products
              </Button>
            </Link>
          </div>
          
          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-md" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-8 w-28" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts && featuredProducts.slice(0, 8).map((product, index) => (
                <div 
                  key={product.id} 
                  className="fade-in-up" 
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    compareAtPrice={product.compareAtPrice}
                    image={product.image}
                    isDropshipped={product.isDropshipped}
                    categoryId={product.categoryId}
                    category={product.category}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Benefits Section */}
        <section className="bg-gradient-to-b from-background to-gray-100 py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text fade-in-up">
              Why Shop With Mercatus
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-md text-center fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="relative">
                  <div className="h-20 w-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-20 w-20 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl transform rotate-6"></div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Premium Quality</h3>
                <p className="text-gray-600">We partner with trusted suppliers to ensure every product meets our rigorous quality standards.</p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-md text-center fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="relative">
                  <div className="h-20 w-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-20 w-20 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl transform rotate-6"></div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Express Delivery</h3>
                <p className="text-gray-600">Receive your orders quickly with our efficient dropshipping process, direct from suppliers when available.</p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-md text-center fade-in-up" style={{ animationDelay: '0.5s' }}>
                <div className="relative">
                  <div className="h-20 w-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-20 w-20 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl transform rotate-6"></div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Secure Transactions</h3>
                <p className="text-gray-600">Shop with confidence using our secure payment system and enjoy our 30-day hassle-free return policy.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Newsletter */}
        <section className="container mx-auto px-6 py-20">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-2xl p-10 relative overflow-hidden shadow-lg fade-in-up">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-b from-primary/20 to-accent/20 rounded-full blur-3xl -mr-32 -mt-32 opacity-70"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-t from-primary/20 to-accent/20 rounded-full blur-3xl -ml-32 -mb-32 opacity-70"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">Stay Updated</h2>
              <p className="text-gray-700 mb-8 max-w-xl mx-auto">
                Subscribe to our newsletter for the latest product updates, special offers, and exclusive discounts.
              </p>
              <div className="flex flex-col sm:flex-row max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full sm:flex-grow rounded-full sm:rounded-r-none border-0 px-5 py-3 shadow-md focus:outline-none focus:ring-2 focus:ring-primary mb-3 sm:mb-0"
                />
                <Button className="sm:rounded-l-none rounded-full font-medium px-6">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}