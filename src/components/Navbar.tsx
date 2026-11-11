'use client';

import React from 'react';
import { Sparkles, Calendar, ShoppingBag, ShieldCheck, Ticket } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white">EventMate</span>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-400 border border-indigo-500/20">
                AI Concierge
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Student Events & Budget Registration</p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <div className="hidden md:flex items-center space-x-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('discovery')}
            className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'discovery'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Discover Events</span>
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'cart'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Registration Cart</span>
            {itemCount > 0 && (
              <span className="ml-1 rounded-full bg-emerald-400/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-400 border border-emerald-400/30">
                {itemCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'tickets'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ticket className="h-3.5 w-3.5" />
            <span>My Passes</span>
            {confirmedTicketsCount > 0 && (
              <span className="ml-1 rounded-full bg-amber-400/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-400 border border-amber-400/30">
                {confirmedTicketsCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Status & Action */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium">PayPal Sandbox</span>
          </div>

          <button
            onClick={onOpenCart}
            className="relative flex items-center space-x-2 rounded-xl bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
          >
            <ShoppingBag className="h-4 w-4 text-indigo-400" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 ? (
              <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[11px] font-bold text-white">
                ${(cart.totalCents / 100).toFixed(2)}
              </span>
            ) : (
              <span className="text-slate-500">$0.00</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
