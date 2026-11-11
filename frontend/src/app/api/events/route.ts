import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { seedEvents } from '@/lib/seed';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const keyword = searchParams.get('keyword');

    let query = supabaseServer
      .from('events')
      .select(`
        id,
        organiser_id,
        title,
        description,
        category,
        venue,
        city,
        timezone,
        starts_at,
        ends_at,
        status,
        refund_policy_text,
        ticket_tiers (
          id,
          event_id,
          name,
          description,
          price_cents,
          currency,
          capacity,
          sold_count,
          sort_order
        )
      `)
      .eq('status', 'published')
      .order('starts_at', { ascending: true });

    if (category) {
      query = query.ilike('category', `%${category}%`);
    }

    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
    }

    let { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no events found, auto-seed
    if (!data || data.length === 0) {
      await seedEvents();
      const res = await query;
      data = res.data;
    }

    return NextResponse.json({ events: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
