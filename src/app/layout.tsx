import { Inter } from 'next/font/google';
import HeaderWrapper from '@/components/layout/HeaderWrapper';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Pet Care Services',
  description: 'Professional pet care services for your beloved companions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <HeaderWrapper />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
