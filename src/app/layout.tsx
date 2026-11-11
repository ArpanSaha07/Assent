import type { Metadata } from 'next';
import './globals.css';
import { PayPalProvider } from '@/components/PayPalProvider';

export const metadata: Metadata = {
  title: 'EventMate — AI Event Budget and Registration Agent',
  description: 'AI concierge helping students discover events within their interests and budget, and handle paid registration with PayPal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0b0f19] text-slate-100 antialiased">
        <PayPalProvider>
          {children}
        </PayPalProvider>
      </body>
    </html>
  );
}
