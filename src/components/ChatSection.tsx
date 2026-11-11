'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, CheckCircle2, ArrowRight, Loader2, Calendar, MapPin } from 'lucide-react';
import { ChatMessage, Event, RegistrationCart, TicketTier } from '@/types';

interface ChatSectionProps {
  onProposeCart: (cart: RegistrationCart) => void;
  onAddToCart: (event: Event, tier: TicketTier) => void;
  onViewCart: () => void;
}

const DEFAULT_SUGGESTIONS = [
  'Find me two AI workshops this weekend, with a total ticket budget of $40.',
  'Show me all AI events happening this Saturday and Sunday.',
  'Are there any student mixers or hackathons under $20?',
];

export const ChatSection: React.FC<ChatSectionProps> = ({
  onProposeCart,
  onAddToCart,
  onViewCart,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        '👋 Hey! I am **EventMate**, your AI event concierge and budget registration agent. Tell me what kind of events you are looking for, your schedule, or your target budget!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI recommendation');
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        recommendedEvents: data.recommendedEvents,
        reasoningSummary: data.reasoningSummary,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.proposedCart) {
        onProposeCart(data.proposedCart);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Sorry, an error occurred: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[750px] rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-5 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">EventMate AI Concierge</h2>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">
              GPT-6.1 · University Event Reasoning & Registration Agent
            </p>
          </div>
        </div>

        <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-400 border border-indigo-500/20">
          Demo Active
        </span>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="border-b border-slate-800/80 bg-slate-950/40 px-4 py-2.5 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">Try:</span>
          {DEFAULT_SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(suggestion)}
              className="rounded-full bg-slate-800/80 px-3 py-1 text-[11px] text-slate-300 hover:bg-indigo-600 hover:text-white transition-all whitespace-nowrap border border-slate-700/60"
            >
              {idx === 0 ? '⭐ ' : ''}
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-indigo-400 border border-slate-700'
              }`}
            >
              {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-3 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/70 shadow-md'
              }`}
            >
              {/* Message text */}
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Constraint Reasoning Summary Pill */}
              {msg.reasoningSummary && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-2.5 text-[11px] text-emerald-200">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-400 mb-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Budget & Constraint Match</span>
                  </div>
                  <span>{msg.reasoningSummary}</span>
                </div>
              )}

              {/* Inline Event Recommendation Cards */}
              {msg.recommendedEvents && msg.recommendedEvents.length > 0 && (
                <div className="mt-2 space-y-2 pt-2 border-t border-slate-700/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Recommended Events Matching Your Criteria:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {msg.recommendedEvents.map((ev) => {
                      const studentTier =
                        ev.ticket_tiers?.find((t) => t.name.toLowerCase().includes('student')) ||
                        ev.ticket_tiers?.[0];
                      return (
                        <div
                          key={ev.id}
                          className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3 border border-slate-700/80"
                        >
                          <div className="space-y-1 pr-2">
                            <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
                              {ev.category}
                            </span>
                            <h4 className="font-semibold text-white text-xs">{ev.title}</h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-indigo-400" />
                                {new Date(ev.starts_at).toLocaleDateString([], {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                              <span>·</span>
                              <span className="text-emerald-400 font-bold">
                                ${(Number(studentTier?.price_cents || 0) / 100).toFixed(2)}{' '}
                                {studentTier?.name}
                              </span>
                            </div>
                          </div>

                          {studentTier && (
                            <button
                              type="button"
                              onClick={() => onAddToCart(ev, studentTier)}
                              className="shrink-0 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 px-2.5 py-1.5 text-[11px] font-medium text-white transition-all"
                            >
                              Add Ticket
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Propose Cart Review CTA */}
              {msg.reasoningSummary && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={onViewCart}
                    className="flex items-center space-x-1.5 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>View Registration Cart & Checkout with PayPal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <div className="text-[10px] text-slate-400/80 text-right">{msg.timestamp}</div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center space-x-3 text-xs text-indigo-300 bg-slate-800/60 p-3 rounded-2xl max-w-sm border border-slate-700/60">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
            <span>Agent reasoning over university events, pricing & budget constraints...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="border-t border-slate-800 bg-slate-950/80 p-3 sm:p-4"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Find me two AI workshops this weekend, with a total ticket budget of $40."
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 pl-4 pr-12 py-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 transition-all shadow-md shadow-indigo-600/30"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
