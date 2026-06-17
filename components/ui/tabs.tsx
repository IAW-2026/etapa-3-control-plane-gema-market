export type TabItem = {
  id: string;
  label: string;
  count?: number;
};

export type TabsProps = {
  tabs: ReadonlyArray<TabItem>;
  active: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
};

export function Tabs({ tabs, active, onChange, ariaLabel }: TabsProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex gap-1 border-b border-line overflow-x-auto max-w-full no-scrollbar [-webkit-overflow-scrolling:touch]"
    >
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            aria-pressed={isActive}
            className={`px-4 py-3 text-sm font-medium -mb-px flex items-center gap-2 whitespace-nowrap shrink-0 max-[520px]:px-2.5 max-[520px]:text-[13px] max-[520px]:gap-1.5 ${isActive ? "text-ink border-b-2 border-forest" : "text-ink-3 border-b-2 border-transparent"}`}
          >
            {t.label}
            {t.count != null && (
              <span
                className={`text-[11px] px-[7px] py-0.5 rounded-full font-semibold ${isActive ? "bg-forest text-paper" : "bg-bone text-ink-3"}`}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
