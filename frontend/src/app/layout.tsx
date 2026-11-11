import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PayPalProvider } from '@/components/PayPalProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

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
    <html lang="en">
      <body className={`${inter.variable} min-h-screen bg-[#F5F7FA] text-[#2C2E2F] antialiased`}>
        <PayPalProvider>
          {children}
        </PayPalProvider>
      </body>
    </html>
  );
}
