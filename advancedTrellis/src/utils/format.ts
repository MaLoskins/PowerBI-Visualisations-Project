/* ═══════════════════════════════════════════════
   Advanced Trellis – Formatting Utilities
   ═══════════════════════════════════════════════ */

"use strict";

/** Format a number for display (compact for large values) */
export function formatValue(value: number): string {
    if (value === 0) return "0";
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
    if (abs >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
    if (abs >= 10_000) return (value / 1_000).toFixed(1) + "K";
    if (abs >= 1_000) return (value / 1_000).toFixed(1) + "K";
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(1);
}

/** Format a number for axis ticks (shorter) */
export function formatAxisTick(value: number): string {
    if (value === 0) return "0";
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return (value / 1_000_000_000).toFixed(0) + "B";
    if (abs >= 1_000_000) return (value / 1_000_000).toFixed(0) + "M";
    if (abs >= 1_000) return (value / 1_000).toFixed(0) + "K";
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(1);
}

/** Sanitize a string-to-union conversion */
export function safeEnum<T extends string>(
    val: string | undefined,
    allowed: readonly T[],
    fallback: T,
): T {
    if (val && (allowed as readonly string[]).includes(val)) return val as T;
    return fallback;
}

/** Truncate a string if it exceeds maxLen, appending "…" */
export function truncate(text: string, maxLen: number): string {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen - 1) + "…";
}
