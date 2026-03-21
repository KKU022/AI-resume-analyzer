import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import RouteWarmup from '@/components/providers/RouteWarmup';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

export const metadata = {
  title: 'Medha',
  description: 'AI-powered career intelligence platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <SessionProvider>
          <ToastProvider>
            <RouteWarmup />
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

