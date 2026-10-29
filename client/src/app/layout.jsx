import '../index.css';
import BottomNav from '@/components/layout/BottomNav';

export const metadata = {
  title: 'ROVE & AMBER | Fine Fragrance & Artisanal Perfumery',
  description: 'Crafting Signature Eau de Parfum. Explore fine fragrances crafted to leave a lasting impression by ROVE & AMBER.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600;1,700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.png" />
      </head>
      <body
        className="bg-[#FAF9F7] text-[#1A1A1A] font-sans antialiased selection:bg-[#B8860B] selection:text-white overflow-x-hidden w-full"
        suppressHydrationWarning
      >
        <div className="min-h-screen pb-16 md:pb-0 overflow-x-hidden w-full">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
