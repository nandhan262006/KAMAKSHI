import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { hasSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata: Metadata = {
  title: "Studio CMS",
  robots: { index: false, follow: false, nocache: true },
};

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

async function AuthGate({ children }: { children: React.ReactNode }) {
  await connection();
  if (!(await hasSession())) {
    redirect("/admin/login");
  }
  return <>{children}</>;
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#FAF9F6]" />}>
      <AuthGate>
        <div
          className={`${jakarta.variable} admin-shell min-h-dvh bg-[#FAF9F6] text-[#141414]`}
        >
          <AdminSidebar>{children}</AdminSidebar>
        </div>
      </AuthGate>
    </Suspense>
  );
}
