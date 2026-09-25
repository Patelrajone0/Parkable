import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Parkable | Airbnb for Private Parking Spaces",
  description: "Monetize idle driveways or rent hourly parking spaces in congested cities. Mobile-first peer-to-peer parking marketplace.",
  keywords: ["parking marketplace", "rent parking spot", "hourly parking", "private driveway rental", "EV charging spot", "Parkable"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import ClientProviders from "@/components/providers/ClientProviders";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0e0d0c] text-[#f6f2ec] selection:bg-[#d4a373] selection:text-[#12100e]">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
