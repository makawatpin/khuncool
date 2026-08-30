import type { Metadata, Viewport } from "next";
import Script from "next/script";
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

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.khuncool.com"),
  ...(GSC_VERIFICATION && { verification: { google: GSC_VERIFICATION } }),
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
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8786409411860828"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* GA4. Absent unless NEXT_PUBLIC_GA_ID is set, so local runs and
            previews stay out of the reporting. Client-side navigations are
            counted by GA4's enhanced measurement (History events) rather than
            a router listener here. */}
        {GA_ID && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col">
        {/* Skip past the site navigation.
            ------------------------------
            Measured on the games: reaching a game's own start button took 27
            tab presses on one and 35 on another, because every link in the
            header comes first. Somebody playing with a keyboard pays that on
            every screen they open.

            The target is an empty anchor placed after the header rather than an
            id on each page's <main>. 48 of the 65 pages have a <main> and 17 do
            not, so the id approach means editing 48 files and still leaving a
            broken skip link on the rest. This is one file and covers every
            page. It is also layout-safe: pages render their <main> as a direct
            flex child of <body> with flex-1, so wrapping {children} in a div
            would break that, while a 0x0 flex item next to it changes nothing.

            Hidden until focused, so it costs sighted mouse users nothing. */}
        <a
          href="#kc-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-[#3F41C9] focus:shadow-lg focus:outline focus:outline-2 focus:outline-[#5C5EE6]"
        >
          ข้ามไปที่เนื้อหา
        </a>
        <AuthProvider>
          <AccountSheetProvider>
            <Header />
            <span id="kc-content" tabIndex={-1} />
            {children}
            <Footer />
            <AccountSheetOverlay />
          </AccountSheetProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
