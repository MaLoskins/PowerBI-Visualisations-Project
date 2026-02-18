/* ═══════════════════════════════════════════════
   Tag Cloud – Constants
   ═══════════════════════════════════════════════ */

"use strict";

/** Categorical colour cycle – 15 WCAG AA-safe colours (C1) */
export const RESOURCE_COLORS = [
    "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444",
    "#06B6D4", "#F97316", "#EC4899", "#6366F1", "#14B8A6",
    "#84CC16", "#A855F7", "#0EA5E9", "#D946EF", "#78716C",
] as const;

/** Spiral step size for archimedean placement (L2) */
export const SPIRAL_STEP = 0.5;

/** Spiral angle increment in radians (L3) */
export const SPIRAL_ANGLE_STEP = 0.1;

/** Maximum spiral iterations before giving up (L4) */
export const MAX_SPIRAL_STEPS = 5000;
