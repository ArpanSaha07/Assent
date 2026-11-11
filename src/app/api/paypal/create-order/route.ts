import { NextResponse } from 'next/server';
import { createPayPalOrder } from '@/lib/paypal';
import { supabaseServer } from '@/lib/supabase';
import { CartItem } from '@/types';

export async function POST(request: Request) {
  try {
    const { items, totalCents, studentInfo } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const totalAmount = (totalCents / 100).toFixed(2);

    const paypalItems = items.map((item: CartItem) => ({
      name: `${item.event.title.substring(0, 50)} - ${item.tier.name}`.substring(0, 127),
      description: `University Event Ticket - ${item.event.city}`.substring(0, 127),
      quantity: String(item.quantity || 1),
      unit_amount: {
        currency_code: 'USD',
        value: (item.tier.price_cents / 100).toFixed(2),
      },
    }));

    const order = await createPayPalOrder({
      totalAmount,
      currency: 'USD',
      items: paypalItems,
      customId: `cart_${Date.now()}`,
    });

    const firstEventId = items[0]?.event?.id;
    const buyerId = 'cd5e8d6c-925b-46c5-bd76-abff89f38453'; // Maya Chen (attendee profile)

    // Record initial order state as 'created' in Supabase
    const { error: dbError } = await supabaseServer.from('orders').insert({
      buyer_id: buyerId,
      event_id: firstEventId,
      items: items,
      total_cents: totalCents,
      currency: 'USD',
      status: 'created',
      paypal_order_id: order.id,
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      console.warn('Non-fatal: could not log order creation to DB:', dbError.message);
    }

    return NextResponse.json({ id: order.id });
  } catch (err: any) {
    console.error('Create PayPal Order Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
