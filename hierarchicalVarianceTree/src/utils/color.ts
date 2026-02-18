/* ═══════════════════════════════════════════════
   utils/color.ts – Colour Helper Functions
   ═══════════════════════════════════════════════ */

"use strict";

import { EMERALD_500, RED_500, SLATE_400 } from "../constants";

/** Validate a hex colour string. Returns the string if valid, fallback otherwise. */
export function validHex(value: string | undefined | null, fallback: string): string {
    if (!value) return fallback;
    if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(value)) return value;
    return fallback;
}

/** Get the variance colour: favourable (green), unfavourable (red), or neutral. */
export function varianceColor(
    variance: number,
    favourableColor: string,
    unfavourableColor: string,
    neutralColor: string,
): string {
    if (variance > 0) return favourableColor;
    if (variance < 0) return unfavourableColor;
    return neutralColor;
}

/** Default variance colour without config. */
export function defaultVarianceColor(variance: number): string {
    return varianceColor(variance, EMERALD_500, RED_500, SLATE_400);
}
