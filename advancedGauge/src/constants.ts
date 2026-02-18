/* ═══════════════════════════════════════════════
   Advanced Gauge – Constants
   Palette arrays, magic numbers, shared config
   ═══════════════════════════════════════════════ */
"use strict";

/* ── Resource & Category Palette (shared across visuals) ── */

export const RESOURCE_COLORS = [
    "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444",
    "#06B6D4", "#F97316", "#EC4899", "#6366F1", "#14B8A6",
    "#84CC16", "#A855F7", "#0EA5E9", "#D946EF", "#78716C",
] as const;

/* ── Status Palette ── */

export const STATUS_COLORS: Record<string, string> = {
    complete: "#10B981",
    success: "#10B981",
    good: "#10B981",
    onTrack: "#10B981",
    warning: "#F59E0B",
    atRisk: "#F97316",
    caution: "#F59E0B",
    onHold: "#F59E0B",
    danger: "#EF4444",
    critical: "#DC2626",
    blocked: "#DC2626",
    cancelled: "#64748B",
};

/* ── Slate + Blue Palette Tokens ── */

export const SLATE_50 = "#F8FAFC";
export const SLATE_100 = "#F1F5F9";
export const SLATE_200 = "#E2E8F0";
export const SLATE_300 = "#CBD5E1";
export const SLATE_400 = "#94A3B8";
export const SLATE_500 = "#64748B";
export const SLATE_700 = "#334155";
export const SLATE_800 = "#1E293B";

export const BLUE_500 = "#3B82F6";
export const BLUE_600 = "#2563EB";

export const EMERALD_500 = "#10B981";
export const AMBER_500 = "#F59E0B";
export const RED_500 = "#EF4444";

/* ── Gauge-Specific Constants ── */

/** Degrees-to-radians conversion factor */
export const DEG_TO_RAD = Math.PI / 180;

/** Default angle span */
export const DEFAULT_START_ANGLE_DEG = -135;
export const DEFAULT_END_ANGLE_DEG = 135;

/** Minimum margin around the SVG content (px) */
export const GAUGE_MARGIN = 16;

/** Error message when Value field is missing */
export const ERROR_MISSING_VALUE =
    "Required field missing.\nAdd a Value measure to display the gauge.";

/** CSS class prefix */
export const CSS_PREFIX = "agauge-";
