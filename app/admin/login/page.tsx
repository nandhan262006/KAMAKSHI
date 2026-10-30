import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { loginAction } from "./actions";

export const metadata: Metadata = {
  title: "Studio CMS — Admin Access",
  description: "Kamakshi Cinema Photography admin panel.",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#FAF9F6] px-6 py-16 text-[#141414]">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-stone-200/80 bg-white px-8 py-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:px-10">
          <div className="flex items-center gap-3">
            <Image
              src="/justlogo.png"
              alt="Kamakshi Cinema Photography"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">
                Admin access
              </p>
              <p className="font-display text-xl font-semibold">
                Kamakshi Studio CMS
              </p>
            </div>
          </div>

          <hr className="my-8 border-stone-200/80" />

          <form action={loginAction} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                Master password
              </span>
              <input
                type="password"
                name="password"
                required
                autoFocus
                className="rounded-xl border border-stone-300 bg-[#FAF9F6] px-4 py-3 text-sm outline-none transition-colors focus:border-stone-900 focus:bg-white"
              />
            </label>
            <button
              type="submit"
              className="rounded-xl bg-stone-900 px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-black"
            >
              Unlock Studio
            </button>
          </form>

          <Suspense fallback={null}>
            <LoginError searchParams={searchParams} />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-xs text-stone-400">
          Kamakshi Cinema Photography · Studio CMS
        </p>
      </div>
    </main>
  );
}

async function LoginError({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  return (await searchParams).e ? (
    <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-center text-xs font-medium text-red-600">
      Wrong master password. Try again.
    </p>
  ) : null;
}
