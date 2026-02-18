/* ═══════════════════════════════════════════════
   Packed Bubble Chart – Formatting Utilities
   ═══════════════════════════════════════════════ */

"use strict";

/** Format a number with compact notation for bubble labels.
 *  e.g. 1200 → "1.2K", 1500000 → "1.5M" */
export function formatCompact(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    if (abs >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (abs >= 1_000) return (value / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(1);
}

/** Format a number with locale-aware thousands separators for tooltips */
export function formatFull(value: number): string {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
