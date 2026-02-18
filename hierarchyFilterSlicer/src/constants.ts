/* ═══════════════════════════════════════════════
   Hierarchy Filter Slicer – Constants
   Palette arrays, magic numbers, shared config
   ═══════════════════════════════════════════════ */

"use strict";

/* ── Resource & Category Palette ── */

export const RESOURCE_COLORS = [
    "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444",
    "#06B6D4", "#F97316", "#EC4899", "#6366F1", "#14B8A6",
    "#84CC16", "#A855F7", "#0EA5E9", "#D946EF", "#78716C",
] as const;

/* ── Status Palette ── */

export const STATUS_COLORS: Record<string, string> = {
    complete: "#10B981",
    inProgress: "#3B82F6",
    atRisk: "#F97316",
    onHold: "#F59E0B",
    cancelled: "#64748B",
    blocked: "#DC2626",
};

/* ── Slate palette tokens ── */

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

export const BLUE = {
    50:  "#EFF6FF",
    300: "#93C5FD",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
} as const;

/* ── Hierarchy limits ── */

export const MAX_HIERARCHY_DEPTH = 6;

/* ── Key separator for node keys (H2) ── */

export const KEY_SEPARATOR = "||";

/* ── CSS prefix ── */

export const CSS_PREFIX = "hfslicer-";

/* ── Icon characters ── */

export const ICON_FOLDER_OPEN = "📂";
export const ICON_FOLDER_CLOSED = "📁";
export const ICON_LEAF = "📄";
export const ICON_EXPAND = "▸";
export const ICON_COLLAPSE = "▾";
export const ICON_CHECK = "✓";
export const ICON_INDETERMINATE = "–";

/* ── Font stack ── */

export const FONT_STACK = `"Segoe UI", "wf_segoe-ui_normal", "Helvetica Neue", Helvetica, Arial, sans-serif`;
