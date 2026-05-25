import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '../lib/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Script from 'next/script';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Minimal Shop | Demo Cửa Hàng Basics Thời Trang',
  description: 'Thương hiệu thời trang tối giản basics, chất liệu cotton organic thoáng mát, thiết kế thanh lịch cho cuộc sống hàng ngày.',
  keywords: ['basics', 'thời trang basics', 'minimal shop', 'áo thun basic', 'áo sơ mi basic'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${outfit.variable} ${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-neutral-50 text-neutral-800">
        {/* Google Analytics 4 Script Tag */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-98DRW31N5G"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-98DRW31N5G', {
              page_path: window.location.pathname,
            });
          `}
        </Script>

        <CartProvider>
          <Navbar />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
