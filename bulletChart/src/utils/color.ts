/*
 *  Bullet Chart – Power BI Custom Visual
 *  src/utils/color.ts
 *
 *  Colour resolution and validation helpers.
 */
"use strict";

/** Return hex if valid, fallback otherwise. */
export function safeHex(hex: string | undefined | null, fallback: string): string {
    if (!hex || hex.length === 0) return fallback;
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex)) return hex;
    return fallback;
}

/** Resolve the actual bar colour considering conditional colouring. */
export function resolveActualBarColor(
    actual: number,
    target: number | null,
    conditionalColoring: boolean,
    aboveTargetColor: string,
    belowTargetColor: string,
    defaultColor: string,
): string {
    if (!conditionalColoring || target === null) return defaultColor;
    return actual >= target ? aboveTargetColor : belowTargetColor;
}
