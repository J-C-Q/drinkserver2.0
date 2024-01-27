import type { Metadata } from "next";
import type { Viewport } from "next";

import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Drink Server 2.0",
  description: "Monitor Your Drink Intake Effortlessly",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "Drink Server",
    statusBarStyle: "black-translucent",
    startupImage: ["/drinkserverLogoBlank.png"],
  },
  openGraph: {
    title: "Drink Server 2.0",
    description: "Monitor Your Drink Intake Effortlessly",
    type: "website",
    siteName: "Drink Server 2.0",
    locale: "en_IE",
    url: "https://drinkserver2.vercel.app/",
    images: [
      {
        url: "/icon-512x512.png",
        width: 800,
        height: 600,
        alt: "Drink Server Logo",
      },
      {
        url: "/icon-512x512.png",
        width: 1800,
        height: 1600,
        alt: "Drink Server Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Drink Server 2.0",
    description: "Monitor Your Drink Intake Effortlessly",
    images: ["/icon-512x512.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#1E2835",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
