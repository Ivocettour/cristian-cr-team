"use client";

export interface TabItem {
  id: string;
  label: string;
}

export function Tabs({
  tabs,
  activeId,
  onChange,
}: {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="scroll-snap-x flex gap-2 overflow-x-auto border-b border-border-subtle px-4 sm:px-6">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`scroll-snap-item shrink-0 whitespace-nowrap border-b-2 px-3 py-3.5 font-heading text-sm tracking-wide transition-colors min-h-11 ${
              isActive
                ? "border-accent text-white"
                : "border-transparent text-foreground-muted hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
