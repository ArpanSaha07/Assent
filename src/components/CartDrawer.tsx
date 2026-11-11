'use client';

import React, { useState } from 'react';
import { RegistrationCart, CartItem, TicketConfirmation } from '@/types';
import { Trash2, ShoppingBag, ShieldCheck, User, Mail, Award, CheckCircle2, AlertCircle } from 'lucide-react';
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
      // Create order first
      const orderId = await handleCreateOrder();
      // Simulate capture
      await handleApprove({ orderID: orderId });
    } catch (err: any) {
      setCheckoutError(err.message);
      setIsProcessing(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-slate-800 bg-slate-900/40">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-500 mb-3">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h3 className="text-base font-semibold text-white">Your Cart is Empty</h3>
        <p className="mt-1 text-xs text-slate-400 max-w-xs">
          Ask the AI concierge: "Find me two AI workshops this weekend, with a total ticket budget of $40." or add tickets manually!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Registration Cart ({cart.items.length})</h3>
        </div>
        <button
          onClick={onClearCart}
          className="text-xs text-slate-400 hover:text-red-400 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Budget Goal Tracker */}
      {targetBudgetUsd && (
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3 text-xs">
          <div className="flex items-center justify-between mb-1.5 font-medium">
            <span className="text-indigo-300">Stated Budget Target:</span>
            <span className="font-bold text-white">${targetBudgetUsd}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full ${
                Number(totalAmountUsd) <= Number(targetBudgetUsd)
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
              style={{
                width: `${Math.min(
                  100,
                  (Number(totalAmountUsd) / Number(targetBudgetUsd)) * 100
                )}%`,
              }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Cart Total: ${totalAmountUsd}</span>
            {Number(totalAmountUsd) <= Number(targetBudgetUsd) ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Within budget limit
              </span>
            ) : (
              <span className="text-amber-400 font-semibold">Exceeds budget target</span>
            )}
          </div>
          {cart.notes && (
            <p className="mt-2 text-[11px] text-indigo-200/90 italic bg-indigo-900/30 p-2 rounded-lg">
              "{cart.notes}"
            </p>
          )}
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
        {cart.items.map((item, idx) => (
          <div
            key={`${item.event.id}-${item.tier.id}-${idx}`}
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3"
          >
            <div className="space-y-1 pr-2">
              <h4 className="text-xs font-semibold text-white line-clamp-1">
                {item.event.title}
              </h4>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-indigo-300">
                  {item.tier.name}
                </span>
                <span>${(item.tier.price_cents / 100).toFixed(2)} each</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.event.id, item.tier.id, -1)}
                  className="px-1 text-slate-400 hover:text-white"
                >
                  -
                </button>
                <span className="px-1.5 font-bold text-white">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.event.id, item.tier.id, 1)}
                  className="px-1 text-slate-400 hover:text-white"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => onRemoveItem(item.event.id, item.tier.id)}
                className="text-slate-500 hover:text-red-400 transition-colors p-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Student Details Form */}
      <div className="space-y-2.5 rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-xs">
        <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-indigo-400" />
          <span>Student Attendee Details</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400">Full Name</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400">University Email</label>
            <input
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Total & PayPal Checkout */}
      <div className="space-y-3 border-t border-slate-800 pt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-300">Total Registration Amount:</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">
            ${totalAmountUsd} USD
          </span>
        </div>

        {checkoutError && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-2.5 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{checkoutError}</span>
          </div>
        )}

        {/* PayPal SDK Buttons */}
        <div className="relative">
          {isProcessing && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-slate-950/80 backdrop-blur-sm text-xs font-semibold text-indigo-300">
              Processing Payment with PayPal Sandbox...
            </div>
          )}

          <div className="paypal-container">
            <PayPalButtons
              style={{
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'pay',
                height: 40,
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

          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={handleDirectDemoCheckout}
              disabled={isProcessing}
              className="w-full text-center text-[11px] text-slate-400 hover:text-indigo-300 transition-colors py-1 underline"
            >
              Or complete instant sandbox test checkout (1-click demo)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
