import type { Metadata } from "next";
import AdminDashboard from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Admin | khuncool",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminDashboard />;
}
