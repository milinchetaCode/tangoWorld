import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToastProvider from "@/components/ToastProvider";
import ClientErrorBoundary from "@/components/ClientErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TangoWorld - Discover the World of Tango",
  description: "Find the best tango marathons and festivals globally. Your next tanda awaits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* BEGIN Travelpayouts reference program - remove this block if no longer needed */}
        <Script
          strategy="afterInteractive"
          src="https://c121.travelpayouts.com/content?trs=279710&shmarker=279710&locale=en&curr=USD&powered_by=true&promo_id=4132"
        />
        {/* END Travelpayouts reference program */}
        <ToastProvider />
        <ClientErrorBoundary>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </ClientErrorBoundary>
      </body>
    </html>
  );
}
