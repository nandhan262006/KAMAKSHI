"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { hasSession, endSession, startSession } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD ?? "admin";

  if (password !== expected || password.length === 0) {
    redirect("/admin/login?e=1");
  }

  await startSession();
  revalidateTag("content", { expire: 0 });
  redirect("/admin/films");
}

export async function logoutAction() {
  if (await hasSession()) {
    await endSession();
  }
  redirect("/admin/login");
}
