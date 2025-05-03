import React from "react";
import { Link } from "wouter";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, CreditCard, Truck, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-100 mt-16">
      {/* Features bar */}
      <div className="bg-gray-800 py-6">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-3 transition-transform duration-300 hover:scale-105">
              <div className="rounded-full bg-primary/10 p-3">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="text-sm font-medium">Free shipping</span>
                <p className="text-xs text-gray-400">On orders over $75</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 transition-transform duration-300 hover:scale-105">
              <div className="rounded-full bg-primary/10 p-3">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="text-sm font-medium">Secure payments</span>
                <p className="text-xs text-gray-400">Protected by encryption</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 transition-transform duration-300 hover:scale-105">
              <div className="rounded-full bg-primary/10 p-3">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="text-sm font-medium">Money-back guarantee</span>
                <p className="text-xs text-gray-400">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main footer content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">Mercatus</h3>
            <p className="text-sm text-gray-400 mb-6">
              Your one-stop shop for all your needs with direct shipping from our trusted suppliers.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Shop Links */}
          <div>
            <h3 className="text-md font-bold mb-4 text-white">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?categoryId=1" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/products?categoryId=2" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Clothing
                </Link>
              </li>
              <li>
                <Link href="/products?categoryId=3" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Home & Kitchen
                </Link>
              </li>
              <li>
                <Link href="/products?isDropshipped=true" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Dropshipped Items
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Account Links */}
          <div>
            <h3 className="text-md font-bold mb-4 text-white">Account</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/login" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Order History
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-md font-bold mb-4 text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-sm text-gray-400">123 Commerce St, Anytown, USA</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-sm text-gray-400">(555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-sm text-gray-400">support@mercatus.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="border-t border-gray-800 py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Mercatus. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
