import React, { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { AccountDetails } from "@/components/account/AccountDetails";
import { OrderHistory } from "@/components/account/OrderHistory";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle, ShoppingBag, LogOut } from "lucide-react";

export default function AccountPage() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await logout();
    }
  };
  
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
                Please log in to your account to view your profile.
              </p>
              <Link href="/login?redirect=/account">
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
  
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-2xl font-bold">My Account</h1>
            <Button 
              variant="outline" 
              className="mt-2 sm:mt-0" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Account Navigation */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5" />
                    {user?.username}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    <Link href="/account">
                      <a className={`flex items-center px-4 py-2 text-sm transition-colors ${activeTab === "profile" ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                        onClick={() => setActiveTab("profile")}
                      >
                        <UserCircle className="h-4 w-4 mr-3" />
                        Profile
                      </a>
                    </Link>
                    <Link href="/account/orders">
                      <a className={`flex items-center px-4 py-2 text-sm transition-colors ${activeTab === "orders" ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                        onClick={() => setActiveTab("orders")}
                      >
                        <ShoppingBag className="h-4 w-4 mr-3" />
                        Orders
                      </a>
                    </Link>
                  </nav>
                </CardContent>
                <CardFooter className="border-t">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-600 hover:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Account Content */}
            <div className="lg:col-span-3 space-y-6">
              <AccountDetails />
              
              <div className="hidden md:block">
                <OrderHistory />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
