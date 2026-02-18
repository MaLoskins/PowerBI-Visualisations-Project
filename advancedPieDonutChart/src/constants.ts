/*
 *  Advanced Pie / Donut Chart – Power BI Custom Visual
 *  constants.ts – Palette arrays, magic numbers, shared config
 */
"use strict";

/* ═══════════════════════════════════════════════
   Resource & Category Palette
   ═══════════════════════════════════════════════ */

export const RESOURCE_COLORS = [
    "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444",
    "#06B6D4", "#F97316", "#EC4899", "#6366F1", "#14B8A6",
    "#84CC16", "#A855F7", "#0EA5E9", "#D946EF", "#78716C",
] as const;

/* ═══════════════════════════════════════════════
   Status Palette
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

/** Minimum gap between outside labels (multiplied by font size) (L1) */
export const LABEL_GAP_FACTOR = 1.25;

/** Radial extension for leader line first segment (L2) */
export const LEADER_LINE_EXTEND = 12;

/** Horizontal extension for leader line second segment (L3) */
export const LEADER_LINE_HORIZONTAL = 18;

/** Padding around the chart area to make room for labels (L4) */
export const LABEL_PADDING = 60;

/** Padding around the chart area when labels are hidden */
export const CHART_PADDING = 16;

/** Minimum donut inner radius (pixels) for centre label (L5) */
export const MIN_CENTRE_LABEL_RADIUS = 30;

/** Legend item horizontal gap */
export const LEGEND_ITEM_GAP = 16;

/** Legend swatch size */
export const LEGEND_SWATCH_SIZE = 10;

/** Legend vertical padding */
export const LEGEND_PADDING = 8;

/** Hover scale factor */
export const HOVER_SCALE = 1.03;

/** Dim opacity for unselected slices during selection */
export const DIM_OPACITY = 0.3;

/** Full opacity */
export const FULL_OPACITY = 1.0;
