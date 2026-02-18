/* ═══════════════════════════════════════════════
   Bubble Scatter Chart – Constants
   Palette arrays, magic numbers, shared config
   ═══════════════════════════════════════════════ */

"use strict";

/* ── Resource / Category Colour Cycle ── */

export const RESOURCE_COLORS = [
    "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444",
    "#06B6D4", "#F97316", "#EC4899", "#6366F1", "#14B8A6",
    "#84CC16", "#A855F7", "#0EA5E9", "#D946EF", "#78716C",
] as const;

/* ── Status Colours (RAG) ── */

export const STATUS_COLORS: Record<string, string> = {
    complete: "#10B981",
    success: "#10B981",
    onTrack: "#10B981",
    atRisk: "#F97316",
    warning: "#F97316",
    onHold: "#F59E0B",
    caution: "#F59E0B",
    blocked: "#DC2626",
    critical: "#DC2626",
    danger: "#EF4444",
};

/* ── Chart Defaults ── */

/** Default chart margins (px). Adjusted dynamically for axis labels. */
export const DEFAULT_MARGINS = {
    top: 20,
    right: 20,
    bottom: 50,
    left: 60,
} as const;

/** Extra padding when legend is visible */
export const LEGEND_PADDING = 30;

/** Extra padding when play controls are visible */
export const PLAY_CONTROLS_HEIGHT = 48;

/** Minimum chart dimension before showing error */
export const MIN_CHART_SIZE = 80;

/** Number of sample points for rendering trend line path */
export const TREND_LINE_SAMPLES = 100;

/** Small positive clamp for log-scale domains with zero/negative values */
export const LOG_CLAMP_VALUE = 0.001;

/** Transition duration (ms) for bubble animations */
export const TRANSITION_DURATION = 400;

/** Dimmed opacity for unselected items during selection */
export const UNSELECTED_OPACITY = 0.25;

/** SVG namespace */
export const SVG_NS = "http://www.w3.org/2000/svg";

/** Dash array values for line styles */
export const DASH_ARRAYS: Record<string, string> = {
    solid: "none",
    dashed: "6,4",
    dotted: "2,2",
};
