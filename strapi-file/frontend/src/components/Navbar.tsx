'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Phone, Menu, X, Globe } from 'lucide-react';
import { useCart } from '../lib/CartContext';
import { api } from '../lib/api';
import { SiteSetting } from '../lib/types';

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [siteSetting, setSiteSetting] = useState<SiteSetting | null>(null);

  // Fetch site settings on mount
  useEffect(() => {
    api.getSiteSetting().then((data) => {
      if (data) setSiteSetting(data);
    }).catch(console.error);
  }, []);

  const navLinks = [
    { name: 'Trang Chủ', href: '/' },
    { name: 'Sản Phẩm', href: '/products' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 transition-all duration-300">
      {/* Top Banner Contact */}
      <div className="bg-neutral-900 text-white py-1.5 px-4 text-xs font-medium flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-neutral-400" />
          <span>Hotline: </span>
          <a href={`tel:${siteSetting?.hotline || '0901234567'}`} className="hover:text-emerald-400 transition-colors">
            {siteSetting?.hotline || '090.123.4567'}
          </a>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-neutral-300">
          <span>Giao hàng toàn quốc nhanh chóng</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-neutral-950 uppercase">
                {siteSetting?.siteName || 'AURA Studio'}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold tracking-wide transition-colors uppercase ${
                    isActive
                      ? 'text-neutral-950 border-b-2 border-neutral-950 pb-1'
                      : 'text-neutral-500 hover:text-neutral-900 pb-1'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/cart"
              className="relative p-2 text-neutral-800 hover:text-neutral-950 transition-colors flex items-center"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6 stroke-[1.8]" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-2xs font-extrabold leading-none text-white bg-emerald-500 rounded-full animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-neutral-100 shadow-xl transition-all duration-300">
          <div className="px-4 pt-2 pb-6 space-y-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block py-3 px-4 rounded-xl text-sm font-bold tracking-wide transition-all ${
                    isActive
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="border-t border-neutral-100 pt-4 px-4 flex items-center justify-between text-xs text-neutral-500 font-semibold">
              <span>Zalo hỗ trợ: {siteSetting?.zalo || '0901234567'}</span>
              <Globe className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}