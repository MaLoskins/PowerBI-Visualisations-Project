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

/* ── Layout Constants ── */

/** Margins inside each panel SVG (px) */
export const PANEL_MARGIN = { top: 4, right: 8, bottom: 4, left: 8 } as const;

/** Extra bottom margin when X axis is visible */
export const X_AXIS_HEIGHT = 20;

/** Extra left margin when Y axis is visible */
export const Y_AXIS_WIDTH = 36;

/** Height reserved for panel title bar */
export const TITLE_BAR_HEIGHT = 24;

/** Horizontal padding (px) inside the panel title bar */
export const TITLE_PADDING_H = 8;

/** Minimum bar width for grouped bars (px) */
export const MIN_BAR_WIDTH = 2;

/** Dim opacity for unselected elements */
export const DIM_OPACITY = 0.25;

/** Hover opacity applied to bar elements */
export const BAR_HOVER_OPACITY = 0.8;

/** Multiplier applied to dot radius on hover */
export const DOT_HOVER_SCALE = 1.5;

/** Stroke width for lollipop stems */
export const LOLLIPOP_STEM_WIDTH = 1.5;

/** Number of Y-axis gridline ticks */
export const Y_GRIDLINE_TICK_COUNT = 5;

/** Number of Y-axis label ticks */
export const Y_AXIS_TICK_COUNT = 4;

/** Vertical offset (px) above a data point for its data label */
export const DATA_LABEL_OFFSET_Y = 4;

/** Horizontal offset (px) to the left of Y-axis tick labels */
export const Y_TICK_LABEL_OFFSET = 6;

/** Vertical offset (px) below the X-axis line for tick labels */
export const X_TICK_LABEL_OFFSET = 12;

/** Maximum characters for X-axis category labels before truncation */
export const X_LABEL_MAX_CHARS = 10;

/** Maximum number of panels pre-allocated in the panel pool */
export const MAX_PANELS = 200;
