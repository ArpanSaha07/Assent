export interface Event {
  id: string;
  organiser_id: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  city: string;
  timezone: string;
  starts_at: string;
  ends_at: string;
  status: string;
  refund_policy_text?: string;
  refund_rule?: string;
  created_at?: string;
  ticket_tiers?: TicketTier[];
}

export interface TicketTier {
  id: string;
  event_id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  capacity: number;
  sold_count: number;
  sort_order: number;
}

export interface CartItem {
  event: Event;
  tier: TicketTier;
  quantity: number;
  attendeeName?: string;
  attendeeEmail?: string;
  studentId?: string;
}

export interface RegistrationCart {
  items: CartItem[];
  totalCents: number;
  currency: string;
  targetBudgetCents?: number;
  notes?: string;
}

export interface RegistrationOrder {
  id: string;
  buyer_id?: string;
  event_id?: string;
  items: CartItem[];
  total_cents: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  paypal_order_id: string;
  paypal_capture_id?: string;
  created_at?: string;
  paid_at?: string;
  attendee_name?: string;
  attendee_email?: string;
}

export interface TicketConfirmation {
  orderId: string;
  paypalCaptureId: string;
  attendeeName: string;
  attendeeEmail: string;
  items: {
    eventTitle: string;
    venue: string;
    city: string;
    startsAt: string;
    tierName: string;
    priceCents: number;
    ticketNumber: string;
  }[];
  totalPaid: number;
  currency: string;
  paidAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  recommendedEvents?: Event[];
  cartAction?: {
    type: 'PROPOSE_CART' | 'CONFIRM_CART' | 'CLEAR_CART';
    cart: RegistrationCart;
  };
  reasoningSummary?: string;
  timestamp: string;
}
