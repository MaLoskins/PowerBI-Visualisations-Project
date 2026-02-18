/* ═══════════════════════════════════════════════
   Format Utilities
   Number / percent / label formatting
   ═══════════════════════════════════════════════ */

"use strict";

/** Format a number for axis ticks / labels. Uses compact suffix notation. */
export function formatNumber(value: number, precision: number = 2): string {
    if (!isFinite(value)) return "";
    if (Math.abs(value) >= 1e9) return (value / 1e9).toFixed(1) + "B";
    if (Math.abs(value) >= 1e6) return (value / 1e6).toFixed(1) + "M";
    if (Math.abs(value) >= 1e3) return (value / 1e3).toFixed(1) + "K";
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(precision);
}

/** Convert a raw cell value to a display string for tooltips. */
export function cellToString(value: unknown): string {
    if (value == null) return "";
    if (typeof value === "number") return formatNumber(value);
    return String(value);
}
