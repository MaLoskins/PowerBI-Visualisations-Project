/* ═══════════════════════════════════════════════
   WaterfallChart - Colour Utilities
   Colour resolution, hex validation
   ═══════════════════════════════════════════════ */

"use strict";

import { SLATE } from "../constants";

const HEX_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

/** Validate that a string is a valid hex colour. */
export function isValidHex(color: string): boolean {
    return HEX_PATTERN.test(color);
}

/** Return the provided colour if valid, otherwise a fallback. */
export function safeColor(color: string | undefined, fallback: string): string {
    if (color && isValidHex(color)) return color;
    return fallback;
}

/** Darken a hex colour by a fraction (0-1). Simple channel reduction. */
export function darkenHex(hex: string, amount: number): string {
    const parsed = parseHex(hex);
    if (!parsed) return hex;
    const factor = 1 - amount;
    const r = Math.round(parsed.r * factor);
    const g = Math.round(parsed.g * factor);
    const b = Math.round(parsed.b * factor);
    return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;
}

/** Parse a 3- or 6-digit hex string into RGB components. */
function parseHex(hex: string): { r: number; g: number; b: number } | null {
    if (!HEX_PATTERN.test(hex)) return null;
    let h = hex.slice(1);
    if (h.length === 3) {
        h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    return {
        r: parseInt(h.substring(0, 2), 16),
        g: parseInt(h.substring(2, 4), 16),
        b: parseInt(h.substring(4, 6), 16),
    };
}

function toHex2(n: number): string {
    const s = Math.max(0, Math.min(255, n)).toString(16);
    return s.length === 1 ? "0" + s : s;
}

/** Default colour for missing/invalid values */
export const FALLBACK_COLOR = SLATE[400];
