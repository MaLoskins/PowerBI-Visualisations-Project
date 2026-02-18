/* ═══════════════════════════════════════════════
   Advanced Trellis – Colour Utilities
   ═══════════════════════════════════════════════ */

"use strict";

import {
    RESOURCE_COLORS,
    PASTEL_COLORS,
    VIVID_COLORS,
} from "../constants";

import type { ColorPalette } from "../types";

/** Get the palette array for a given palette name */
export function getPaletteColors(palette: ColorPalette): readonly string[] {
    switch (palette) {
        case "pastel":
            return PASTEL_COLORS;
        case "vivid":
            return VIVID_COLORS;
        default:
            return RESOURCE_COLORS;
    }
}

/** Get a colour from the palette by index, cycling if needed */
export function getColorByIndex(palette: ColorPalette, index: number): string {
    const colors = getPaletteColors(palette);
    return colors[index % colors.length];
}

/** Validate a hex colour string; return fallback if invalid */
export function safeHex(value: string | undefined, fallback: string): string {
    if (!value) return fallback;
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(value)) {
        return value;
    }
    return fallback;
}

/** Convert hex to rgba string */
export function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}
