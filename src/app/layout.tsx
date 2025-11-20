import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SessionProvider } from "@/components/providers/session-provider";
import { ScrollProgressWrapper } from "@/components/layout/scroll-progress-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Numera - Math Hub for Algebra 1",
  description: "Learn, Practice, Track. A comprehensive learning hub for Algebra 1 students.",
  manifest: "/manifest.json",
  themeColor: "#00A799",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <SessionProvider>
          <ScrollProgressWrapper />
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>
          <NavBar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
