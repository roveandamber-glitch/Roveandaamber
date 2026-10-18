import '../index.css';

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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className="bg-[#F9F6F0] text-[#1A1A1A] font-sans antialiased selection:bg-[#B86526] selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
