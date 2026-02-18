/* ═══════════════════════════════════════════════
   Linear Gauge – Formatting Utilities
   Number / percent / currency formatting
   ═══════════════════════════════════════════════ */
"use strict";

import { LABEL_PADDING_H } from "../constants";

/** Precision-aware number formatter with thousands separator */
function formatNumber(val: number): string {
    const abs = Math.abs(val);
    if (abs >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + "B";
    if (abs >= 1_000_000) return (val / 1_000_000).toFixed(1) + "M";
    if (abs >= 10_000) return (val / 1_000).toFixed(1) + "K";
    if (Number.isInteger(val)) return val.toLocaleString("en-US");
    return val.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/** Format a value as a percentage (assumes raw ratio or number) */
function formatPercent(val: number): string {
    // If the value looks like a fraction (0–1 range), multiply by 100
    const pct = Math.abs(val) <= 1 ? val * 100 : val;
    return pct.toFixed(1) + "%";
}

/** Format a value as currency */
function formatCurrency(val: number): string {
    return "$" + formatNumber(val);
}

/**
 * Auto-detect format: if all values look like fractions (0–1), use percent;
 * otherwise use number.
 */
function formatAuto(val: number): string {
    return formatNumber(val);
}

export type ValueFormatType = "auto" | "number" | "percent" | "currency";

/** Format a value according to the chosen format type */
export function formatValue(val: number, fmt: ValueFormatType): string {
    switch (fmt) {
        case "percent":  return formatPercent(val);
        case "currency": return formatCurrency(val);
        case "number":   return formatNumber(val);
        default:         return formatAuto(val);
    }
}

/** Estimate the pixel width of a formatted label (rough heuristic) */
export function estimateLabelWidth(text: string, fontSize: number): number {
    return text.length * fontSize * 0.6 + LABEL_PADDING_H * 2;
}
