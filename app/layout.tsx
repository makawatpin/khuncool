import type { Metadata, Viewport } from "next";
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

/* Games and tools go fullscreen on phones and tablets. `viewport-fit: cover`
   makes env(safe-area-inset-*) meaningful so those surfaces can keep clear of
   the notch and home indicator, and `interactiveWidget` keeps the on-screen
   keyboard from shrinking the layout viewport out from under a 100dvh stage
   (the typing games open a keyboard while playing). */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-visual",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.khuncool.com"),
  title: "khuncool - เครื่องมือครู สื่อการสอน ใช้ฟรี",
  description:
    "รวมเครื่องมือครูและสื่อการสอนออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง เช่น สุ่มชื่อนักเรียน จับเวลา แบ่งกลุ่ม และกระดานคะแนน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
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
