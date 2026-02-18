/* ═══════════════════════════════════════════════
   Advanced Trellis – Constants
   ═══════════════════════════════════════════════ */

"use strict";

/* ── Resource & Category Palette (15 colours, WCAG AA on white) ── */

export const RESOURCE_COLORS = [
    "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444",
    "#06B6D4", "#F97316", "#EC4899", "#6366F1", "#14B8A6",
    "#84CC16", "#A855F7", "#0EA5E9", "#D946EF", "#78716C",
] as const;

/* ── Pastel Palette ── */

export const PASTEL_COLORS = [
    "#93C5FD", "#FCD34D", "#6EE7B7", "#C4B5FD", "#FCA5A5",
    "#67E8F9", "#FDBA74", "#F9A8D4", "#A5B4FC", "#5EEAD4",
    "#BEF264", "#D8B4FE", "#7DD3FC", "#F0ABFC", "#A8A29E",
] as const;

/* ── Vivid Palette ── */

export const VIVID_COLORS = [
    "#2563EB", "#D97706", "#059669", "#7C3AED", "#DC2626",
    "#0891B2", "#EA580C", "#DB2777", "#4F46E5", "#0D9488",
    "#65A30D", "#9333EA", "#0284C7", "#C026D3", "#57534E",
] as const;

/* ── Status Colours (RAG) ── */

export const STATUS_COLORS: Record<string, string> = {
    complete: "#10B981",
    success: "#10B981",
    inProgress: "#3B82F6",
    onHold: "#F59E0B",
    atRisk: "#F97316",
    blocked: "#DC2626",
    cancelled: "#64748B",
} as const;

/* ── Layout Constants ── */

/** Margins inside each panel SVG (px) */
export const PANEL_MARGIN = { top: 4, right: 8, bottom: 4, left: 8 } as const;

/** Extra bottom margin when X axis is visible */
export const X_AXIS_HEIGHT = 20;

/** Extra left margin when Y axis is visible */
export const Y_AXIS_WIDTH = 36;

/** Height reserved for panel title bar */
export const TITLE_BAR_HEIGHT = 24;

/** Minimum bar width for grouped bars (px) */
export const MIN_BAR_WIDTH = 2;

/** Dim opacity for unselected elements */
export const DIM_OPACITY = 0.25;

/** Hover brightness factor */
export const HOVER_BRIGHTNESS = 1.15;
