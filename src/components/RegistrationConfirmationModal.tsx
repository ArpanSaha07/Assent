'use client';

import React, { useEffect } from 'react';
import { TicketConfirmation } from '@/types';
import { CheckCircle2, QrCode, Download, Calendar, MapPin, ShieldCheck, X } from 'lucide-react';
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
      confetti({
        particleCount: 70,
        spread: 60,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2E2F]/60 overflow-y-auto">
      <div className="relative w-full max-w-xl overflow-hidden rounded-card border border-[#E1E7EB] bg-white shadow-paypal">
        {/* Header */}
        <div className="relative bg-[#F5F7FA] border-b border-[#E1E7EB] p-6 text-center">
          <button
            onClick={onClose}
            aria-label="Close confirmation dialog"
            className="absolute top-4 right-4 rounded-full p-1 text-[#6C7378] hover:text-[#2C2E2F] hover:bg-[#E1E7EB]/50 transition-colors"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F5EC] text-[#0B7A3E] mb-3">
            <CheckCircle2 className="h-6 w-6" strokeWidth={1.5} />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F5EC] px-3 py-1 text-xs font-semibold text-[#0B7A3E] border border-[#0B7A3E]/20 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
            PayPal Payment Confirmed
          </span>

          <h2 className="text-xl font-semibold tracking-tight text-[#2C2E2F]">Registration Confirmed!</h2>
          <p className="mt-1 text-xs text-[#6C7378] max-w-sm mx-auto">
            Your university event registration has been secured. Your official student passes are below.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Order Details Badge */}
          <div className="flex flex-wrap items-center justify-between rounded-lg bg-[#F5F7FA] p-3 text-xs border border-[#E1E7EB] gap-2">
            <div>
              <span className="text-[#6C7378]">Attendee: </span>
              <span className="font-semibold text-[#2C2E2F]">{confirmation.attendeeName}</span>
            </div>
            <div>
              <span className="text-[#6C7378]">PayPal Capture: </span>
              <span className="font-mono text-[#003087]">{confirmation.paypalCaptureId.substring(0, 16)}...</span>
            </div>
            <div>
              <span className="text-[#6C7378]">Total Paid: </span>
              <span className="font-bold text-[#0B7A3E]">
                ${(confirmation.totalPaid / 100).toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* Ticket Passes */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-[#6C7378]">
              Your Registered Event Passes ({confirmation.items.length})
            </h4>

            {confirmation.items.map((item, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-lg border border-[#E1E7EB] bg-white p-4 shadow-paypal-sm"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[#F5F7FA] px-2 py-0.5 text-[10px] font-medium text-[#6C7378] border border-[#E1E7EB]">
                        {item.tierName}
                      </span>
                      <span className="text-xs font-semibold text-[#0B7A3E]">
                        ${(item.priceCents / 100).toFixed(2)}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-[#2C2E2F]">{item.eventTitle}</h3>

                    <div className="space-y-1 text-xs text-[#6C7378]">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#6C7378]" strokeWidth={1.5} />
                        <span>{formatDate(item.startsAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#6C7378]" strokeWidth={1.5} />
                        <span>{item.venue}, {item.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* QR & Ticket Number Box */}
                  <div className="flex flex-col items-center justify-center rounded-lg bg-[#F5F7FA] border border-[#E1E7EB] p-3 min-w-[120px] text-center shrink-0">
                    <div className="flex h-14 w-14 items-center justify-center rounded bg-white p-1 text-[#2C2E2F] mb-1.5 border border-[#E1E7EB]">
                      <QrCode className="h-12 w-12" strokeWidth={1.5} />
                    </div>
                    <span className="text-[10px] text-[#6C7378]">Pass Code</span>
                    <span className="font-mono text-xs font-bold text-[#003087] tracking-wider">
                      {item.ticketNumber}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#E1E7EB] bg-[#F5F7FA] p-4">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 rounded-full border border-[#CBD2D6] bg-white px-4 py-2 text-xs font-semibold text-[#2C2E2F] hover:bg-[#F5F7FA] transition-colors shadow-paypal-sm min-h-[44px]"
          >
            <Download className="h-3.5 w-3.5 text-[#6C7378]" strokeWidth={1.5} />
            <span>Print / Save Passes</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-full bg-[#0070BA] px-6 py-2 text-xs font-semibold text-white hover:bg-[#005EA6] shadow-paypal-sm min-h-[44px] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
