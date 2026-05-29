"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  Tag,
  Sparkles,
  X,
  ChevronDown,
  Check,
} from "lucide-react";

interface SidebarProps {
  sortOptions: { value: string; label: string }[];
  sortUrls: Record<string, string>;
  categories: [string, string][];
  categoryUrls: Record<string, string>;
  conditions: [string, string][];
  conditionUrls: Record<string, string>;
  activeSort: string;
  activeCategory?: string;
  activeCondition?: string;
  hasFilters: boolean;
}

/* ── Ripple hook ──────────────────────────────────────────── */
function useRipple() {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  function spawn(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 600);
  }

  return { ripples, spawn };
}

/* ── Single filter item ───────────────────────────────────── */
function FilterItem({
  href,
  label,
  active,
  color = "indigo",
}: {
  href: string;
  label: string;
  active: boolean;
  color?: "indigo" | "amber" | "green";
}) {
  const { ripples, spawn } = useRipple();
  const [pressed, setPressed] = useState(false);

  const palette = {
    indigo: {
      bg: "rgba(99,102,241,0.14)",
      border: "rgba(99,102,241,0.4)",
      text: "hsl(239 84% 77%)",
      ripple: "rgba(99,102,241,0.25)",
      dot: "hsl(239 84% 65%)",
    },
    amber: {
      bg: "rgba(245,167,30,0.12)",
      border: "rgba(245,167,30,0.35)",
      text: "hsl(42 95% 68%)",
      ripple: "rgba(245,167,30,0.25)",
      dot: "hsl(42 95% 58%)",
    },
    green: {
      bg: "rgba(52,211,153,0.1)",
      border: "rgba(52,211,153,0.3)",
      text: "hsl(160 70% 65%)",
      ripple: "rgba(52,211,153,0.2)",
      dot: "hsl(160 70% 55%)",
    },
  }[color];

  return (
    <Link
      href={href}
      onMouseDown={(e) => {
        setPressed(true);
        spawn(e);
      }}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      className="relative flex items-center justify-between px-3 py-2 rounded-xl text-sm overflow-hidden select-none group"
      style={{
        background: active ? palette.bg : "transparent",
        border: `1px solid ${active ? palette.border : "transparent"}`,
        color: active ? palette.text : "hsl(215 20% 58%)",
        boxShadow: active ? `0 2px 16px ${palette.ripple}` : "none",
        transform: pressed ? "scale(0.96)" : "scale(1)",
        transition:
          "transform 0.1s ease, background 0.18s ease, border-color 0.18s ease, color 0.18s ease, box-shadow 0.2s ease",
      }}
    >
      {/* Hover shimmer for inactive items */}
      {!active && (
        <span
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
      )}

      {/* Ripple circles */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: r.x - 40,
            top: r.y - 40,
            width: 80,
            height: 80,
            background: active ? palette.ripple : "rgba(255,255,255,0.07)",
            animation: "sidebar-ripple 0.55s ease-out forwards",
          }}
        />
      ))}

      <span className="relative z-10 font-medium leading-none">{label}</span>

      {/* Active checkmark badge */}
      {active ? (
        <span
          className="relative z-10 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: palette.dot }}
        >
          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        </span>
      ) : (
        /* Subtle dot placeholder so layout doesn't shift */
        <span className="w-4 h-4 flex-shrink-0" />
      )}
    </Link>
  );
}

/* ── Collapsible section wrapper ─────────────────────────── */
function SidebarSection({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 group hover:bg-white/[0.02] transition-colors duration-150"
        style={{ color: "hsl(213 31% 88%)" }}
      >
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
          <span
            className="w-5 h-5 flex items-center justify-center rounded-md"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            {icon}
          </span>
          {title}
        </span>
        <ChevronDown
          className="w-3.5 h-3.5 transition-transform duration-300"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            color: "hsl(215 20% 42%)",
          }}
        />
      </button>

      {/* Smooth slide open/close */}
      <div
        style={{
          maxHeight: open ? "800px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.32s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="px-2 pb-3 space-y-0.5">{children}</div>
      </div>
    </div>
  );
}

/* ── Main sidebar ────────────────────────────────────────── */
export function AuctionSidebar({
  sortOptions,
  sortUrls,
  categories,
  categoryUrls,
  conditions,
  conditionUrls,
  activeSort,
  activeCategory,
  activeCondition,
  hasFilters,
}: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 gap-3">
      {/* Sort By */}
      <SidebarSection
        title="Sort By"
        icon={<ArrowUpDown className="w-3 h-3" style={{ color: "hsl(239 84% 75%)" }} />}
      >
        {sortOptions.map((opt) => (
          <FilterItem
            key={opt.value}
            href={sortUrls[opt.value] ?? "#"}
            label={opt.label}
            active={activeSort === opt.value}
            color="indigo"
          />
        ))}
      </SidebarSection>

      {/* Category */}
      <SidebarSection
        title="Category"
        icon={<Tag className="w-3 h-3" style={{ color: "hsl(42 95% 65%)" }} />}
        defaultOpen={!!activeCategory}
      >
        {categories.map(([value, label]) => (
          <FilterItem
            key={value}
            href={categoryUrls[value] ?? "#"}
            label={label}
            active={activeCategory === value}
            color="amber"
          />
        ))}
      </SidebarSection>

      {/* Condition */}
      <SidebarSection
        title="Condition"
        icon={<Sparkles className="w-3 h-3" style={{ color: "hsl(142 71% 55%)" }} />}
        defaultOpen={!!activeCondition}
      >
        {conditions.map(([value, label]) => (
          <FilterItem
            key={value}
            href={conditionUrls[value] ?? "#"}
            label={label}
            active={activeCondition === value}
            color="green"
          />
        ))}
      </SidebarSection>

      {/* Clear Filters */}
      {hasFilters && (
        <Link
          href="/auctions"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.96]"
          style={{
            background: "rgba(220,60,60,0.08)",
            border: "1px solid rgba(220,60,60,0.2)",
            color: "hsl(0 84% 68%)",
          }}
        >
          <X className="w-3.5 h-3.5" />
          Clear Filters
        </Link>
      )}

      {/* Global ripple keyframe */}
      <style>{`
        @keyframes sidebar-ripple {
          from { transform: scale(0);   opacity: 0.6; }
          to   { transform: scale(3.8); opacity: 0;   }
        }
      `}</style>
    </aside>
  );
}
