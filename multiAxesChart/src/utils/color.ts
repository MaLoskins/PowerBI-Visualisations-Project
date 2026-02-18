/* ═══════════════════════════════════════════════
   Color Utilities
   ═══════════════════════════════════════════════ */
"use strict";

import { RESOURCE_COLORS } from "../constants";

/** Resolve a colour by index from the shared RESOURCE_COLORS palette. */
export function resourceColor(index: number): string {
    return RESOURCE_COLORS[index % RESOURCE_COLORS.length];
}

/** Return a hex colour with the given 0-1 opacity as rgba. */
export function hexWithOpacity(hex: string, opacity: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${opacity})`;
}

/** Validate a hex colour string. */
export function isValidHex(hex: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
}
