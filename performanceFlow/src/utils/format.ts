/*
 *  Performance Flow — utils/format.ts
 *  Number/percent formatting helpers
 */
"use strict";

/** Format a number with locale-aware thousand separators */
export function formatNumber(val: number, decimals: number = 0): string {
    return val.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

/** Format a number as percentage (0–1 → "XX.X%") */
export function formatPercent(fraction: number, decimals: number = 1): string {
    return (fraction * 100).toFixed(decimals) + "%";
}

/** Compact number formatting (1K, 1.2M, etc.) */
export function formatCompact(val: number): string {
    const abs = Math.abs(val);
    if (abs >= 1e9) return (val / 1e9).toFixed(1) + "B";
    if (abs >= 1e6) return (val / 1e6).toFixed(1) + "M";
    if (abs >= 1e3) return (val / 1e3).toFixed(1) + "K";
    return val.toFixed(0);
}
