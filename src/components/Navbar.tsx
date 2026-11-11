'use client';

import React from 'react';
import { Calendar, ShoppingBag, ShieldCheck, Ticket } from 'lucide-react';
import { RegistrationCart } from '@/types';

interface NavbarProps {
  cart: RegistrationCart;
  onOpenCart: () => void;
  activeTab: 'discovery' | 'cart' | 'tickets';
  setActiveTab: (tab: 'discovery' | 'cart' | 'tickets') => void;
  confirmedTicketsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  cart,
  onOpenCart,
  activeTab,
  setActiveTab,
  confirmedTicketsCount,
}) => {
  const itemCount = cart.items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E1E7EB] bg-white">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#003087] text-white shadow-paypal-sm">
            <span className="text-base font-bold tracking-tight">P</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold tracking-tight text-[#003087]">EventMate</span>
              <span className="rounded-full bg-[#F5F7FA] px-2 py-0.5 text-[11px] font-medium text-[#6C7378] border border-[#E1E7EB]">
                AI Concierge
              </span>
            </div>
            <p className="text-[11px] text-[#6C7378]">Student Events & Budget Registration</p>
          </div>
        </div>

        {/* Center Navigation Tabs - Underline Style */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center space-x-6 h-full">
          <button
            onClick={() => setActiveTab('discovery')}
            className={`relative flex items-center space-x-2 h-16 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'discovery'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-[#6C7378] hover:text-[#2C2E2F]'
            }`}
          >
            <Calendar className="h-4 w-4" strokeWidth={1.5} />
            <span>Discover Events</span>
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className={`relative flex items-center space-x-2 h-16 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'cart'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-[#6C7378] hover:text-[#2C2E2F]'
            }`}
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            <span>Registration Cart</span>
            {itemCount > 0 && (
              <span className="rounded-full bg-[#E1E7EB] px-1.5 py-0.2 text-[10px] font-semibold text-[#2C2E2F]">
                {itemCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`relative flex items-center space-x-2 h-16 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'tickets'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-[#6C7378] hover:text-[#2C2E2F]'
            }`}
          >
            <Ticket className="h-4 w-4" strokeWidth={1.5} />
            <span>My Passes</span>
            {confirmedTicketsCount > 0 && (
              <span className="rounded-full bg-[#E1E7EB] px-1.5 py-0.2 text-[10px] font-semibold text-[#2C2E2F]">
                {confirmedTicketsCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Status & Action */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 rounded-full bg-[#F5F7FA] px-2.5 py-1 text-xs text-[#6C7378] border border-[#E1E7EB]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#6C7378]" strokeWidth={1.5} />
            <span className="text-[11px] font-medium">PayPal Sandbox</span>
          </div>

          <button
            onClick={onOpenCart}
            aria-label="View registration cart"
            className="flex items-center space-x-2 rounded-full border border-[#CBD2D6] bg-white px-3.5 py-1.5 text-xs font-medium text-[#2C2E2F] hover:bg-[#F5F7FA] transition-colors shadow-paypal-sm min-h-[38px]"
          >
            <ShoppingBag className="h-4 w-4 text-[#0070BA]" strokeWidth={1.5} />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 ? (
              <span className="rounded-full bg-[#0070BA] px-2 py-0.5 text-[11px] font-semibold text-white">
                ${(cart.totalCents / 100).toFixed(2)}
              </span>
            ) : (
              <span className="text-[#6C7378]">$0.00</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
