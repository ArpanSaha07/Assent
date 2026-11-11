import { supabaseServer } from './supabase';

export async function seedEvents() {
  const organiserId = '7fc7f0b0-1a08-40ad-b4ca-073cedcc474a';

  const events = [
    {
      id: 'a1111111-1111-4111-8111-111111111111',
      organiser_id: organiserId,
      title: 'Hands-on RAG & Vector Search Workshop',
      description: 'Master Retrieval-Augmented Generation, embeddings, and vector databases with practical Python code. Designed for CS students and aspiring AI engineers.',
      category: 'Workshop',
      venue: 'Stanford Huang Engineering Center, Room 102',
      city: 'Stanford, CA',
      timezone: 'America/Los_Angeles',
      starts_at: '2026-11-14T10:00:00-08:00',
      ends_at: '2026-11-14T13:00:00-08:00',
      status: 'published',
      refund_policy_text: 'Full refund up to 24 hours prior to event start.'
    },
    {
      id: 'a2222222-2222-4222-8222-222222222222',
      organiser_id: organiserId,
      title: 'Building Autonomous AI Agents with LangGraph',
      description: 'Learn how to build multi-agent workflows, human-in-the-loop triggers, and memory storage using LangGraph and GPT-4. Interactive code walkthrough.',
      category: 'Workshop',
      venue: 'UC Berkeley Jacobs Hall, Lab 310',
      city: 'Berkeley, CA',
      timezone: 'America/Los_Angeles',
      starts_at: '2026-11-15T14:00:00-08:00',
      ends_at: '2026-11-15T17:00:00-08:00',
      status: 'published',
      refund_policy_text: 'Full refund up to 24 hours prior to event start.'
    },
    {
      id: 'a3333333-3333-4333-8333-333333333333',
      organiser_id: organiserId,
      title: 'Full-Stack AI Web Apps with Next.js & OpenAI',
      description: 'Hands-on bootcamp on building production AI web applications with Next.js App Router, streaming UI, and API integrations.',
      category: 'Workshop',
      venue: 'SF Hackers Guild (Downtown SF)',
      city: 'San Francisco, CA',
      timezone: 'America/Los_Angeles',
      starts_at: '2026-11-15T10:00:00-08:00',
      ends_at: '2026-11-15T13:00:00-08:00',
      status: 'published',
      refund_policy_text: 'Full refund up to 48 hours prior.'
    },
    {
      id: 'a4444444-4444-4444-8444-444444444444',
      organiser_id: organiserId,
      title: 'Bay Area AI Founders & Student Mixer',
      description: 'Meet student founders, researchers, and venture scouts. Drinks and demo tables included.',
      category: 'Meetup',
      venue: 'SOMA Loft 42',
      city: 'San Francisco, CA',
      timezone: 'America/Los_Angeles',
      starts_at: '2026-11-14T18:00:00-08:00',
      ends_at: '2026-11-14T21:00:00-08:00',
      status: 'published',
      refund_policy_text: 'No refunds within 24h.'
    }
  ];

  const tiers = [
    {
      id: 'b1111111-1111-4111-8111-111111111111',
      event_id: 'a1111111-1111-4111-8111-111111111111',
      name: 'Student Discount Ticket',
      description: 'Valid with student ID. Access to live coding workshop, slides & code templates.',
      price_cents: 2000,
      currency: 'USD',
      capacity: 45,
      sold_count: 14,
      sort_order: 1
    },
    {
      id: 'b1111111-1111-4111-8111-111111111112',
      event_id: 'a1111111-1111-4111-8111-111111111111',
      name: 'General Admission',
      description: 'Standard attendee pass.',
      price_cents: 3500,
      currency: 'USD',
      capacity: 25,
      sold_count: 18,
      sort_order: 2
    },
    {
      id: 'b2222222-2222-4222-8222-222222222221',
      event_id: 'a2222222-2222-4222-8222-222222222222',
      name: 'Student Discount Pass',
      description: 'Valid with current university ID. Includes workshop sandbox credits and notebook templates.',
      price_cents: 2000,
      currency: 'USD',
      capacity: 50,
      sold_count: 22,
      sort_order: 1
    },
    {
      id: 'b2222222-2222-4222-8222-222222222222',
      event_id: 'a2222222-2222-4222-8222-222222222222',
      name: 'General Admission',
      description: 'Standard attendee seat with mentorship session.',
      price_cents: 3000,
      currency: 'USD',
      capacity: 30,
      sold_count: 25,
      sort_order: 2
    },
    {
      id: 'b3333333-3333-4333-8333-333333333331',
      event_id: 'a3333333-3333-4333-8333-333333333333',
      name: 'Student Ticket',
      description: 'Includes full project source code repo and lunch.',
      price_cents: 1800,
      currency: 'USD',
      capacity: 40,
      sold_count: 15,
      sort_order: 1
    },
    {
      id: 'b3333333-3333-4333-8333-333333333332',
      event_id: 'a3333333-3333-4333-8333-333333333333',
      name: 'General Pass',
      description: 'Standard pass.',
      price_cents: 2800,
      currency: 'USD',
      capacity: 20,
      sold_count: 11,
      sort_order: 2
    },
    {
      id: 'b4444444-4444-4444-8444-444444444441',
      event_id: 'a4444444-4444-4444-8444-444444444444',
      name: 'Student Early Bird',
      description: 'Includes 1 mocktail/drink token and pizza.',
      price_cents: 1000,
      currency: 'USD',
      capacity: 80,
      sold_count: 50,
      sort_order: 1
    }
  ];

  for (const ev of events) {
    await supabaseServer.from('events').upsert(ev);
  }
  for (const t of tiers) {
    await supabaseServer.from('ticket_tiers').upsert(t);
  }
}
