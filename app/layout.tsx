import type { Metadata } from "next";
import "./globals.css";
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: "BookingApp",
  description: "Booking management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* header added globally */}
        <Header />
        {children}
      </body>
    </html>
  );
}
