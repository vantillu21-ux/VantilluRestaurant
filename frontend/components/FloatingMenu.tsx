'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  UtensilsCrossed, 
  BookOpen, 
  Sparkles, 
  Image, 
  Users, 
  Star, 
  Phone,
  Menu,
  X
} from 'lucide-react';

interface FloatingMenuProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const FloatingMenu: React.FC<FloatingMenuProps> = ({ activeSection, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'hero', label: 'Home', icon: Home },
    { id: 'specials', label: 'Specials', icon: Sparkles },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'about', label: 'About Story', icon: BookOpen },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'party', label: 'Party Orders', icon: Users },
    { id: 'contact', label: 'Contact Us', icon: Phone },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="fixed top-6 left-6 z-[60] lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-brand-brown border border-brand-gold/40 text-brand-gold p-3 rounded-full shadow-lg backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation Container */}
      <nav className={`
        fixed z-[50] transition-all duration-500
        lg:left-8 lg:top-1/2 lg:-translate-y-1/2 lg:block
        ${isOpen ? 'left-6 top-20 block' : 'left-[-250px] top-20 hidden lg:block'}
      `}>
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-[#2E1A1C]/85 border-2 border-brand-gold/30 rounded-2xl md:rounded-3xl p-3 md:p-4 flex flex-col gap-2 md:gap-3 shadow-2xl backdrop-blur-md max-w-[200px] lg:max-w-none max-h-[80vh] overflow-y-auto overflow-x-hidden custom-scrollbar"
        >
          {/* Menu Title (Left aligned) */}
          <div className="hidden lg:block text-center mb-2">
            <span className="text-[9px] uppercase tracking-[0.25em] text-brand-gold font-bold">Vantillu</span>
            <div className="w-8 h-[1px] bg-brand-gold/40 mx-auto mt-1" />
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsOpen(false);
                }}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-left transition-all duration-300 w-full group
                  ${isActive ? 'text-brand-brown font-bold' : 'text-white/60 hover:text-brand-gold'}
                `}
              >
                {/* Background sliding capsule (Active state) */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-brand-gold rounded-xl -z-10 shadow-[0_4px_12px_rgba(212,175,55,0.3)]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Animated Icon */}
                <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-brand-brown' : 'text-brand-gold'}`}>
                  <Icon size={18} />
                </span>

                {/* Text Label */}
                <span className="text-xs uppercase tracking-widest font-semibold font-serif">
                  {item.label}
                </span>

                {/* Subtle outer dot hover animation */}
                {!isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-brand-gold/0 scale-0 group-hover:bg-brand-gold/40 group-hover:scale-100 transition-all duration-300" />
                )}
              </button>
            );
          })}
        </motion.div>
      </nav>

      {/* Screen Backdrop for Mobile when Open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[45] bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
};
