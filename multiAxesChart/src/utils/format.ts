/* ═══════════════════════════════════════════════
   Format Utilities — number formatting
   ═══════════════════════════════════════════════ */
"use strict";

/** Format a number for display on axes/labels. Uses compact notation for large values. */
export function formatAxisValue(val: number): string {
    const abs = Math.abs(val);
    if (abs >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + "B";
    if (abs >= 1_000_000) return (val / 1_000_000).toFixed(1) + "M";
    if (abs >= 10_000) return (val / 1_000).toFixed(1) + "K";
    if (abs >= 1_000) return (val / 1_000).toFixed(1) + "K";
    if (Number.isInteger(val)) return val.toString();
    return val.toFixed(1);
}

/** Format a data-label value (slightly more precise than axis). */
export function formatDataLabel(val: number): string {
    const abs = Math.abs(val);
    if (abs >= 1_000_000_000) return (val / 1_000_000_000).toFixed(2) + "B";
    if (abs >= 1_000_000) return (val / 1_000_000).toFixed(2) + "M";
    if (abs >= 1_000) return (val / 1_000).toFixed(1) + "K";
    if (Number.isInteger(val)) return val.toString();
    return val.toFixed(2);
}
