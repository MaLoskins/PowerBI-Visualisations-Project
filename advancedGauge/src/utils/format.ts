/* ═══════════════════════════════════════════════
   Advanced Gauge – Format Utilities
   Number, percent, currency formatting helpers
   ═══════════════════════════════════════════════ */
"use strict";

import type { ValueFormat } from "../types";

/**
 * Determine the effective format to use when the user selects "auto".
 * Treats the value as a percentage only if:
 *   - 0 ≤ value ≤ 1  AND  minValue ≥ 0  AND  maxValue ≤ 1
 *   - AND the Power BI format string contains "%"
 */
export function resolveAutoFormat(
    value: number,
    minValue: number,
    maxValue: number,
    formatString: string,
): "number" | "percent" {
    const isPercentRange =
        value >= 0 && value <= 1 &&
        minValue >= 0 && maxValue <= 1;
    const hasPercentSymbol = formatString.includes("%");
    if (isPercentRange && hasPercentSymbol) return "percent";
    return "number";
}

/**
 * Format a numeric value according to the resolved ValueFormat.
 *
 * - "number":   locale-aware grouping separators, up to 2 decimal places
 * - "percent":  multiply by 100, append "%", up to 1 decimal place
 * - "currency": locale-aware number with currencyPrefix prepended
 * - "auto":     should already be resolved before calling this function
 */
export function formatValue(
    value: number,
    format: ValueFormat,
    minValue: number,
    maxValue: number,
    formatString: string,
    locale?: string,
    currencyPrefix?: string,
): string {
    const effectiveFormat = format === "auto"
        ? resolveAutoFormat(value, minValue, maxValue, formatString)
        : format;

    switch (effectiveFormat) {
        case "percent": {
            const pct = value * 100;
            const decimals = pct === Math.floor(pct) ? 0 : 1;
            return pct.toFixed(decimals) + "%";
        }
        case "currency": {
            const prefix = currencyPrefix ?? "";
            return prefix + formatNumber(value, locale);
        }
        case "number":
        default:
            return formatNumber(value, locale);
    }
}

/** Format a number with locale-aware grouping separators, up to 2 decimals. */
function formatNumber(value: number, locale?: string): string {
    try {
        return value.toLocaleString(locale || undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });
    } catch {
        return value.toFixed(2);
    }
}

/**
 * Format min/max labels — shorter format for axis labels.
 * For large numbers, abbreviate with K/M/B suffixes.
 */
export function formatMinMax(value: number, locale?: string): string {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
    if (abs >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
    if (abs >= 10_000) return (value / 1_000).toFixed(1) + "K";
    return formatNumber(value, locale);
}
