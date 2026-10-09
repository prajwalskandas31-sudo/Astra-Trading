import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Astra Trading | Super Admin Mission Control",
  description: "Elite Mission Control Terminal for User Management, Multi-Broker Gateways, Live Order Placement & Automated Alerts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} font-sans min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
