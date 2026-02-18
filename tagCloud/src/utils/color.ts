/* ═══════════════════════════════════════════════
   Tag Cloud – Colour Utilities
   ═══════════════════════════════════════════════ */

"use strict";

import { RESOURCE_COLORS } from "../constants";

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

/** Check if a string is a valid hex colour */
export function isHexColor(s: string | null | undefined): s is string {
    return typeof s === "string" && HEX_RE.test(s.trim());
}

/** Get a palette colour by index (cycles) */
export function paletteColor(index: number): string {
    return RESOURCE_COLORS[index % RESOURCE_COLORS.length];
}

/** Map a categorical string to a stable palette index */
export function categoryColorMap(categories: string[]): Map<string, string> {
    const unique = [...new Set(categories)];
    const map = new Map<string, string>();
    for (let i = 0; i < unique.length; i++) {
        map.set(unique[i], paletteColor(i));
    }
    return map;
}
