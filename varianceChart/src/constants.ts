/* ═══════════════════════════════════════════════
   constants.ts - Palette arrays, magic numbers, shared config
   ═══════════════════════════════════════════════ */
"use strict";

/* ── Resource & Category Palette ── */

export const RESOURCE_COLORS = [
    "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444",
    "#06B6D4", "#F97316", "#EC4899", "#6366F1", "#14B8A6",
    "#84CC16", "#A855F7", "#0EA5E9", "#D946EF", "#78716C",
] as const;

/* ── Status Palette ── */

export const STATUS_COLORS: Record<string, string> = {
    complete:   "#10B981",
    onTrack:    "#3B82F6",
    atRisk:     "#F97316",
    onHold:     "#F59E0B",
    blocked:    "#DC2626",
    cancelled:  "#64748B",
};

/* ── Slate Design System Tokens ── */

export const SLATE = {
    s50:  "#F8FAFC",
    s100: "#F1F5F9",
    s200: "#E2E8F0",
    s300: "#CBD5E1",
    s400: "#94A3B8",
    s500: "#64748B",
    s600: "#475569",
    s700: "#334155",
    s800: "#1E293B",
    s900: "#0F172A",
} as const;

export const BLUE = {
    b50:  "#EFF6FF",
    b500: "#3B82F6",
    b600: "#2563EB",
    b700: "#1D4ED8",
} as const;

/* ── Chart Layout Constants ── */

/** Minimum margin for axes and labels */
export const MARGIN = {
    top: 8,
    right: 12,
    bottom: 40,
    left: 50,
} as const;

/** Legend height in px */
export const LEGEND_HEIGHT = 28;

/** Minimum band width before enabling scroll */
export const MIN_BAND_PX = 24;

/** Arrow indicator size */
export const ARROW_SIZE = 6;

/** Lollipop circle radius */
export const LOLLIPOP_RADIUS = 4;

/** DIM opacity for unselected items */
export const DIM_OPACITY = 0.25;

/** Error message when required fields are missing */
export const ERROR_MISSING_FIELDS =
    "Required fields missing.\nAdd at least Category, Actual, and Budget fields.";

/** CSS prefix for this visual */
export const CSS_PREFIX = "variance-";
