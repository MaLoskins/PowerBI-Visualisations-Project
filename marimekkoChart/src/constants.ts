/*
 *  Marimekko Chart – Power BI Custom Visual
 *  constants.ts — Palette arrays, magic numbers, shared config
 */
"use strict";

/* ═══════════════════════════════════════════════
   Resource & Category Palette (shared across visuals)
   ═══════════════════════════════════════════════ */

export const RESOURCE_COLORS = [
    "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444",
    "#06B6D4", "#F97316", "#EC4899", "#6366F1", "#14B8A6",
    "#84CC16", "#A855F7", "#0EA5E9", "#D946EF", "#78716C",
] as const;

/** Pastel variant — softened versions of RESOURCE_COLORS */
export const PASTEL_COLORS = [
    "#93C5FD", "#FCD34D", "#6EE7B7", "#C4B5FD", "#FCA5A5",
    "#67E8F9", "#FDBA74", "#F9A8D4", "#A5B4FC", "#5EEAD4",
    "#BEF264", "#D8B4FE", "#7DD3FC", "#F0ABFC", "#A8A29E",
] as const;

/** Vivid variant — saturated/deeper versions */
export const VIVID_COLORS = [
    "#1D4ED8", "#D97706", "#047857", "#6D28D9", "#DC2626",
    "#0891B2", "#EA580C", "#DB2777", "#4338CA", "#0D9488",
    "#65A30D", "#7C3AED", "#0284C7", "#C026D3", "#57534E",
] as const;

/* ═══════════════════════════════════════════════
   Status Palette (shared across visuals)
   ═══════════════════════════════════════════════ */

export const STATUS_COLORS: Record<string, string> = {
    complete: "#10B981",
    inProgress: "#3B82F6",
    onHold: "#F59E0B",
    atRisk: "#F97316",
    blocked: "#DC2626",
    cancelled: "#64748B",
};

/* ═══════════════════════════════════════════════
   Layout Constants
   ═══════════════════════════════════════════════ */

/** Margin around the chart area (px) */
export const CHART_MARGINS = {
    top: 24,
    right: 12,
    bottom: 40,
    left: 48,
} as const;

/** Extra bottom margin when x-axis labels are rotated */
export const ROTATED_LABEL_EXTRA_BOTTOM = {
    "0": 0,
    "45": 24,
    "90": 40,
} as const;

/** Minimum segment pixel height to show any label */
export const MIN_LABEL_HEIGHT_FACTOR = 2;

/** Padding inside segment rect for label text */
export const LABEL_PADDING_PX = 4;

/** Legend item square size (px) */
export const LEGEND_SWATCH_SIZE = 12;

/** Legend item gap (px) */
export const LEGEND_ITEM_GAP = 16;

/** Legend area height when positioned top/bottom (px) */
export const LEGEND_AREA_HEIGHT = 28;

/** Legend area width when positioned right (px) */
export const LEGEND_AREA_WIDTH = 140;

/** Hatched pattern ID for negative values */
export const NEGATIVE_PATTERN_ID = "marimekko-hatch-negative";

/** Width-label offset above columns (px) */
export const WIDTH_LABEL_OFFSET_Y = 6;

/** Y-axis tick count */
export const Y_AXIS_TICKS = 5;

/** Error class name */
export const ERROR_CLASS = "marimekko-error";
