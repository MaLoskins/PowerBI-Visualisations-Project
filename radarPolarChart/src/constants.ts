/* ═══════════════════════════════════════════════
   Radar / Polar Chart – Constants
   ═══════════════════════════════════════════════ */

"use strict";

/* ── Resource & Category Palette (shared across all visuals) ── */

export const RESOURCE_COLORS = [
    "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444",
    "#06B6D4", "#F97316", "#EC4899", "#6366F1", "#14B8A6",
    "#84CC16", "#A855F7", "#0EA5E9", "#D946EF", "#78716C",
] as const;

/* ── Pastel Palette Variant ── */

export const PASTEL_COLORS = [
    "#93C5FD", "#FCD34D", "#6EE7B7", "#C4B5FD", "#FCA5A5",
    "#67E8F9", "#FDBA74", "#F9A8D4", "#A5B4FC", "#5EEAD4",
    "#BEF264", "#D8B4FE", "#7DD3FC", "#F0ABFC", "#A8A29E",
] as const;

/* ── Vivid Palette Variant ── */

export const VIVID_COLORS = [
    "#2563EB", "#D97706", "#059669", "#7C3AED", "#DC2626",
    "#0891B2", "#EA580C", "#DB2777", "#4F46E5", "#0D9488",
    "#65A30D", "#9333EA", "#0284C7", "#C026D3", "#57534E",
] as const;

/* ── Status Colours ── */

export const STATUS_COLORS: Record<string, string> = {
    complete:   "#10B981",
    success:    "#10B981",
    inProgress: "#3B82F6",
    atRisk:     "#F97316",
    warning:    "#F59E0B",
    onHold:     "#F59E0B",
    critical:   "#DC2626",
    blocked:    "#DC2626",
    cancelled:  "#64748B",
};

/* ── Error Messages ── */

export const ERROR_MISSING_FIELDS =
    "Required fields missing.\nAdd at least an Axis field and a Value measure.";
