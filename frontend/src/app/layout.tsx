import type { Metadata } from "next";
import { DM_Sans, Fraunces, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { Providers } from "./providers";
import { PostHogProvider } from "@/providers/PostHogProvider";
import { PageTracker } from "@/components/PageTracker";
import { UserProvider } from "@/contexts/UserContext";
import "../styles/globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hourbloc.com"),
  title: "Hourbloc",
  description: "Hourbloc helps you plan your day with time blocks and tracks what actually happens. See honest analytics about where your time goes, build awareness of your patterns, and make each hour more intentional.",
  icons: {
    icon: "/logo-trans.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hourbloc.com",
    siteName: "Hourbloc",
    title: "Hourbloc - Time Block Planning & Honest Analytics",
    description: "Hourbloc helps you plan your day with time blocks and tracks what actually happens. See honest analytics about where your time goes, build awareness of your patterns, and make each hour more intentional.",
    images: [
      {
        url: "/icon.png",
        width: 1200,
        height: 630,
        alt: "Hourbloc",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hourbloc - Time Block Planning & Honest Analytics",
    description: "Hourbloc helps you plan your day with time blocks and tracks what actually happens. See honest analytics about where your time goes, build awareness of your patterns, and make each hour more intentional.",
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${fraunces.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <PostHogProvider>
          <Suspense fallback={null}>
            <PageTracker />
          </Suspense>
          <Providers>
            <UserProvider>
              {children}
              <Analytics />
            </UserProvider>
          </Providers>
        </PostHogProvider>
      </body>
    </html>
  );
}
