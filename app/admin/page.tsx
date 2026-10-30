import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { hasSession } from "@/lib/auth";

export const metadata = { title: "Studio CMS" };

export default function AdminIndexPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#FAF9F6]" />}>
      <AdminIndex />
    </Suspense>
  );
}

async function AdminIndex() {
  await connection();
  return redirect((await hasSession()) ? "/admin/films" : "/admin/login");
}
