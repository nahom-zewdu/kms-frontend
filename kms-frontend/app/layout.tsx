// app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KMS — Engineering onboarding, grounded in your codebase',
  description: 'KMS helps engineers find where to start in an unfamiliar codebase.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0a] text-[#f4f4f5] antialiased">
        {children}
      </body>
    </html>
  );
}
