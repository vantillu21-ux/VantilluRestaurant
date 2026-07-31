'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { CartDrawer } from './CartDrawer';
import { useCart } from '../context/CartContext';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const { isCartOpen, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const [isAdminUser, setIsAdminUser] = React.useState(false);

  React.useEffect(() => {
    const isIframe = window.self !== window.top;
    const token = localStorage.getItem('vantillu_admin_token');
    if (isIframe && token) {
      setIsAdminUser(true);
    }
  }, []);

  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <div className="min-h-full flex flex-col bg-[#0f0a0a]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col pt-16">
      {/* Global Top Navbar */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Global Shopping Cart Drawer */}
      {!isAdminUser && (
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      )}
    </div>
  );
};
