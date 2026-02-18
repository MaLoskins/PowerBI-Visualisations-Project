/* ═══════════════════════════════════════════════
   WaterfallChart - Format Utilities
   Number, currency, compact formatting
   ═══════════════════════════════════════════════ */

"use strict";

/** Format a value as a compact abbreviation (1,234,567 → 1.2M). */
export function formatCompact(val: number): string {
    const abs = Math.abs(val);
    if (abs >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    if (abs >= 1_000_000) return (val / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (abs >= 1_000) return (val / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return formatNumber(val);
}

/** Format a number with locale-aware thousands separator. */
export function formatNumber(val: number): string {
    return val.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

/** Format as currency (USD default). */
export function formatCurrency(val: number): string {
    return val.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

/**
 * Auto-detect best format: use compact if magnitude is large,
 * otherwise standard number format.
 */
export function formatAuto(val: number): string {
    const abs = Math.abs(val);
    if (abs >= 1_000_000) return formatCompact(val);
    return formatNumber(val);
}

/** Master format dispatcher based on user-chosen format type. */
export function formatValue(
    val: number,
    format: "auto" | "number" | "currency" | "compact",
    showPlusMinus: boolean,
): string {
    let result: string;
    switch (format) {
        case "compact":
            result = formatCompact(val);
            break;
        case "currency":
            result = formatCurrency(val);
            break;
        case "number":
            result = formatNumber(val);
            break;
        case "auto":
        default:
            result = formatAuto(val);
            break;
    }
    if (showPlusMinus && val > 0) {
        result = "+" + result;
    }
    return result;
}

/** Format a percentage for tooltip display. */
export function formatPercent(val: number): string {
    return (val * 100).toFixed(1) + "%";
}
