/* ═══════════════════════════════════════════════
   Packed Bubble Chart – Constants
   ═══════════════════════════════════════════════ */

"use strict";

/** Shared categorical colour palette — 15 colours, WCAG AA against white (P1) */
export const RESOURCE_COLORS = [
    "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444",
    "#06B6D4", "#F97316", "#EC4899", "#6366F1", "#14B8A6",
    "#84CC16", "#A855F7", "#0EA5E9", "#D946EF", "#78716C",
] as const;

/** Status palette for RAG indicators */
export const STATUS_COLORS: Record<string, string> = {
    complete: "#10B981",
    inProgress: "#3B82F6",
    atRisk: "#F97316",
    onHold: "#F59E0B",
    blocked: "#DC2626",
    cancelled: "#64748B",
};

/** CSS class prefix for this visual (Appendix B) */
export const CSS_PREFIX = "pbubble" as const;

/** Power BI system font stack (H1) */
export const FONT_STACK = '"Segoe UI", "wf_segoe-ui_normal", "Helvetica Neue", Helvetica, Arial, sans-serif';

/** Error message when required fields are missing */
export const MISSING_FIELDS_MSG = "Required fields missing.\nAdd at least a Category field and a Value field.";

/** Minimum number of ticks for the force simulation to settle */
export const SIM_MIN_TICKS = 120;

/** Alpha decay rate for smooth animation */
export const SIM_ALPHA_DECAY = 0.02;

/** Velocity decay for dampening */
export const SIM_VELOCITY_DECAY = 0.3;
