import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Svensk Algeriska Föreningen',
  description: 'Svensk Algeriska Föreningen i Malmö',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv" dir="ltr" data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}