'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, CheckCircle2, ArrowRight, Loader2, Calendar } from 'lucide-react';
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
        'Hey! I am EventMate, your AI event concierge and budget registration agent. Tell me what kind of events you are looking for, your schedule, or your target budget.',
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
          content: `Sorry, an error occurred: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[750px] rounded-card border border-[#E1E7EB] bg-white shadow-paypal overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-[#E1E7EB] bg-white px-5 py-3.5">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F7FA] text-[#003087] border border-[#E1E7EB]">
            <Bot className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#2C2E2F]">EventMate AI Concierge</h2>
            </div>
            <p className="text-[11px] text-[#6C7378]">
              University Event Reasoning & Registration Agent
            </p>
          </div>
        </div>

        <span className="rounded-full bg-[#F5F7FA] px-2.5 py-0.5 text-[11px] font-medium text-[#6C7378] border border-[#E1E7EB]">
          Demo Active
        </span>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="border-b border-[#E1E7EB] bg-[#F5F7FA] px-4 py-2.5 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] font-medium text-[#6C7378] shrink-0">Suggestions:</span>
          {DEFAULT_SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(suggestion)}
              className="rounded-full bg-white px-3 py-1.5 text-xs text-[#2C2E2F] hover:bg-[#F5F7FA] hover:border-[#0070BA] transition-colors whitespace-nowrap border border-[#CBD2D6] shadow-paypal-sm font-normal"
            >
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
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                msg.role === 'user'
                  ? 'bg-[#0070BA] text-white'
                  : 'bg-[#F5F7FA] text-[#003087] border border-[#E1E7EB]'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="h-3.5 w-3.5" strokeWidth={1.5} />
              ) : (
                <Bot className="h-3.5 w-3.5" strokeWidth={1.5} />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-card px-4 py-3 text-xs leading-relaxed space-y-3 ${
                msg.role === 'user'
                  ? 'bg-[#0070BA] text-white'
                  : 'bg-[#F5F7FA] text-[#2C2E2F] border border-[#E1E7EB]'
              }`}
            >
              {/* Message text */}
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Constraint Reasoning Summary Pill (Calm Success Match) */}
              {msg.reasoningSummary && (
                <div className="rounded-lg border border-[#0B7A3E]/20 bg-[#E8F5EC] p-2.5 text-xs text-[#0B7A3E]">
                  <div className="font-semibold flex items-center gap-1.5 mb-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#0B7A3E]" strokeWidth={1.5} />
                    <span>Budget & Constraint Match</span>
                  </div>
                  <span className="text-[#0B7A3E]">{msg.reasoningSummary}</span>
                </div>
              )}

              {/* Inline Event Recommendation Cards */}
              {msg.recommendedEvents && msg.recommendedEvents.length > 0 && (
                <div className="mt-2 space-y-2 pt-2 border-t border-[#E1E7EB]">
                  <span className="text-[11px] font-semibold text-[#6C7378]">
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
                          className="flex items-center justify-between rounded-lg bg-white p-3 border border-[#E1E7EB] shadow-paypal-sm"
                        >
                          <div className="space-y-1 pr-2">
                            <span className="rounded bg-[#F5F7FA] px-1.5 py-0.5 text-[10px] font-medium text-[#6C7378] border border-[#E1E7EB]">
                              {ev.category}
                            </span>
                            <h4 className="font-semibold text-[#2C2E2F] text-xs">{ev.title}</h4>
                            <div className="flex items-center gap-2 text-[11px] text-[#6C7378]">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-[#6C7378]" strokeWidth={1.5} />
                                {new Date(ev.starts_at).toLocaleDateString([], {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                              <span>·</span>
                              <span className="text-[#0B7A3E] font-semibold">
                                ${(Number(studentTier?.price_cents || 0) / 100).toFixed(2)}{' '}
                                {studentTier?.name}
                              </span>
                            </div>
                          </div>

                          {studentTier && (
                            <button
                              type="button"
                              onClick={() => onAddToCart(ev, studentTier)}
                              className="shrink-0 rounded-full bg-[#0070BA] hover:bg-[#005EA6] px-3 py-1.5 text-xs font-semibold text-white transition-colors"
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
                    className="flex items-center space-x-1.5 text-xs font-semibold text-[#0070BA] hover:text-[#005EA6] transition-colors"
                  >
                    <span>View Registration Cart & Checkout with PayPal</span>
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              )}

              <div className={`text-[10px] ${msg.role === 'user' ? 'text-white/80' : 'text-[#6C7378]'} text-right`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center space-x-2.5 text-xs text-[#6C7378] bg-[#F5F7FA] p-3 rounded-lg max-w-sm border border-[#E1E7EB]">
            <Loader2 className="h-4 w-4 animate-spin text-[#0070BA]" strokeWidth={1.5} />
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
        className="border-t border-[#E1E7EB] bg-white p-3 sm:p-4"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Find me two AI workshops this weekend, with a total ticket budget of $40."
            className="w-full rounded-full border border-[#CBD2D6] bg-white pl-4 pr-12 py-2.5 text-xs text-[#2C2E2F] placeholder-[#6C7378] focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA] min-h-[44px]"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#0070BA] text-white hover:bg-[#005EA6] disabled:opacity-40 transition-colors"
          >
            <Send className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </form>
    </div>
  );
};
