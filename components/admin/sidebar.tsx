"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/login/actions";

const NAV = [
  { group: "Website content", items: [
    { label: "Films", href: "/admin/films" },
    { label: "Gallery", href: "/admin/gallery" },
  ] },
];

function NavLink({ label, href, active, onClick }: { label: string; href: string; active: boolean; onClick?: () => void }) {
  if (active) {
    return (
      <span
        className="flex items-center gap-2.5 rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white"
        onClick={onClick}
        role="link"
        aria-current="page"
      >
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
    >
      {label}
    </Link>
  );
}

export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const drawer = (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-col gap-4 px-5 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <Image
            src="/mainlogo.png"
            alt="Kamakshi Cinema Photography"
            width={64}
            height={44}
            className="h-10 w-auto object-contain"
          />
          <span className="ml-auto flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
                <path d="M5.5 5.5 18.5 18.5M18.5 5.5 5.5 18.5" />
              </svg>
            </button>
          </span>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">
            Kamakshi
          </p>
          <p className="text-sm font-semibold">Studio CMS</p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-xs font-medium text-stone-700 transition-colors hover:border-stone-900 hover:text-stone-900"
        >
          View live website
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3M14 10l5-5m0 0h-4m4 0v4" />
          </svg>
        </a>
      </div>

      <hr className="border-stone-200/80" />

      <nav aria-label="Admin" className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6">
        {NAV.map(({ group, items }) => (
          <div key={group} className="flex flex-col gap-1.5">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">
              {group}
            </p>
            {items.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                onClick={() => setOpen(false)}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="px-4 pb-6">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            Sign out
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-stone-200/80 bg-white md:block">
        {drawer}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-stone-950/30"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-2xl">
            {drawer}
          </aside>
        </div>
      ) : null}

      <div className="md:hidden">
        <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-stone-200/80 bg-white px-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-stone-700 hover:bg-stone-100"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
              <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
            </svg>
          </button>
          <Image src="/mainlogo.png" alt="Studio CMS" width={56} height={40} className="h-7 w-auto object-contain" />
          <span className="ml-auto font-display text-lg font-medium">Studio CMS</span>
        </div>
      </div>

      <main className="min-h-dvh md:pl-64">
        <div className="md:hidden h-14" />
        {children}
      </main>
    </div>
  );
}
