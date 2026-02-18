/* ═══════════════════════════════════════════════
   Linear Gauge – Colour Utilities
   Pure helper functions for colour manipulation
   ═══════════════════════════════════════════════ */
"use strict";

/**
 * Convert a hex colour string to an rgba() CSS string.
 * Supports 3-char (#RGB) and 6-char (#RRGGBB) hex formats.
 */
export function hexToRgba(hex: string, alpha: number): string {
    let cleaned = hex.replace(/^#/, "");
    if (cleaned.length === 3) {
        cleaned = cleaned[0] + cleaned[0] + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2];
    }
    const r = parseInt(cleaned.substring(0, 2), 16);
    const g = parseInt(cleaned.substring(2, 4), 16);
    const b = parseInt(cleaned.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return `rgba(0,0,0,${alpha})`;
    }
    return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Validate whether a string is a valid 3- or 6-digit hex colour.
 */
export function isValidHex(hex: string): boolean {
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}
