import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useMobile } from "@/hooks/use-mobile";

interface CategoryItem {
  id: number;
  name: string;
}

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMobile();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setMobileMenuOpen(false);
    }
  };
  
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  
  // Fetch categories
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    
    fetchCategories();
  }, []);
  
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
              Mercatus
            </Link>
          </div>
          
          {/* Search bar - desktop */}
          {!isMobile && (
            <div className="w-full max-w-md mx-4">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="search"
                  placeholder="Search for products..."
                  className="w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button 
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
          
          {/* Navigation - desktop */}
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-primary">
                All Products
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/account" className="text-sm font-medium text-gray-700 hover:text-primary">
                    My Account
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => logout()}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-primary">
                    Login
                  </Link>
                  <Link href="/register">
                    <Button variant="secondary" size="sm">
                      Register
                    </Button>
                  </Link>
                </>
              )}
              <Link href="/cart">
                <Button variant="outline" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[1.25rem] text-xs flex items-center justify-center"
                    >
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>
            </nav>
          )}
          
          {/* Mobile menu button */}
          {isMobile && (
            <div className="flex items-center gap-4">
              <Link href="/cart">
                <Button variant="outline" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[1.25rem] text-xs flex items-center justify-center"
                    >
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[80vw] sm:w-[350px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="absolute right-4 top-4">
                        <X className="h-4 w-4" />
                      </Button>
                    </SheetClose>
                  </SheetHeader>
                  
                  {/* Mobile search */}
                  <div className="py-4">
                    <form onSubmit={handleSearch} className="relative">
                      <Input
                        type="search"
                        placeholder="Search for products..."
                        className="w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Button 
                        type="submit"
                        size="icon"
                        variant="ghost"
                        className="absolute right-0 top-0 h-full"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                  
                  <nav className="flex flex-col space-y-3 mt-2">
                    <SheetClose asChild>
                      <Link href="/" className="text-base font-medium text-gray-700 hover:text-primary">
                        Home
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/products" className="text-base font-medium text-gray-700 hover:text-primary">
                        All Products
                      </Link>
                    </SheetClose>
                    
                    <Separator />
                    
                    <p className="text-sm font-semibold text-gray-500">Categories</p>
                    {categories.map(category => (
                      <SheetClose key={category.id} asChild>
                        <Link 
                          href={`/products?categoryId=${category.id}`} 
                          onClick={(e) => {
                            setMobileMenuOpen(false);
                            // Force navigation by setting window.location directly
                            window.location.href = `/products?categoryId=${category.id}`;
                            e.preventDefault(); // Prevent default to ensure our direct navigation happens
                          }} 
                          className="text-base font-medium text-gray-700 hover:text-primary pl-2"
                        >
                          {category.name}
                        </Link>
                      </SheetClose>
                    ))}
                    
                    <Separator />
                    
                    {isAuthenticated ? (
                      <>
                        <SheetClose asChild>
                          <Link href="/account" className="text-base font-medium text-gray-700 hover:text-primary">
                            My Account
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/account/orders" className="text-base font-medium text-gray-700 hover:text-primary">
                            My Orders
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => logout()}
                          >
                            Logout
                          </Button>
                        </SheetClose>
                      </>
                    ) : (
                      <>
                        <SheetClose asChild>
                          <Link href="/login" className="text-base font-medium text-gray-700 hover:text-primary">
                            Login
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/register">
                            <Button variant="secondary" className="w-full">
                              Register
                            </Button>
                          </Link>
                        </SheetClose>
                      </>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
        
        {/* Categories navigation - desktop */}
        {!isMobile && (
          <div className="hidden md:flex items-center h-10 px-2 space-x-1 overflow-x-auto scroll-container">
            {categories.map(category => (
              <Link 
                key={category.id} 
                href={`/products?categoryId=${category.id}`}
                className="text-sm font-medium text-gray-600 hover:text-primary transition-colors duration-200 whitespace-nowrap px-3 py-1 rounded-full hover:bg-gray-100"
                onClick={() => {
                  // Force navigation by setting window.location directly
                  // This is used as a fallback to ensure category navigation works
                  window.location.href = `/products?categoryId=${category.id}`;
                }}
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
