/* ═══════════════════════════════════════════════
   Linear Gauge – Constants
   Palette arrays, magic numbers, shared config
   ═══════════════════════════════════════════════ */
"use strict";

/* ── Resource & Category Palette (15 colours, WCAG AA) ── */

export const RESOURCE_COLORS = [
    "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444",
    "#06B6D4", "#F97316", "#EC4899", "#6366F1", "#14B8A6",
    "#84CC16", "#A855F7", "#0EA5E9", "#D946EF", "#78716C",
] as const;

/* ── Status Palette ── */

export const STATUS_COLORS: Record<string, string> = {
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    neutral: "#64748B",
};

/* ── Layout Defaults ── */

export const DEFAULT_GAUGE_HEIGHT = 24;
export const DEFAULT_GAUGE_SPACING = 12;
export const DEFAULT_CORNER_RADIUS = 4;
export const DEFAULT_CATEGORY_WIDTH = 100;

/* ── Range Band Opacity ── */

export const RANGE_BAND_OPACITY = 0.2;

/* ── Animation ── */

export const BAR_ANIMATION_DURATION_MS = 400;

/* ── Selection Dimming ── */

export const UNSELECTED_OPACITY = 0.25;

/* ── Label Padding ── */

export const LABEL_PADDING_H = 6;
export const LABEL_PADDING_V = 4;
export const MIN_MAX_LABEL_PADDING = 4;

/* ── Error Messages ── */

export const ERROR_NO_VALUE = "Required fields missing.\nAdd at least a Value measure.";
