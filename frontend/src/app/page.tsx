'use client';

import React, { useState, useEffect } from 'react';
import { Event, TicketTier, RegistrationCart, CartItem, TicketConfirmation } from '@/types';
import { Navbar } from '@/components/Navbar';
import { ChatSection } from '@/components/ChatSection';
import { EventCard } from '@/components/EventCard';
import { CartDrawer } from '@/components/CartDrawer';
import { RegistrationConfirmationModal } from '@/components/RegistrationConfirmationModal';
import {
  Calendar,
  Ticket,
  Search,
  GraduationCap,
  QrCode,
  Download,
} from 'lucide-react';

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [activeTab, setActiveTab] = useState<'discovery' | 'cart' | 'tickets'>('discovery');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Cart State
  const [cart, setCart] = useState<RegistrationCart>({
    items: [],
    totalCents: 0,
    currency: 'USD',
  });

  // Confirmed Orders State
  const [confirmedTickets, setConfirmedTickets] = useState<TicketConfirmation[]>([]);
  const [activeConfirmationModal, setActiveConfirmationModal] = useState<TicketConfirmation | null>(null);

  // Fetch events on mount
  useEffect(() => {
    async function loadEvents() {
      try {
        setIsLoadingEvents(true);
        const res = await fetch('/api/events');
        const data = await res.json();
        if (data.events) {
          setEvents(data.events);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setIsLoadingEvents(false);
      }
    }
    loadEvents();
  }, []);

  // Cart operations
  const recalculateCart = (items: CartItem[], targetBudgetCents?: number, notes?: string): RegistrationCart => {
    const totalCents = items.reduce(
      (sum, item) => sum + item.tier.price_cents * (item.quantity || 1),
      0
    );
    return {
      items,
      totalCents,
      currency: 'USD',
      targetBudgetCents,
      notes,
    };
  };

  const handleAddToCart = (event: Event, tier: TicketTier) => {
    setCart((prev) => {
      const existingIdx = prev.items.findIndex(
        (it) => it.event.id === event.id && it.tier.id === tier.id
      );
      let updatedItems = [...prev.items];
      if (existingIdx >= 0) {
        updatedItems[existingIdx].quantity = (updatedItems[existingIdx].quantity || 1) + 1;
      } else {
        updatedItems.push({
          event,
          tier,
          quantity: 1,
          attendeeName: 'Maya Chen',
          attendeeEmail: 'maya.chen@stanford.edu',
        });
      }
      return recalculateCart(updatedItems, prev.targetBudgetCents, prev.notes);
    });
  };

  const handleProposeCart = (proposedCart: RegistrationCart) => {
    setCart(proposedCart);
    setActiveTab('cart');
  };

  const handleUpdateQuantity = (eventId: string, tierId: string, delta: number) => {
    setCart((prev) => {
      const updated = prev.items
        .map((it) => {
          if (it.event.id === eventId && it.tier.id === tierId) {
            const newQty = (it.quantity || 1) + delta;
            return newQty > 0 ? { ...it, quantity: newQty } : null;
          }
          return it;
        })
        .filter(Boolean) as CartItem[];
      return recalculateCart(updated, prev.targetBudgetCents, prev.notes);
    });
  };

  const handleRemoveItem = (eventId: string, tierId: string) => {
    setCart((prev) => {
      const updated = prev.items.filter(
        (it) => !(it.event.id === eventId && it.tier.id === tierId)
      );
      return recalculateCart(updated, prev.targetBudgetCents, prev.notes);
    });
  };

  const handleClearCart = () => {
    setCart({
      items: [],
      totalCents: 0,
      currency: 'USD',
    });
  };

  const handlePaymentSuccess = (confirmation: TicketConfirmation) => {
    setConfirmedTickets((prev) => [confirmation, ...prev]);
    setActiveConfirmationModal(confirmation);
    handleClearCart();
    setActiveTab('tickets');
  };

  // Filter events
  const filteredEvents = events.filter((ev) => {
    const matchesCat =
      categoryFilter === 'All' ||
      ev.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesKw =
      !searchKeyword ||
      ev.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesCat && matchesKw;
  });

  const categories = ['All', 'Workshop', 'Meetup', 'Seminar'];

  const allConfirmedItemCount = confirmedTickets.reduce(
    (acc, c) => acc + c.items.length,
    0
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#2C2E2F] flex flex-col">
      {/* Top Navbar */}
      <Navbar
        cart={cart}
        onOpenCart={() => setActiveTab('cart')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        confirmedTicketsCount={allConfirmedItemCount}
      />

      {/* Hero Subheader - Clean PayPal White Card style */}
      <section className="border-b border-[#E1E7EB] bg-white py-6">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F5F7FA] px-3 py-1 text-xs font-semibold text-[#003087] border border-[#E1E7EB] mb-2">
                <GraduationCap className="h-3.5 w-3.5 text-[#003087]" strokeWidth={1.5} />
                <span>Students · University Events · AI Budget Concierge</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#2C2E2F]">
                Discover Events & Register with PayPal
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#6C7378] max-w-2xl leading-relaxed">
                Tell EventMate your weekend plans and ticket budget. The AI reasons over event dates, student discount tiers, and builds your instant checkout cart.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-card border border-[#E1E7EB] bg-[#F5F7FA] p-3 text-xs shadow-paypal-sm">
                <span className="text-[#6C7378] block text-[11px] font-medium">Primary Demo Query</span>
                <span className="font-semibold text-[#003087]">
                  "Find me two AI workshops this weekend, with a total ticket budget of $40."
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Split Workspace */}
      <main className="flex-1 mx-auto w-full max-w-[1200px] px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: AI Concierge Assistant */}
          <div className="lg:col-span-5 w-full">
            <ChatSection
              onProposeCart={handleProposeCart}
              onAddToCart={handleAddToCart}
              onViewCart={() => setActiveTab('cart')}
            />
          </div>

          {/* Right Column: Dynamic Panes (Discovery, Cart Checkout, Confirmed Tickets) */}
          <div className="lg:col-span-7 w-full space-y-5">
            {/* View Tab Selector - Underline Style */}
            <div className="flex items-center justify-between border-b border-[#E1E7EB]">
              <div className="flex items-center space-x-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('discovery')}
                  className={`flex items-center space-x-2 py-3 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'discovery'
                      ? 'border-[#0070BA] text-[#0070BA]'
                      : 'border-transparent text-[#6C7378] hover:text-[#2C2E2F]'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>University Events ({events.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('cart')}
                  className={`flex items-center space-x-2 py-3 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'cart'
                      ? 'border-[#0070BA] text-[#0070BA]'
                      : 'border-transparent text-[#6C7378] hover:text-[#2C2E2F]'
                  }`}
                >
                  <span>Checkout Cart</span>
                  {cart.items.length > 0 && (
                    <span className="rounded-full bg-[#E1E7EB] px-2 py-0.5 text-[10px] font-semibold text-[#2C2E2F]">
                      {cart.items.length} · ${(cart.totalCents / 100).toFixed(2)}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('tickets')}
                  className={`flex items-center space-x-2 py-3 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'tickets'
                      ? 'border-[#0070BA] text-[#0070BA]'
                      : 'border-transparent text-[#6C7378] hover:text-[#2C2E2F]'
                  }`}
                >
                  <Ticket className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>My Passes</span>
                  {allConfirmedItemCount > 0 && (
                    <span className="rounded-full bg-[#E1E7EB] px-2 py-0.5 text-[10px] font-semibold text-[#2C2E2F]">
                      {allConfirmedItemCount}
                    </span>
                  )}
                </button>
              </div>

              {activeTab === 'discovery' && (
                <div className="hidden sm:flex items-center space-x-1.5 text-xs text-[#6C7378]">
                  <span className="h-2 w-2 rounded-full bg-[#0B7A3E]" />
                  <span>Seeded DB Active</span>
                </div>
              )}
            </div>

            {/* TAB 1: Discovery Catalog */}
            {activeTab === 'discovery' && (
              <div className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#6C7378]" strokeWidth={1.5} />
                    <input
                      type="text"
                      placeholder="Search events, topics..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="w-full rounded-full border border-[#CBD2D6] bg-white pl-8 pr-3 py-1.5 text-xs text-[#2C2E2F] placeholder-[#6C7378] focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA] min-h-[38px]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          categoryFilter === cat
                            ? 'bg-[#0070BA] text-white font-semibold shadow-paypal-sm'
                            : 'bg-white text-[#6C7378] hover:text-[#2C2E2F] border border-[#CBD2D6]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Event Cards Grid */}
                {isLoadingEvents ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="h-64 rounded-card border border-[#E1E7EB] bg-white animate-pulse"
                      />
                    ))}
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="rounded-card border border-[#E1E7EB] bg-white p-8 text-center text-xs text-[#6C7378] shadow-paypal-sm">
                    No events match your current filter. Try searching for "AI" or clearing filters.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredEvents.map((event) => {
                      const isAdded = cart.items.some((it) => it.event.id === event.id);
                      return (
                        <EventCard
                          key={event.id}
                          event={event}
                          onAddToCart={handleAddToCart}
                          isAdded={isAdded}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Cart & PayPal Checkout */}
            {activeTab === 'cart' && (
              <CartDrawer
                cart={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
                onPaymentSuccess={handlePaymentSuccess}
              />
            )}

            {/* TAB 3: Confirmed Passes */}
            {activeTab === 'tickets' && (
              <div className="space-y-4">
                {confirmedTickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center rounded-card border border-[#E1E7EB] bg-white shadow-paypal-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F7FA] text-[#6C7378] mb-3 border border-[#E1E7EB]">
                      <Ticket className="h-6 w-6" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-base font-semibold text-[#2C2E2F]">No Confirmed Passes Yet</h3>
                    <p className="mt-1 text-xs text-[#6C7378] max-w-xs">
                      When you complete registration with PayPal, your digital tickets and pass codes will appear here!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[#2C2E2F]">
                        Your Confirmed University Passes ({allConfirmedItemCount})
                      </h3>
                      <button
                        onClick={() => window.print()}
                        className="flex items-center space-x-1.5 text-xs text-[#0070BA] hover:text-[#005EA6] font-semibold"
                      >
                        <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                        <span>Print All</span>
                      </button>
                    </div>

                    {confirmedTickets.map((conf, orderIdx) => (
                      <div
                        key={conf.orderId + orderIdx}
                        className="rounded-card border border-[#E1E7EB] bg-white p-5 space-y-4 shadow-paypal-sm"
                      >
                        <div className="flex items-center justify-between border-b border-[#E1E7EB] pb-3 text-xs">
                          <div>
                            <span className="text-[#6C7378]">Order ID: </span>
                            <span className="font-mono font-semibold text-[#003087]">{conf.orderId}</span>
                          </div>
                          <span className="rounded-full bg-[#E8F5EC] px-2.5 py-0.5 text-[#0B7A3E] font-semibold border border-[#0B7A3E]/20">
                            Paid ${(conf.totalPaid / 100).toFixed(2)} USD
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {conf.items.map((item, itemIdx) => (
                            <div
                              key={itemIdx}
                              className="flex items-center justify-between rounded-lg bg-[#F5F7FA] p-3 border border-[#E1E7EB]"
                            >
                              <div className="space-y-1">
                                <span className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-[#6C7378] border border-[#E1E7EB]">
                                  {item.tierName}
                                </span>
                                <h4 className="text-xs font-semibold text-[#2C2E2F]">{item.eventTitle}</h4>
                                <p className="text-[11px] text-[#6C7378]">
                                  {item.venue}, {item.city}
                                </p>
                              </div>

                              <div className="flex items-center space-x-3 shrink-0">
                                <div className="text-right">
                                  <span className="block text-[10px] text-[#6C7378]">Pass Code</span>
                                  <span className="font-mono text-xs font-bold text-[#003087]">
                                    {item.ticketNumber}
                                  </span>
                                </div>
                                <div className="h-10 w-10 bg-white rounded border border-[#E1E7EB] flex items-center justify-center p-0.5 text-[#2C2E2F]">
                                  <QrCode className="h-8 w-8" strokeWidth={1.5} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <RegistrationConfirmationModal
        confirmation={activeConfirmationModal}
        onClose={() => setActiveConfirmationModal(null)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E1E7EB] bg-white py-4 text-center text-xs text-[#6C7378]">
        <div className="mx-auto max-w-[1200px] px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EventMate — AI Event Budget & Registration Agent</span>
          <span>Powered by OpenAI & PayPal Orders API / Checkout SDK</span>
        </div>
      </footer>
    </div>
  );
}
