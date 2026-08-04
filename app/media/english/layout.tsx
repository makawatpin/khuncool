import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ENGLISH_OG_IMAGE } from "./seo";

export const metadata: Metadata = {
  authors: [{ name: "Khuncool", url: "https://www.khuncool.com" }],
  creator: "Khuncool",
  publisher: "Khuncool",
  openGraph: {
    images: [ENGLISH_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    images: [ENGLISH_OG_IMAGE.url],
  },
};

export default function EnglishMediaLayout({ children }: { children: ReactNode }) {
  return children;
}
