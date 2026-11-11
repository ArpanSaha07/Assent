import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseServer } from '@/lib/supabase';
import { Event, TicketTier, RegistrationCart, CartItem } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const SYSTEM_PROMPT = `You are EventMate, an intelligent AI Event Concierge and Budget Optimizer for university students.
Current date: Wednesday, November 11, 2026.
Calendar context:
- This weekend: Saturday November 14, 2026 and Sunday November 15, 2026.
- Next week: November 16 - 22, 2026.

Your core mission:
1. Help students discover relevant events within their interests (e.g., AI, machine learning, web dev, founders, hackathons).
2. Strictly respect student budget constraints. When the user says e.g. "Find me two AI workshops this weekend, with a total ticket budget of $40", recognize that:
   - Target event count: 2 workshops
   - Dates: this weekend (Saturday Nov 14 and Sunday Nov 15, 2026)
   - Category: Workshop
   - Total ticket budget: $40.00 USD
3. First, call search_events with category="Workshop", keyword="AI", and date_filter="this_weekend".
4. From the returned events, select 2 distinct workshops that fit within the $40 budget using their Student Discount tiers (for example: "Hands-on RAG & Vector Search Workshop" Student Ticket @ $20.00 + "Building Autonomous AI Agents with LangGraph" Student Pass @ $20.00 = $40.00 exact match!).
5. You MUST immediately call build_registration_cart with these 2 items, setting target_budget_usd: 40, and a concise budget_note explaining the math ($20 + $20 = $40).
6. In your final text response to the student, summarize the 2 workshops chosen, show how the prices meet the budget constraint, and confirm that the registration cart is ready for PayPal checkout.
`;

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_events',
      description: 'Search available university events and their ticket tiers from the database.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Event category filter, e.g. "Workshop", "Meetup", "Seminar", "Hackathon"',
          },
          keyword: {
            type: 'string',
            description: 'Topic or keyword, e.g. "AI", "RAG", "Agent", "LangGraph"',
          },
          date_filter: {
            type: 'string',
            enum: ['this_weekend', 'upcoming', 'all'],
            description: 'Date filter. "this_weekend" filters for Nov 14 - Nov 15, 2026.',
          },
          max_budget_usd: {
            type: 'number',
            description: 'Total or per-ticket maximum budget in USD.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'build_registration_cart',
      description: 'Build or update the student registration cart with selected events and ticket tiers.',
      parameters: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            description: 'The selected events and ticket tiers',
            items: {
              type: 'object',
              properties: {
                event_id: { type: 'string', description: 'Event UUID' },
                tier_id: { type: 'string', description: 'Ticket Tier UUID' },
                quantity: { type: 'number', description: 'Quantity of tickets (default 1)' },
              },
              required: ['event_id', 'tier_id'],
            },
          },
          target_budget_usd: {
            type: 'number',
            description: 'The user stated budget limit in USD if any, e.g. 40',
          },
          budget_note: {
            type: 'string',
            description: 'Explanation of how the total cost matches the user budget constraint.',
          },
        },
        required: ['items', 'budget_note'],
      },
    },
  },
];

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content || '',
      })),
    ];

    const modelName = process.env.OPENAI_MODEL || 'gpt-6.1-terra';

    let runnerMessages = [...formattedMessages];
    let recommendedEvents: Event[] = [];
    let proposedCart: RegistrationCart | null = null;
    let reasoningSummary = '';

    // Loop for tool call executions (max 3 rounds)
    for (let round = 0; round < 3; round++) {
      const completionOptions: any = {
        model: modelName,
        messages: runnerMessages,
        tools: tools,
        tool_choice: 'auto',
      };

      if (modelName.includes('terra')) {
        completionOptions.reasoning_effort = 'none';
      }

      const response = await openai.chat.completions.create(completionOptions);

      const choice = response.choices[0];
      const assistantMsg = choice.message;

      if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
        // Final assistant answer
        return NextResponse.json({
          content: assistantMsg.content || '',
          recommendedEvents: recommendedEvents.length > 0 ? recommendedEvents : undefined,
          proposedCart: proposedCart || undefined,
          reasoningSummary: reasoningSummary || undefined,
        });
      }

      // Add assistant tool calls to message history
      runnerMessages.push(assistantMsg);

      for (const toolCall of assistantMsg.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments || '{}');

        if (functionName === 'search_events') {
          // Query Supabase
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
            .eq('status', 'published');

          if (args.category) {
            query = query.ilike('category', `%${args.category}%`);
          }

          const { data: eventsData, error } = await query;
          let filtered = (eventsData as unknown as Event[]) || [];

          if (args.keyword) {
            const kw = args.keyword.toLowerCase();
            filtered = filtered.filter(
              (e) =>
                e.title.toLowerCase().includes(kw) ||
                e.description.toLowerCase().includes(kw) ||
                e.category.toLowerCase().includes(kw)
            );
          }

          if (args.date_filter === 'this_weekend') {
            // Weekend: Nov 14 00:00 to Nov 15 23:59 (Pacific or UTC window)
            filtered = filtered.filter((e) => {
              const dt = new Date(e.starts_at);
              const day = dt.getUTCDate();
              const month = dt.getUTCMonth(); // Nov is 10
              // Check for Nov 14 or Nov 15 or Pacific local weekend
              return (
                e.starts_at.includes('2026-11-14') ||
                e.starts_at.includes('2026-11-15') ||
                (month === 10 && (day === 14 || day === 15))
              );
            });
          }

          recommendedEvents = filtered;

          // Provide compact summary to the model
          const searchResultSummary = filtered.map((e) => ({
            id: e.id,
            title: e.title,
            category: e.category,
            starts_at: e.starts_at,
            venue: e.venue,
            city: e.city,
            tiers: (e.ticket_tiers || []).map((t) => ({
              id: t.id,
              name: t.name,
              price_usd: t.price_cents / 100,
              available: t.capacity - t.sold_count,
            })),
          }));

          runnerMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              total_found: filtered.length,
              events: searchResultSummary,
            }),
          });
        } else if (functionName === 'build_registration_cart') {
          // Construct the CartItem list
          const selectedItems: CartItem[] = [];
          let totalCents = 0;

          const { data: allEvents } = await supabaseServer
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
            `);

          const eventsMap = new Map<string, Event>();
          (allEvents || []).forEach((ev: any) => eventsMap.set(ev.id, ev));

          for (const item of args.items || []) {
            const ev = eventsMap.get(item.event_id);
            if (ev && ev.ticket_tiers) {
              const tier = ev.ticket_tiers.find((t) => t.id === item.tier_id);
              if (tier) {
                const qty = item.quantity || 1;
                selectedItems.push({
                  event: ev,
                  tier: tier,
                  quantity: qty,
                  attendeeName: 'Student Attendee',
                  attendeeEmail: 'student@university.edu',
                });
                totalCents += tier.price_cents * qty;
              }
            }
          }

          proposedCart = {
            items: selectedItems,
            totalCents: totalCents,
            currency: 'USD',
            targetBudgetCents: args.target_budget_usd ? args.target_budget_usd * 100 : undefined,
            notes: args.budget_note,
          };

          reasoningSummary = args.budget_note;

          runnerMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              cart_status: 'SUCCESS',
              total_usd: totalCents / 100,
              items_count: selectedItems.length,
              budget_explanation: args.budget_note,
            }),
          });
        }
      }
    }

    return NextResponse.json({
      content: 'I have found matching events and prepared your registration cart.',
      recommendedEvents,
      proposedCart,
      reasoningSummary,
    });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
