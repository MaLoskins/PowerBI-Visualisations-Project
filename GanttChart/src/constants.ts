import type { ZoomLevel } from "./types";

export const MIN_BAR_WIDTH = 2;
export const DAY_MS = 86_400_000;

/* Scroll / layout */
export const FIT_ZOOM_PADDING_PX  = 20;   // px deducted from available width when zoom = "fit"
export const FIT_ZOOM_MIN_PX      = 20;   // minimum available width for fit-zoom calc
export const FIT_ZOOM_MIN_PPD     = 0.1;  // minimum px-per-day for fit-zoom
export const GRID_RESIZE_MIN_PX   = 100;  // minimum grid pane width when dragging resize handle
export const GRID_RESIZE_MAX_PX   = 800;  // maximum grid pane width when dragging resize handle
export const SCROLL_TO_TODAY_FRAC = 1 / 3; // fraction of viewport width to leave left of today marker

/* Timeline rendering */
export const PPD_THRESHOLD_DAY    = 30;   // px-per-day above which bottom ticks show individual days
export const PPD_THRESHOLD_WEEK   = 8;    // px-per-day above which bottom ticks show weeks
export const PPD_THRESHOLD_MONTH  = 2;    // px-per-day above which bottom ticks show months
export const PPD_THRESHOLD_TOP_DAY = 15;  // px-per-day above which top ticks show full month name
export const PPD_THRESHOLD_WEEKEND = 1.5; // minimum px-per-day to bother rendering weekend bands

/* Header layout */
export const HEADER_TOP_LABEL_Y_FRAC = 0.4; // vertical fraction for top-tier tick text
export const HEADER_TOP_LABEL_MAX_Y  = 16;  // maximum y-offset for top-tier tick text (px)
export const HEADER_AXIS_LINE_WIDTH  = 1;   // stroke-width for header axis lines

/* Bar rendering */
export const PROGRESS_LABEL_MIN_BAR_WIDTH = 35;  // minimum bar width (px) before hiding inline progress label
export const BAR_LABEL_AUTO_INSIDE_WIDTH  = 80;  // minimum bar width for auto-inside label placement
export const DEP_ORTHO_OFFSET_PX          = 12;  // horizontal stub offset for orthogonal dependency routing
export const DEP_ARROW_MARKER_ID          = "gantt-arrow"; // SVG marker element id for dep arrows

/* Group bar rendering */
export const GROUP_THIN_LINE_WIDTH  = 3;  // stroke-width for "thin" group bar centre line
export const GROUP_THIN_CAP_WIDTH   = 2;  // stroke-width for "thin" group bar end-cap ticks
export const GROUP_THIN_CAP_HALF    = 4;  // half-height (px) of "thin" group bar end-cap ticks
export const GROUP_FLAT_HEIGHT_FRAC = 0.5; // bar-height fraction for "flat" group bar
export const GROUP_FLAT_OPACITY     = 0.7; // opacity for "flat" group bar fill
export const GROUP_BRACKET_H_FRAC  = 0.4; // bar-height fraction for "bracket" group body
export const GROUP_BRACKET_MAX_CAP = 6;   // maximum bracket cap width in px

/* Milestone / bottom stripe */
export const STRIPE_HEIGHT_FRAC    = 0.2; // fraction of bar-height used for bottom-stripe progress
export const STRIPE_MIN_HEIGHT_PX  = 3;   // minimum bottom-stripe height in px
export const STRIPE_CORNER_RADIUS  = 1;   // rx/ry for bottom-stripe rect

/* Current-week highlight */
export const WEEK_HIGHLIGHT_OPACITY = 0.3;

/* Hierarchy */
export const MAX_HIERARCHY_DEPTH = 50; // guard against infinite recursion / circular refs

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
