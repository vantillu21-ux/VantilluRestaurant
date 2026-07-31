'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Calendar, ChefHat, Info, Sparkles, Users } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const { cart, isCartOpen, setIsCartOpen } = useCart();

  useEffect(() => {
    const isIframe = window.self !== window.top;
    const token = localStorage.getItem('vantillu_admin_token');
    if (isIframe && token) {
      setIsAdmin(true);
    }
  }, []);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { id: '/', label: 'Home', icon: ChefHat },
    { id: '/menu', label: 'Menu Catalog', icon: Sparkles },
    { id: '/reserve', label: 'Book Table', icon: Calendar },
    { id: '/party', label: 'Party catering', icon: Users },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#2E1A1C]/90 backdrop-blur-md border-b border-brand-gold/15 py-4 px-6 md:px-12 flex justify-between items-center shadow-lg">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <ChefHat className="text-brand-gold group-hover:scale-110 transition-transform duration-300" size={24} />
          <div>
            <h1 className="font-serif text-brand-gold font-bold text-lg md:text-xl tracking-widest leading-none">
              VANTILLU
            </h1>
            <span className="text-[7px] text-white/50 uppercase tracking-[0.4em] block mt-0.5">
              Traditional Multi-Cuisine
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.id;
            return (
              <Link
                key={link.id}
                href={link.id}
                className={`
                  relative flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300
                  ${isActive ? 'text-brand-gold font-bold' : 'text-white/60 hover:text-brand-gold'}
                `}
              >
                <Icon size={14} className="text-brand-gold" />
                <span className="font-serif">{link.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavLine"
                    className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-gold"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* Table reservation Quick CTA (Desktop Only) */}
          <Link
            href="/reserve"
            className="hidden sm:flex bg-brand-gold/10 border border-brand-gold hover:bg-brand-gold hover:text-brand-brown text-brand-gold py-2 px-4 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 active:scale-95"
          >
            Book Table
          </Link>

          {/* Cart Button Trigger */}
          {!isAdmin && (
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative bg-brand-blue hover:bg-brand-blue/90 border border-brand-gold text-white py-2 px-4 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all duration-300 active:scale-95 cursor-pointer shadow-[0_4px_12px_rgba(21,59,114,0.3)]"
            >
              <ShoppingBag size={14} className="text-brand-gold" />
              <span className="hidden sm:inline">Cart</span>
              {cartItemsCount > 0 && (
                <span className="bg-brand-orange text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono animate-pulse">
                  {cartItemsCount}
                </span>
              )}
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-white hover:text-brand-gold cursor-pointer"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-[65px] z-30 bg-[#2E1A1C] border-b border-brand-gold/25 p-6 shadow-2xl flex flex-col gap-4 lg:hidden"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.id;
              return (
                <Link
                  key={link.id}
                  href={link.id}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all
                    ${isActive 
                      ? 'bg-brand-gold text-brand-brown border-brand-gold' 
                      : 'bg-black/20 text-white/70 border-white/5 hover:border-brand-gold/40 hover:text-brand-gold'}
                  `}
                >
                  <Icon size={16} />
                  <span className="font-serif">{link.label}</span>
                </Link>
              );
            })}

            {/* Book Table Mobile CTA */}
            <Link
              href="/reserve"
              onClick={() => setIsOpen(false)}
              className="bg-brand-blue border border-brand-gold hover:bg-brand-blue/90 text-white text-center py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md"
            >
              Book Table
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
