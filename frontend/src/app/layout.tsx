import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "VibeSync Pro – AI Music for Your Videos",
  description:
    "Upload a video, get a perfectly-matched AI soundtrack in 30 seconds. Mood-matched, beat-synced, license-free.",
  metadataBase: new URL("https://vibesyncpro.vercel.app"),
  openGraph: {
    title: "VibeSync Pro – AI Music for Your Videos",
    description:
      "Upload a video, get a perfectly-matched AI soundtrack in 30 seconds. 3 variations. Smart audio mixing. License-free.",
    siteName: "VibeSync Pro",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VibeSync Pro – AI-composed soundtracks for your videos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeSync Pro – AI Music for Your Videos",
    description:
      "Upload a video, get a perfectly-matched AI soundtrack in 30 seconds.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
