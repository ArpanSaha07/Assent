# EventMate — Backend

The backend for EventMate is currently served via **Next.js API Routes** located in the `frontend` project:

```
frontend/src/app/api/
├── chat/           → AI chat & event recommendations
├── events/         → Event listing from Supabase
└── paypal/
    ├── create-order/   → PayPal Orders API — create
    └── capture-order/  → PayPal Orders API — capture
```

If a dedicated backend server is added in the future (e.g., Express, FastAPI), it should live here.

