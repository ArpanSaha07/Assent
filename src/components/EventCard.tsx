'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Tag, Check, Plus, Clock } from 'lucide-react';
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
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition-all duration-300 hover:border-indigo-500/40 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-indigo-500/5">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="rounded-md bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              {event.category || 'Event'}
            </span>
            {isWeekend && (
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300 border border-amber-500/20">
                This Weekend
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            From ${(Math.min(...tiers.map((t) => t.price_cents || 0)) / 100).toFixed(2)}
          </span>
        </div>

        <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
          {event.title}
        </h3>

        <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Date & Location Meta */}
        <div className="mt-4 space-y-1.5 border-t border-slate-800/80 pt-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Calendar className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="font-medium text-slate-300">{formatDate(event.starts_at)}</span>
            <Clock className="h-3.5 w-3.5 text-indigo-400 ml-2 shrink-0" />
            <span>{formatTime(event.starts_at)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{event.venue}, {event.city}</span>
          </div>
        </div>
      </div>

      {/* Ticket Tier Selector & Add To Cart */}
      <div className="mt-4 border-t border-slate-800/80 pt-3">
        {tiers.length > 0 && (
          <div className="mb-3 space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>Select Ticket Tier:</span>
              <span className="text-indigo-400 font-semibold">
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
                    className={`flex flex-col text-left p-2 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/40 text-white'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium truncate">{tier.name}</span>
                      {isStudent && (
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1 rounded">
                          Student
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-slate-200 mt-0.5">
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
          className={`w-full flex items-center justify-center space-x-2 rounded-xl py-2 px-3 text-xs font-semibold transition-all ${
            isAdded
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>In Registration Cart</span>
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              <span>Add Ticket to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
