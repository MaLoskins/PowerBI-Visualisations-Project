/* ═══════════════════════════════════════════════
   utils/color.ts - Colour resolution and hex validation
   ═══════════════════════════════════════════════ */
"use strict";

import { RESOURCE_COLORS } from "../constants";

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

/** Validate a hex colour string */
export function isValidHex(hex: string): boolean {
    return HEX_RE.test(hex);
}

/** Return hex if valid, otherwise fallback */
export function safeHex(hex: string | undefined | null, fallback: string): string {
    if (hex && isValidHex(hex)) return hex;
    return fallback;
}

/** Get a resource colour by index (cycles through palette) */
export function resourceColor(index: number): string {
    return RESOURCE_COLORS[index % RESOURCE_COLORS.length];
}

/** Return the variance colour: favourable or unfavourable */
export function varianceColor(
    variance: number,
    favourableColor: string,
    unfavourableColor: string,
): string {
    return variance >= 0 ? favourableColor : unfavourableColor;
}
