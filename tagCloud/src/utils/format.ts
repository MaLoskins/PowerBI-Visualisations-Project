/* ═══════════════════════════════════════════════
   Tag Cloud – Format Utilities
   ═══════════════════════════════════════════════ */

"use strict";

/** Format a number for display in tooltips */
export function formatNumber(value: number): string {
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}

/** Safely convert an unknown value to a display string */
export function toDisplayString(value: unknown): string {
    if (value == null) return "";
    if (typeof value === "number") return formatNumber(value);
    return String(value);
}
