/* ═══════════════════════════════════════════════
   Multi-Axes Combo Chart — Constants
   ═══════════════════════════════════════════════ */
"use strict";

/* ── Resource & Category Palette (15 colours, WCAG AA) ── */

export const RESOURCE_COLORS = [
    "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444",
    "#06B6D4", "#F97316", "#EC4899", "#6366F1", "#14B8A6",
    "#84CC16", "#A855F7", "#0EA5E9", "#D946EF", "#78716C",
] as const;

/* ── Status Palette (semantic RAG) ── */

export const STATUS_COLORS: Record<string, string> = {
    complete: "#10B981",
    inProgress: "#3B82F6",
    onHold: "#F59E0B",
    atRisk: "#F97316",
    blocked: "#DC2626",
    cancelled: "#64748B",
};

/* ── Slate Palette Tokens ── */

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

/* ── Layout Constants ── */

export const MARGIN_TOP = 8;
export const MARGIN_BOTTOM = 8;
export const MARGIN_LEFT = 8;
export const MARGIN_RIGHT = 8;
export const Y_AXIS_WIDTH = 50;
export const X_AXIS_BASE_HEIGHT = 28;
export const LEGEND_HEIGHT = 28;
export const AXIS_LABEL_PAD = 16;
export const TICK_COUNT = 5;
export const BAR_PADDING_INNER = 0.2;
export const BAR_PADDING_OUTER = 0.1;
export const BAR_GROUP_PADDING = 0.1;
export const MIN_CHART_SIZE = 40;

/* ── Dash Patterns ── */

export const DASH_PATTERNS: Record<string, string> = {
    solid: "",
    dashed: "6,3",
    dotted: "2,2",
};

/* ── Default series chart types (M2) ── */

export const DEFAULT_CHART_TYPES = [
    "bar", "line", "area", "bar", "line", "area",
] as const;
