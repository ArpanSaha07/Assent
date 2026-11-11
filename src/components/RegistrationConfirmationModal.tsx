'use client';

import React, { useEffect } from 'react';
import { TicketConfirmation } from '@/types';
import { CheckCircle2, QrCode, Download, Calendar, MapPin, Ticket, ShieldCheck, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegistrationConfirmationModalProps {
  confirmation: TicketConfirmation | null;
  onClose: () => void;
}

export const RegistrationConfirmationModal: React.FC<RegistrationConfirmationModalProps> = ({
  confirmation,
  onClose,
}) => {
  useEffect(() => {
    if (confirmation) {
      // Trigger festive celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [confirmation]);

  if (!confirmation) return null;

  const formatDate = (dateString: string) => {
    try {
      const dt = new Date(dateString);
      return dt.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-black/20 p-1.5 text-white/80 hover:bg-black/40 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner mb-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-300" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200 border border-emerald-300/30 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            PayPal Payment Confirmed
          </span>

          <h2 className="text-2xl font-bold tracking-tight">Registration Confirmed!</h2>
          <p className="mt-1 text-xs text-indigo-100 max-w-sm mx-auto">
            Your university event registration has been secured. Your official student passes are below.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Order Details Badge */}
          <div className="flex flex-wrap items-center justify-between rounded-xl bg-slate-950/70 p-3 text-xs border border-slate-800 gap-2">
            <div>
              <span className="text-slate-400">Attendee: </span>
              <span className="font-semibold text-white">{confirmation.attendeeName}</span>
            </div>
            <div>
              <span className="text-slate-400">PayPal Capture: </span>
              <span className="font-mono text-indigo-300">{confirmation.paypalCaptureId.substring(0, 16)}...</span>
            </div>
            <div>
              <span className="text-slate-400">Total Paid: </span>
              <span className="font-bold text-emerald-400">
                ${(confirmation.totalPaid / 100).toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* Ticket Passes */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Your Registered Event Passes ({confirmation.items.length})
            </h4>

            {confirmation.items.map((item, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-slate-950/80 p-4 transition-all"
              >
                {/* Perforation effect */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                        {item.tierName}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-emerald-400">
                        ${(item.priceCents / 100).toFixed(2)}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white">{item.eventTitle}</h3>

                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        <span>{formatDate(item.startsAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                        <span>{item.venue}, {item.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* QR & Ticket Number Box */}
                  <div className="flex flex-col items-center justify-center rounded-xl bg-slate-900 border border-slate-800 p-3 min-w-[120px] text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white p-1 text-slate-950 mb-1.5 shadow-sm">
                      <QrCode className="h-12 w-12" />
                    </div>
                    <span className="text-[10px] text-slate-400">Pass Code</span>
                    <span className="font-mono text-xs font-bold text-indigo-300 tracking-wider">
                      {item.ticketNumber}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/90 p-4">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all border border-slate-700"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Print / Save Passes</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
