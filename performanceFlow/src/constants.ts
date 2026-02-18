/*
 *  Performance Flow (Sankey Diagram) — Power BI Custom Visual
 *  constants.ts — Palette arrays, magic numbers, shared config
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
   Status Palette (RAG)
   ═══════════════════════════════════════════════ */

export const STATUS_COLORS: Record<string, string> = {
    complete: "#10B981",
    success: "#10B981",
    inProgress: "#3B82F6",
    onHold: "#F59E0B",
    atRisk: "#F97316",
    blocked: "#DC2626",
    cancelled: "#64748B",
};

/* ═══════════════════════════════════════════════
   Slate Design System Colours
   ═══════════════════════════════════════════════ */

export const SLATE_50 = "#F8FAFC";
export const SLATE_100 = "#F1F5F9";
export const SLATE_200 = "#E2E8F0";
export const SLATE_300 = "#CBD5E1";
export const SLATE_400 = "#94A3B8";
export const SLATE_500 = "#64748B";
export const SLATE_600 = "#475569";
export const SLATE_700 = "#334155";
export const SLATE_800 = "#1E293B";
export const SLATE_900 = "#0F172A";

export const BLUE_50 = "#EFF6FF";
export const BLUE_500 = "#3B82F6";
export const BLUE_600 = "#2563EB";
export const BLUE_700 = "#1D4ED8";

/* ═══════════════════════════════════════════════
   Layout Constants
   ═══════════════════════════════════════════════ */

/** Minimum chart margin (px) */
export const CHART_MARGIN = { top: 12, right: 16, bottom: 12, left: 16 };

/** Minimum viable dimension for the SVG to render */
export const MIN_CHART_WIDTH = 100;
export const MIN_CHART_HEIGHT = 80;

/** Default Sankey layout iteration count */
export const DEFAULT_ITERATIONS = 32;

/** Epsilon for floating-point comparison */
export const EPSILON = 1e-6;

/* ═══════════════════════════════════════════════
   CSS Prefix
   ═══════════════════════════════════════════════ */

export const CSS_PREFIX = "pflow-";

/* ═══════════════════════════════════════════════
   Selection Opacity
   ═══════════════════════════════════════════════ */

export const DIM_OPACITY = 0.15;
export const SELECTED_STROKE_WIDTH = 2;
