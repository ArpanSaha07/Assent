# EventMate Features

1. **AI Event Concierge (`/api/chat`)**:
   - Natural language interface for university students.
   - Smart function calling with `search_events` and `build_registration_cart`.
   - Date & constraint reasoning (recognizes "this weekend" as Nov 14-15, 2026, optimizes combination of workshops matching exact budget).

2. **Seeded University Events (`/api/events`)**:
   - Seeded in Supabase with realistic student discount tiers:
     - *Hands-on RAG & Vector Search Workshop* (Stanford, Sat Nov 14, Student: $20.00)
     - *Building Autonomous AI Agents with LangGraph* (UC Berkeley, Sun Nov 15, Student: $20.00)
     - *Full-Stack AI Web Apps with Next.js* (San Francisco, Sun Nov 15, Student: $18.00)
     - *Bay Area AI Founders & Student Mixer* (SOMA, Sat Nov 14, Student: $10.00)
     - *Applied Computer Vision & Robotics* (San Jose, Student: $15.00)

3. **Interactive Registration Cart & Budget Tracker**:
   - Shows active ticket selection, quantity increments, and student details.
   - Real-time progress bar tracking cart total against target budget.

4. **PayPal Orders API & Client SDK**:
   - Server-side order creation (`/api/paypal/create-order`) via PayPal REST Orders API.
   - Server-side capture (`/api/paypal/capture-order`) updating order status and creating tickets in Supabase.
   - Client-side `@paypal/react-paypal-js` button integration + instant 1-click test checkout.

5. **Passes & Digital Confirmation**:
   - Festive celebratory confetti with pass generation.
   - QR codes, ticket numbers, student name, and printable passes.
