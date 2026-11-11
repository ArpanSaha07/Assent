'use client';

import React, { useState } from 'react';
import { RegistrationCart, CartItem, TicketConfirmation } from '@/types';
import { Trash2, ShoppingBag, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { PayPalButtons } from '@paypal/react-paypal-js';

interface CartDrawerProps {
  cart: RegistrationCart;
  onUpdateQuantity: (eventId: string, tierId: string, delta: number) => void;
  onRemoveItem: (eventId: string, tierId: string) => void;
  onClearCart: () => void;
  onPaymentSuccess: (confirmation: TicketConfirmation) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPaymentSuccess,
}) => {
  const [studentName, setStudentName] = useState('Maya Chen');
  const [studentEmail, setStudentEmail] = useState('maya.chen@stanford.edu');
  const [studentId, setStudentId] = useState('SU-2026-9481');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const totalAmountUsd = (cart.totalCents / 100).toFixed(2);
  const targetBudgetUsd = cart.targetBudgetCents ? (cart.targetBudgetCents / 100).toFixed(2) : null;

  // Handle Create PayPal Order
  const handleCreateOrder = async () => {
    setCheckoutError(null);
    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items,
          totalCents: cart.totalCents,
          studentInfo: { name: studentName, email: studentEmail, studentId },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create PayPal order');
      }
      return data.id;
    } catch (err: any) {
      setCheckoutError(err.message);
      throw err;
    }
  };

  // Handle Capture PayPal Order on Approval
  const handleApprove = async (data: any) => {
    setIsProcessing(true);
    setCheckoutError(null);
    try {
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderID: data.orderID,
          items: cart.items,
          studentInfo: { name: studentName, email: studentEmail, studentId },
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to capture PayPal order');
      }

      onPaymentSuccess(resData.confirmation);
    } catch (err: any) {
      setCheckoutError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Instant Mock/Sandbox Test Handler for quick evaluation
  const handleDirectDemoCheckout = async () => {
    setIsProcessing(true);
    setCheckoutError(null);
    try {
      const orderId = await handleCreateOrder();
      await handleApprove({ orderID: orderId });
    } catch (err: any) {
      setCheckoutError(err.message);
      setIsProcessing(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-card border border-[#E1E7EB] bg-white shadow-paypal-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F7FA] text-[#6C7378] mb-3 border border-[#E1E7EB]">
          <ShoppingBag className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-semibold text-[#2C2E2F]">Your Cart is Empty</h3>
        <p className="mt-1 text-xs text-[#6C7378] max-w-xs">
          Ask the AI concierge: "Find me two AI workshops this weekend, with a total ticket budget of $40." or add tickets manually!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-card border border-[#E1E7EB] bg-white p-6 shadow-paypal">
      {/* 1. Order Summary Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E1E7EB] pb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-[#2C2E2F]">Order Summary ({cart.items.length})</h3>
          </div>
          <button
            onClick={onClearCart}
            className="text-xs text-[#6C7378] hover:text-[#C72C2C] transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Budget Match Tracker */}
        {targetBudgetUsd && (
          <div className="rounded-lg border border-[#0B7A3E]/20 bg-[#E8F5EC] p-3 text-xs text-[#0B7A3E]">
            <div className="flex items-center justify-between mb-1.5 font-medium">
              <span className="text-[#0B7A3E] font-semibold">Stated Budget Target:</span>
              <span className="font-bold text-[#2C2E2F]">${targetBudgetUsd}</span>
            </div>
            <div className="w-full bg-[#CBD2D6]/40 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full ${
                  Number(totalAmountUsd) <= Number(targetBudgetUsd)
                    ? 'bg-[#0B7A3E]'
                    : 'bg-[#8A5A00]'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    (Number(totalAmountUsd) / Number(targetBudgetUsd)) * 100
                  )}%`,
                }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              <span className="text-[#6C7378]">Cart Total: ${totalAmountUsd}</span>
              {Number(totalAmountUsd) <= Number(targetBudgetUsd) ? (
                <span className="text-[#0B7A3E] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" strokeWidth={1.5} /> Within budget limit
                </span>
              ) : (
                <span className="text-[#8A5A00] font-semibold">Exceeds budget target</span>
              )}
            </div>
            {cart.notes && (
              <p className="mt-2 text-[11px] text-[#2C2E2F] italic border-t border-[#0B7A3E]/10 pt-1.5">
                "{cart.notes}"
              </p>
            )}
          </div>
        )}

        {/* Line Items List */}
        <div className="space-y-3 divide-y divide-[#E1E7EB]">
          {cart.items.map((item, idx) => (
            <div
              key={`${item.event.id}-${item.tier.id}-${idx}`}
              className="pt-3 first:pt-0 flex items-center justify-between gap-4"
            >
              <div className="space-y-0.5 flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-[#2C2E2F] truncate">
                  {item.event.title}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-[#6C7378]">
                  <span className="rounded bg-[#F5F7FA] px-1.5 py-0.5 border border-[#E1E7EB]">
                    {item.tier.name}
                  </span>
                  <span>${(item.tier.price_cents / 100).toFixed(2)} each</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <div className="flex items-center rounded-lg border border-[#CBD2D6] bg-white px-2 py-0.5 text-xs">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => onUpdateQuantity(item.event.id, item.tier.id, -1)}
                    className="px-1 text-[#6C7378] hover:text-[#2C2E2F]"
                  >
                    -
                  </button>
                  <span className="px-2 font-semibold text-[#2C2E2F]">{item.quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => onUpdateQuantity(item.event.id, item.tier.id, 1)}
                    className="px-1 text-[#6C7378] hover:text-[#2C2E2F]"
                  >
                    +
                  </button>
                </div>

                <span className="font-semibold text-xs text-[#2C2E2F] min-w-[50px] text-right">
                  ${((item.tier.price_cents * (item.quantity || 1)) / 100).toFixed(2)}
                </span>

                <button
                  type="button"
                  aria-label="Remove item"
                  onClick={() => onRemoveItem(item.event.id, item.tier.id)}
                  className="text-[#6C7378] hover:text-[#C72C2C] transition-colors p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Attendee Details Section */}
      <div className="space-y-3 border-t border-[#E1E7EB] pt-4">
        <h4 className="text-xs font-semibold text-[#2C2E2F] flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-[#0070BA]" strokeWidth={1.5} />
          <span>Student Attendee Details</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-[#6C7378] mb-1">Full Name</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full rounded-input border border-[#CBD2D6] bg-white px-3 py-2 text-xs text-[#2C2E2F] min-h-[44px] focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#6C7378] mb-1">University Email</label>
            <input
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              className="w-full rounded-input border border-[#CBD2D6] bg-white px-3 py-2 text-xs text-[#2C2E2F] min-h-[44px] focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]"
            />
          </div>
        </div>
      </div>

      {/* 3. Total & Payment Section */}
      <div className="space-y-4 border-t border-[#E1E7EB] pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-[#6C7378]">Total Registration Amount:</span>
          <span className="text-lg font-bold text-[#2C2E2F]">
            ${totalAmountUsd} USD
          </span>
        </div>

        {checkoutError && (
          <div className="rounded-lg border border-[#C72C2C]/20 bg-[#FDECEC] p-3 text-xs text-[#C72C2C] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#C72C2C]" strokeWidth={1.5} />
            <span>{checkoutError}</span>
          </div>
        )}

        {/* PayPal SDK Buttons */}
        <div className="relative pt-1">
          {isProcessing && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/85 text-xs font-semibold text-[#0070BA]">
              Processing Payment with PayPal Sandbox...
            </div>
          )}

          <div className="paypal-container">
            <PayPalButtons
              style={{
                layout: 'vertical',
                color: 'gold',
                shape: 'pill',
                label: 'pay',
                height: 44,
              }}
              createOrder={async () => {
                return await handleCreateOrder();
              }}
              onApprove={async (data) => {
                await handleApprove(data);
              }}
              onError={(err) => {
                console.error('PayPal Button Error:', err);
                setCheckoutError('PayPal payment error occurred.');
              }}
            />
          </div>

          <div className="mt-3 text-center space-y-2">
            <p className="text-[11px] text-[#6C7378]">
              Powered by PayPal
            </p>
            <button
              type="button"
              onClick={handleDirectDemoCheckout}
              disabled={isProcessing}
              className="text-center text-xs text-[#6C7378] hover:text-[#0070BA] transition-colors underline"
            >
              Or complete instant sandbox test checkout (1-click demo)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
