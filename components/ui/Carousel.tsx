"use client";

import { useRef, type ReactNode } from "react";

export function Carousel({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="scroll-snap-x flex gap-4 overflow-x-auto px-4 pb-2 sm:px-6"
      >
        {children}
      </div>
      <button
        aria-label="Anterior"
        onClick={() => scroll(-1)}
        className="absolute left-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 p-2 backdrop-blur hover:bg-black/80 sm:flex"
      >
        <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 010 1.06L8.56 10.5l4.23 4.21a.75.75 0 11-1.06 1.06l-4.76-4.75a.75.75 0 010-1.06l4.76-4.75a.75.75 0 011.06 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <button
        aria-label="Siguiente"
        onClick={() => scroll(1)}
        className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 p-2 backdrop-blur hover:bg-black/80 sm:flex"
      >
        <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 010-1.06l4.23-4.21-4.23-4.21a.75.75 0 111.06-1.06l4.76 4.75a.75.75 0 010 1.06l-4.76 4.75a.75.75 0 01-1.06 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
