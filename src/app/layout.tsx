import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Conversion Pulse',
  description:
    'Evolução temporal da taxa de conversão por canal sobre 9,5M de envios.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
