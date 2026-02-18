/* ═══════════════════════════════════════════════
   utils/format.ts – Number & Percent Formatting
   ═══════════════════════════════════════════════ */

"use strict";

/** Format a number with compact notation (e.g., 1.2K, 3.4M). */
export function formatCompact(value: number): string {
    const abs = Math.abs(value);
    const sign = value < 0 ? "−" : value > 0 ? "+" : "";

    if (abs >= 1_000_000_000) return sign + (abs / 1_000_000_000).toFixed(1) + "B";
    if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1) + "M";
    if (abs >= 1_000) return sign + (abs / 1_000).toFixed(1) + "K";
    if (abs === 0) return "0";
    if (abs < 1) return sign + abs.toFixed(2);
    return sign + abs.toFixed(1);
}

/** Format a number as a full value with thousand separators. */
export function formatFull(value: number): string {
    const sign = value < 0 ? "−" : value > 0 ? "+" : "";
    const abs = Math.abs(value);
    const formatted = abs.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
    return sign + formatted;
}

/** Format a fraction (0–1) as a percentage string. */
export function formatPercent(fraction: number): string {
    if (!isFinite(fraction)) return "N/A";
    const pct = fraction * 100;
    const sign = pct > 0 ? "+" : "";
    return sign + pct.toFixed(1) + "%";
}

/** Safely convert a value to a number, returning fallback if not finite. */
export function safeNumber(value: unknown, fallback: number = 0): number {
    const n = Number(value);
    return isFinite(n) ? n : fallback;
}
