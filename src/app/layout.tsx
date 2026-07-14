import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PhimHay - Phim HD Vietsub",
  description: "Trang web xem phim online Vietsub miễn phí",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} antialiased min-h-full`}>
      <body className="min-h-full flex flex-col bg-[var(--bg-color)]" suppressHydrationWarning>
        <Header />
        <main className="flex-grow w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
