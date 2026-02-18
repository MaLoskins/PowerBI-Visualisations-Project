/*
 *  Bullet Chart – Power BI Custom Visual
 *  src/constants.ts
 *
 *  Palette arrays, magic numbers, shared config.
 */
"use strict";

/* ═══════════════════════════════════════════════
   Shared Colour Palettes
   ═══════════════════════════════════════════════ */

export const RESOURCE_COLORS = [
    "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444",
    "#06B6D4", "#F97316", "#EC4899", "#6366F1", "#14B8A6",
    "#84CC16", "#A855F7", "#0EA5E9", "#D946EF", "#78716C",
] as const;

export const STATUS_COLORS: Record<string, string> = {
    good: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
};

/* ═══════════════════════════════════════════════
   Slate Palette
   ═══════════════════════════════════════════════ */

export const SLATE = {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
} as const;

/* ═══════════════════════════════════════════════
   Layout Defaults & Limits
   ═══════════════════════════════════════════════ */

/** Axis height (horizontal) or width (vertical) reserved for tick labels */
export const AXIS_AREA_SIZE = 28;

/** Minimum axis tick spacing in pixels */
export const MIN_TICK_SPACING = 50;

/** Selection dim opacity for unselected items */
export const DIM_OPACITY = 0.25;

/** Row stripe colours */
export const ROW_EVEN_BG = "#FFFFFF";
export const ROW_ODD_BG = "#F8FAFC";

/** Error overlay padding */
export const ERROR_PADDING = 24;
