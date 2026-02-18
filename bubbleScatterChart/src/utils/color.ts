/* ═══════════════════════════════════════════════
   Colour Utilities
   Colour resolution and categorical assignment
   ═══════════════════════════════════════════════ */

"use strict";

import { RESOURCE_COLORS } from "../constants";

/** Map of category value → colour hex. Populated during parsing. */
const categoryColorMap = new Map<string, string>();

/** Reset the category colour map (call on each data update). */
export function resetCategoryColors(): void {
    categoryColorMap.clear();
}

/** Get or assign a colour for a category string. */
export function getCategoryColor(category: string): string {
    const existing = categoryColorMap.get(category);
    if (existing !== undefined) return existing;
    const idx = categoryColorMap.size % RESOURCE_COLORS.length;
    const assignedColor = RESOURCE_COLORS[idx];
    categoryColorMap.set(category, assignedColor);
    return assignedColor;
}

/** Validate a hex colour string. Returns the string or a fallback. */
export function validHex(hex: string | undefined, fallback: string): string {
    if (!hex) return fallback;
    if (/^#[0-9A-Fa-f]{3,8}$/.test(hex)) return hex;
    return fallback;
}
