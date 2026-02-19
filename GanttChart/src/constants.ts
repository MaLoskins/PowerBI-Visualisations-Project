import type { ZoomLevel } from "./types";

export const MIN_BAR_WIDTH = 2;
export const DAY_MS = 86_400_000;

/** Visible-row buffer for scroll virtualization (G3) */

export const ZOOM_PX_PER_DAY: Record<Exclude<ZoomLevel, "fit">, number> = {
    day: 50,
    week: 18,
    month: 5,
    quarter: 2,
    year: 0.6,
};

/*  ── Resource palette ──────────────────────────
    Vibrant but balanced — designed for clear
    differentiation on light backgrounds while
    remaining professional. WCAG AA contrast
    against white bar labels.
    ────────────────────────────────────────────── */
export const RESOURCE_COLORS = [
    "#3B82F6", // blue-500
    "#F59E0B", // amber-500
    "#10B981", // emerald-500
    "#8B5CF6", // violet-500
    "#EF4444", // red-500
    "#06B6D4", // cyan-500
    "#F97316", // orange-500
    "#EC4899", // pink-500
    "#6366F1", // indigo-500
    "#14B8A6", // teal-500
    "#84CC16", // lime-500
    "#A855F7", // purple-500
    "#0EA5E9", // sky-500
    "#D946EF", // fuchsia-500
    "#78716C", // stone-500
] as const;

/*  ── Status palette ────────────────────────────
    Semantic colours aligned with standard RAG
    conventions. Each status maps to an intuitive
    colour so readers understand state at a glance.
    ────────────────────────────────────────────── */
export const STATUS_COLORS: Record<string, string> = {
    "not started": "#94A3B8", // slate-400    – neutral/unstarted
    "in progress": "#3B82F6", // blue-500     – active work
    "complete":    "#10B981", // emerald-500  – success
    "completed":   "#10B981",
    "done":        "#10B981",
    "on hold":     "#F59E0B", // amber-500    – caution/paused
    "delayed":     "#EF4444", // red-500      – danger
    "at risk":     "#F97316", // orange-500   – warning
    "cancelled":   "#64748B", // slate-500    – deactivated
    "blocked":     "#DC2626", // red-600      – critical blocker
};

/*  ── Milestone markers ─────────────────────────
    Bold shapes that remain legible at small sizes.
    Ordered so adjacent milestones are visually
    distinguishable by both colour and shape.
    ────────────────────────────────────────────── */
export const MILESTONE_STYLES: ReadonlyArray<{ color: string; shape: string }> = [
    { color: "#EF4444", shape: "diamond"  },  // red
    { color: "#3B82F6", shape: "circle"   },  // blue
    { color: "#10B981", shape: "triangle" },  // emerald
    { color: "#F59E0B", shape: "star"     },  // amber
    { color: "#8B5CF6", shape: "diamond"  },  // violet
    { color: "#06B6D4", shape: "circle"   },  // cyan
    { color: "#F97316", shape: "triangle" },  // orange
    { color: "#EC4899", shape: "star"     },  // pink
    { color: "#6366F1", shape: "diamond"  },  // indigo
    { color: "#14B8A6", shape: "circle"   },  // teal
];