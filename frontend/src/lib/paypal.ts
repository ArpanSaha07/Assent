const PAYPAL_API_BASE =
  process.env.PAYPAL_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';

/**
 * Fetch OAuth token from PayPal sandbox
 */
export async function getPayPalAccessToken(): Promise<string> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Missing PayPal client credentials');
  }

  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal OAuth failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export interface PayPalOrderItem {
  name: string;
  description?: string;
  quantity: string;
  unit_amount: {
    currency_code: string;
    value: string;
  };
}

/**
 * Create a PayPal Order with cart items
 */
export async function createPayPalOrder(params: {
  totalAmount: string;
  currency?: string;
  items?: PayPalOrderItem[];
  customId?: string;
}) {
  const token = await getPayPalAccessToken();
  const currency = params.currency || 'USD';

  const body: any = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: params.customId || 'eventmate-registration',
        description: 'EventMate University Event Registration',
        amount: {
          currency_code: currency,
          value: params.totalAmount,
        },
      },
    ],
    application_context: {
      brand_name: 'EventMate AI Concierge',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
    },
  };

  if (params.items && params.items.length > 0) {
    body.purchase_units[0].items = params.items;
    body.purchase_units[0].amount.breakdown = {
      item_total: {
        currency_code: currency,
        value: params.totalAmount,
      },
    };
  }

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`PayPal Create Order Error: ${JSON.stringify(data)}`);
  }

  return data;
}

/**
 * Capture a PayPal Order
 */
export async function capturePayPalOrder(orderId: string) {
  const token = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`PayPal Capture Order Error: ${JSON.stringify(data)}`);
  }

  return data;
}
