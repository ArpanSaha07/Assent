'use client';

import React from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const clientId =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
  'ASCWKgLUxv39Z1E_0ha-B0mpNAhKFdVbmUzAqtR1seQJ47NYIwDjk1BnQexImp-zA_ly99bN-Zy0qNye';

export const PayPalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PayPalScriptProvider
      options={{
        clientId: clientId,
        currency: 'USD',
        intent: 'capture',
        components: 'buttons',
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
};
