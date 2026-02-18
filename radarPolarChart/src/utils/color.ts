/* ═══════════════════════════════════════════════
   Colour Utilities
   ═══════════════════════════════════════════════ */

"use strict";

import { RESOURCE_COLORS, PASTEL_COLORS, VIVID_COLORS } from "../constants";

/** Return the palette array for the given palette name */
export function getPaletteColors(palette: string): readonly string[] {
    switch (palette) {
        case "pastel": return PASTEL_COLORS;
        case "vivid":  return VIVID_COLORS;
        default:       return RESOURCE_COLORS;
    }
}

/** Get the colour for a series index from the active palette */
export function getSeriesColor(palette: string, index: number): string {
    const colors = getPaletteColors(palette);
    return colors[index % colors.length];
}

/** Validate a hex colour string; return fallback if invalid */
export function validHex(hex: string | undefined | null, fallback: string): string {
    if (!hex) return fallback;
    if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(hex)) return hex;
    return fallback;
}
