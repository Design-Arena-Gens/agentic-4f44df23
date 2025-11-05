import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Happy Tomato',
  description: 'A hyper-realistic 3D tomato enjoying a slice',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
