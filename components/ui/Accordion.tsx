"use client";

import { useState, type ReactNode } from "react";

export function Accordion({
  title,
  subtitle,
  defaultOpen = true,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center justify-between gap-3 bg-gradient-to-r from-accent-dark to-accent px-4 py-3.5 text-left sm:px-6"
      >
        <span className="flex items-baseline gap-3">
          <span className="font-heading text-lg text-white">{title}</span>
          {subtitle && (
            <span className="font-body text-xs text-white/80">{subtitle}</span>
          )}
        </span>
        <svg
          className={`h-5 w-5 shrink-0 text-white transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.19l3.71-3.96a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && <div className="bg-panel">{children}</div>}
    </div>
  );
}
