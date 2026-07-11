import React from 'react';
import type { Metadata } from 'next';
import '../index.css';
import QueryProvider from '../components/providers/query-provider';
import { AlertProvider } from '../context/AlertContext';
import RouterBridge from '../components/RouterBridge';

export const metadata: Metadata = {
  title: "Hitha (හිත) - Privacy-First Mental Health Support Sri Lanka",
  description: "Sri Lanka's local, privacy-first telehealth directory. Fully compliant with SLMC guidelines & safe trilingual care.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <QueryProvider>
          <AlertProvider>
            <RouterBridge />
            {children}
          </AlertProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
