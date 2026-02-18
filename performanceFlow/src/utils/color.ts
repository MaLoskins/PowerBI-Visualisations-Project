/*
 *  Performance Flow — utils/color.ts
 *  Colour resolution, hex validation, interpolation
 */
"use strict";

import { RESOURCE_COLORS } from "../constants";

/** Validate a hex colour string (3 or 6 digit) */
export function isValidHex(hex: string | null | undefined): hex is string {
    if (!hex) return false;
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

/** Get resource colour by index (cycles through palette) */
export function getResourceColor(index: number): string {
    return RESOURCE_COLORS[index % RESOURCE_COLORS.length];
}

/** Parse hex to {r, g, b} */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
    let h = hex.replace("#", "");
    if (h.length === 3) {
        h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Convert {r,g,b} to hex string */
export function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (c: number) => Math.round(c).toString(16).padStart(2, "0");
    return "#" + toHex(r) + toHex(g) + toHex(b);
}

/** Interpolate between two hex colours. t = 0 → c1, t = 1 → c2 */
export function interpolateColor(c1: string, c2: string, t: number): string {
    const a = hexToRgb(c1);
    const b = hexToRgb(c2);
    return rgbToHex(
        a.r + (b.r - a.r) * t,
        a.g + (b.g - a.g) * t,
        a.b + (b.b - a.b) * t,
    );
}
