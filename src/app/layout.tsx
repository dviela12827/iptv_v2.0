import type { Metadata } from 'next';
import { Syne, Inter } from 'next/font/google';
import './globals.css';

const syne = Syne({ subsets: ['latin'], variable: '--font-syne' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'RedFlix - O Melhor do Streaming',
  description: 'Filmes, Séries e TV Ao Vivo com qualidade e economia.',
  icons: {
    icon: 'https://i.imgur.com/mq59DAj.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} ${syne.variable} antialiased selection:bg-[#E50914] selection:text-white bg-black`}>
        {children}
      </body>
    </html>
  );
}
