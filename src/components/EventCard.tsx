'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Check, Plus, Clock } from 'lucide-react';
import { Event, TicketTier } from '@/types';

interface EventCardProps {
  event: Event;
  onAddToCart: (event: Event, tier: TicketTier) => void;
  isAdded?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onAddToCart, isAdded }) => {
  const tiers = event.ticket_tiers || [];
  const defaultTier = tiers.find((t) => t.name.toLowerCase().includes('student')) || tiers[0];
  const [selectedTierId, setSelectedTierId] = useState<string>(defaultTier?.id || '');

  const activeTier = tiers.find((t) => t.id === selectedTierId) || defaultTier;

  const formatDate = (dateString: string) => {
    try {
      const dt = new Date(dateString);
      return dt.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const dt = new Date(dateString);
      return dt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const isWeekend =
    event.starts_at.includes('2026-11-14') || event.starts_at.includes('2026-11-15');

  return (
    <div className="flex flex-col justify-between rounded-card border border-[#E1E7EB] bg-white p-5 shadow-paypal-sm hover:border-[#CBD2D6] transition-colors">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="rounded-full bg-[#F5F7FA] px-2.5 py-0.5 text-xs font-medium text-[#6C7378] border border-[#E1E7EB]">
              {event.category || 'Event'}
            </span>
            {isWeekend && (
              <span className="rounded-full bg-[#FFF4DB] px-2 py-0.5 text-[11px] font-medium text-[#8A5A00] border border-[#8A5A00]/20">
                This Weekend
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-[#0B7A3E] bg-[#E8F5EC] px-2.5 py-0.5 rounded-full border border-[#0B7A3E]/20">
            From ${(Math.min(...tiers.map((t) => t.price_cents || 0)) / 100).toFixed(2)}
          </span>
        </div>

        <h3 className="text-base font-semibold text-[#2C2E2F] line-clamp-2">
          {event.title}
        </h3>

        <p className="mt-1.5 text-xs text-[#6C7378] line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Date & Location Meta */}
        <div className="mt-4 space-y-1.5 border-t border-[#E1E7EB] pt-3 text-xs text-[#6C7378]">
          <div className="flex items-center space-x-2">
            <Calendar className="h-3.5 w-3.5 text-[#6C7378] shrink-0" strokeWidth={1.5} />
            <span className="font-medium text-[#2C2E2F]">{formatDate(event.starts_at)}</span>
            <Clock className="h-3.5 w-3.5 text-[#6C7378] ml-2 shrink-0" strokeWidth={1.5} />
            <span>{formatTime(event.starts_at)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-3.5 w-3.5 text-[#6C7378] shrink-0" strokeWidth={1.5} />
            <span className="truncate">{event.venue}, {event.city}</span>
          </div>
        </div>
      </div>

      {/* Ticket Tier Selector & Add To Cart */}
      <div className="mt-4 border-t border-[#E1E7EB] pt-3">
        {tiers.length > 0 && (
          <div className="mb-3 space-y-1.5">
            <label className="text-[11px] font-medium text-[#6C7378] flex items-center justify-between">
              <span>Select Ticket Tier:</span>
              <span className="text-[#003087] font-semibold">
                ${((activeTier?.price_cents || 0) / 100).toFixed(2)}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {tiers.map((tier) => {
                const isSelected = tier.id === (activeTier?.id || '');
                const isStudent = tier.name.toLowerCase().includes('student');
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`flex flex-col text-left p-2 rounded-lg border text-xs transition-colors ${
                      isSelected
                        ? 'border-[#0070BA] bg-[#F5F7FA] text-[#003087] font-semibold'
                        : 'border-[#E1E7EB] bg-white text-[#6C7378] hover:border-[#CBD2D6]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{tier.name}</span>
                      {isStudent && (
                        <span className="text-[9px] bg-[#E1E7EB] text-[#2C2E2F] px-1 rounded">
                          Student
                        </span>
                      )}
                    </div>
                    <span className="text-[#2C2E2F] font-semibold mt-0.5">
                      ${(tier.price_cents / 100).toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            if (activeTier) {
              onAddToCart(event, activeTier);
            }
          }}
          className={`w-full flex items-center justify-center space-x-2 rounded-full py-2.5 px-4 text-xs font-semibold min-h-[44px] transition-colors ${
            isAdded
              ? 'border border-[#0B7A3E] bg-[#E8F5EC] text-[#0B7A3E]'
              : 'bg-[#0070BA] hover:bg-[#005EA6] text-white shadow-paypal-sm'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="h-4 w-4 text-[#0B7A3E]" strokeWidth={1.5} />
              <span>In Registration Cart</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              <span>Add Ticket to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
