# EventMate — AI Event Budget and Registration Agent
Students · Events · AI Concierge

An assistant that helps students discover events within their interests and budget, and handles paid registration with PayPal.

### Demo Example:
`"Find me two AI workshops this weekend, with a total ticket budget of $40."`

### What EventMate Does:
1. **Event Discovery**: Searches a seeded collection of university events stored in Supabase with category, date, and keyword filters.
2. **Constraint Reasoning**: Evaluates dates (e.g. this weekend Nov 14-15), category requirements (Workshops), and ticket tiers (prioritizing Student Discount tiers) to find combinations that strictly meet the target budget ($20 + $20 = $40.00).
3. **Registration Cart**: Automatically creates an interactive registration cart with attendee details, pricing breakdown, and budget tracker.
4. **PayPal Checkout & Passes**: Integrates PayPal Orders API + Checkout SDK (sandbox) to capture payments, store tickets in Supabase, and generate passes with QR codes.
