/* ═══════════════════════════════════════════════
   WaterfallChart - Constants
   Palette arrays, magic numbers, shared config
   ═══════════════════════════════════════════════ */

"use strict";

/* ── Resource & Category Palette (shared across all visuals) ── */

export const RESOURCE_COLORS = [
    "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444",
    "#06B6D4", "#F97316", "#EC4899", "#6366F1", "#14B8A6",
    "#84CC16", "#A855F7", "#0EA5E9", "#D946EF", "#78716C",
] as const;

/* ── Status Palette ── */

export const STATUS_COLORS: Record<string, string> = {
    complete: "#10B981",
    inProgress: "#3B82F6",
    onHold: "#F59E0B",
    atRisk: "#F97316",
    blocked: "#DC2626",
    cancelled: "#64748B",
};

/* ── Slate Palette ── */

export const SLATE = {
    50:  "#F8FAFC",
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

/* ── Semantic Colours ── */

export const SEMANTIC = {
    emerald500: "#10B981",
    red500:     "#EF4444",
    red600:     "#DC2626",
    amber500:   "#F59E0B",
    orange500:  "#F97316",
    blue500:    "#3B82F6",
    blue600:    "#2563EB",
    blue700:    "#1D4ED8",
} as const;

/* ── Chart layout constants ── */

export const CHART_MARGINS = {
    top: 20,
    right: 20,
    bottom: 60,
    left: 60,
} as const;

/** Minimum bar height in pixels before label switches to "above" in auto mode */
export const MIN_BAR_HEIGHT_FOR_INSIDE_LABEL = 24;

/** Legend swatch dimensions */
export const LEGEND_SWATCH_SIZE = 12;
export const LEGEND_ITEM_GAP = 20;
export const LEGEND_HEIGHT = 30;

/** Dimmed opacity for unselected bars */
export const UNSELECTED_OPACITY = 0.25;

/** CSS class prefix for this visual */
export const CSS_PREFIX = "waterfall-";

/** Font stack matching Power BI system fonts */
export const FONT_STACK = '"Segoe UI", "wf_segoe-ui_normal", "Helvetica Neue", Helvetica, Arial, sans-serif';
