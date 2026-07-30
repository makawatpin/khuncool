import type { Metadata } from "next";
import { Sarabun, Anuphan, Fredoka, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  AccountSheetProvider,
  AccountSheetOverlay,
} from "@/components/AccountSheet";
import { AuthProvider } from "@/lib/auth/AuthProvider";

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
});

const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "khuncool",
  description: "khuncool design handoff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sarabun.variable} ${anuphan.variable} ${fredoka.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <AccountSheetProvider>
            <Header />
            {children}
            <Footer />
            <AccountSheetOverlay />
          </AccountSheetProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
