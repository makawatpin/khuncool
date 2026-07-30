import type { Metadata } from "next";
import AccountPage from "./AccountPage";

export const metadata: Metadata = {
  title: "บัญชีของฉัน | khuncool",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "https://www.khuncool.com/account",
  },
};

export default function Page() {
  return <AccountPage />;
}
