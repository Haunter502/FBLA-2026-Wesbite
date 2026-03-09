import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ScrollProgressWrapper } from "@/components/layout/scroll-progress-wrapper";
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Numera - The Online Learning Hub for Math",
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
  const themeScript = `
(function(){
  try {
    var k = 'numera-theme';
    var s = typeof localStorage !== 'undefined' && localStorage.getItem(k);
    if (!s) return;
    var p = { teal: { primary: '174 100% 47%', secondary: '174 100% 33%', accent: '174 100% 16%', ring: '174 100% 47%' }, red: { primary: '0 84% 55%', secondary: '0 72% 45%', accent: '0 65% 30%', ring: '0 84% 55%' }, orange: { primary: '30 100% 55%', secondary: '30 100% 45%', accent: '30 90% 28%', ring: '30 100% 55%' }, green: { primary: '142 71% 45%', secondary: '142 71% 38%', accent: '142 60% 22%', ring: '142 71% 45%' }, blue: { primary: '217 91% 60%', secondary: '217 91% 50%', accent: '217 80% 28%', ring: '217 91% 60%' }, purple: { primary: '270 70% 58%', secondary: '270 70% 48%', accent: '270 60% 28%', ring: '270 70% 58%' }, pink: { primary: '330 81% 60%', secondary: '330 75% 50%', accent: '330 65% 30%', ring: '330 81% 60%' } };
    var id = s.trim();
    if (p[id]) {
      var c = p[id];
      document.documentElement.style.setProperty('--primary', c.primary);
      document.documentElement.style.setProperty('--secondary', c.secondary);
      document.documentElement.style.setProperty('--accent', c.accent);
      document.documentElement.style.setProperty('--ring', c.ring);
    }
  } catch (e) {}
})();
`;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <SessionProvider>
          <ThemeProvider>
            <ScrollProgressWrapper />
            <a href="#main-content" className="skip-to-content">
              Skip to main content
            </a>
            <NavBar />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
            <ChatbotWidget />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
