import { NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/paypal';
import { supabaseServer } from '@/lib/supabase';
import { CartItem, TicketConfirmation } from '@/types';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { orderID, items, studentInfo } = await request.json();

    if (!orderID) {
      return NextResponse.json({ error: 'orderID is required' }, { status: 400 });
    }

    // Capture payment with PayPal REST API
    const captureResult = await capturePayPalOrder(orderID);

    const captureDetails =
      captureResult.purchase_units?.[0]?.payments?.captures?.[0];

    const captureId = captureDetails?.id || captureResult.id || `cap_${Date.now()}`;
    const captureStatus = captureDetails?.status || captureResult.status;

    if (captureStatus !== 'COMPLETED') {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${captureStatus}` },
        { status: 400 }
      );
    }

    const attendeeName = studentInfo?.name || 'Student Attendee';
    const attendeeEmail = studentInfo?.email || 'student@university.edu';
    const buyerId = 'cd5e8d6c-925b-46c5-bd76-abff89f38453'; // Maya Chen
    const paidAt = new Date().toISOString();

    // 1. Update the order in Supabase
    const { data: updatedOrder } = await supabaseServer
      .from('orders')
      .update({
        status: 'paid',
        paypal_capture_id: captureId,
        paid_at: paidAt,
      })
      .eq('paypal_order_id', orderID)
      .select('id')
      .maybeSingle();

    const orderDbId = updatedOrder?.id || null;

    // 2. Generate and store tickets for each item in the cart
    const confirmedTickets: TicketConfirmation['items'] = [];

    for (const item of (items || []) as CartItem[]) {
      const quantity = item.quantity || 1;

      for (let i = 0; i < quantity; i++) {
        const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
        const ticketNumber = `EM-${randomHex}`;

        // Insert ticket into Supabase tickets table
        await supabaseServer.from('tickets').insert({
          event_id: item.event.id,
          tier_id: item.tier.id,
          owner_id: buyerId,
          order_id: orderDbId,
          ticket_number: ticketNumber,
          status: 'valid',
          unit_price_cents: item.tier.price_cents,
          source_capture_id: captureId,
          created_at: paidAt,
        });

        // Increment sold_count in ticket_tiers table
        if (item.tier.id) {
          const { data: tierData } = await supabaseServer
            .from('ticket_tiers')
            .select('sold_count')
            .eq('id', item.tier.id)
            .single();

          if (tierData) {
            await supabaseServer
              .from('ticket_tiers')
              .update({ sold_count: (tierData.sold_count || 0) + 1 })
              .eq('id', item.tier.id);
          }
        }

        confirmedTickets.push({
          eventTitle: item.event.title,
          venue: item.event.venue,
          city: item.event.city,
          startsAt: item.event.starts_at,
          tierName: item.tier.name,
          priceCents: item.tier.price_cents,
          ticketNumber: ticketNumber,
        });
      }
    }

    const totalPaid = confirmedTickets.reduce((acc, t) => acc + t.priceCents, 0);

    const confirmation: TicketConfirmation = {
      orderId: orderID,
      paypalCaptureId: captureId,
      attendeeName,
      attendeeEmail,
      items: confirmedTickets,
      totalPaid,
      currency: 'USD',
      paidAt,
    };

    return NextResponse.json({
      success: true,
      captureId,
      confirmation,
    });
  } catch (err: any) {
    console.error('Capture PayPal Order Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
