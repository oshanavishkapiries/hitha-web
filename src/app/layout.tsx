import React from 'react';
import type { Metadata } from 'next';
import '../index.css';

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
        {children}
      </body>
    </html>
  );
}
