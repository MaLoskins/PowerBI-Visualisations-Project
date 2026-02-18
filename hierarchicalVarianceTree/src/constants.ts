/* ═══════════════════════════════════════════════
   constants.ts – Shared Palette & Config
   Hierarchical Variance Tree
   ═══════════════════════════════════════════════ */

"use strict";

/* ── Design System: Slate + Blue Palette ── */

export const SLATE_50  = "#F8FAFC";
export const SLATE_100 = "#F1F5F9";
export const SLATE_200 = "#E2E8F0";
export const SLATE_300 = "#CBD5E1";
export const SLATE_400 = "#94A3B8";
export const SLATE_500 = "#64748B";
export const SLATE_600 = "#475569";
export const SLATE_700 = "#334155";
export const SLATE_800 = "#1E293B";
export const SLATE_900 = "#0F172A";

export const BLUE_50  = "#EFF6FF";
export const BLUE_500 = "#3B82F6";
export const BLUE_600 = "#2563EB";
export const BLUE_700 = "#1D4ED8";

export const RED_500    = "#EF4444";
export const RED_600    = "#DC2626";
export const AMBER_500  = "#F59E0B";
export const EMERALD_500 = "#10B981";
export const ORANGE_500 = "#F97316";

/* ── Resource / Category Palette ── */

export const RESOURCE_COLORS = [
    "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444",
    "#06B6D4", "#F97316", "#EC4899", "#6366F1", "#14B8A6",
    "#84CC16", "#A855F7", "#0EA5E9", "#D946EF", "#78716C",
] as const;

/* ── Status Palette ── */

export const STATUS_COLORS: Record<string, string> = {
    complete: EMERALD_500,
    inProgress: BLUE_500,
    onHold: AMBER_500,
    atRisk: ORANGE_500,
    blocked: RED_600,
    cancelled: SLATE_500,
};

/* ── CSS prefix ── */

export const CSS_PREFIX = "hvtree-";

/* ── Font stack ── */

export const FONT_STACK = '"Segoe UI", "wf_segoe-ui_normal", "Helvetica Neue", Helvetica, Arial, sans-serif';

/* ── Layout defaults ── */

export const DEFAULT_NODE_WIDTH = 160;
export const DEFAULT_NODE_HEIGHT = 70;
export const DEFAULT_LEVEL_SPACING = 60;
export const DEFAULT_SIBLING_SPACING = 16;

/* ── Root node label ── */

export const ROOT_LABEL = "Total";

/* ── Hierarchy separator for node IDs ── */

export const HIERARCHY_SEP = "›";
