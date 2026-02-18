/*
 *  Advanced Pie / Donut Chart – Power BI Custom Visual
 *  utils/format.ts – Number/percent/currency formatting
 */
"use strict";

/** Format a number with locale-aware separators (F1) */
export function formatNumber(value: number, decimals: number = 0): string {
    if (!isFinite(value)) return "0";
    return value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

/** Format a fraction (0-1) as a percentage string (F2) */
export function formatPercent(fraction: number, decimals: number = 1): string {
    if (!isFinite(fraction)) return "0%";
    return (fraction * 100).toFixed(decimals) + "%";
}

/** Format a value with smart abbreviations (K, M, B) (F3) */
export function formatAbbreviated(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 1e9) return (value / 1e9).toFixed(1) + "B";
    if (abs >= 1e6) return (value / 1e6).toFixed(1) + "M";
    if (abs >= 1e3) return (value / 1e3).toFixed(1) + "K";
    return formatNumber(value, abs < 10 ? 1 : 0);
}

/** Build a label string based on label content setting (F4) */
export function buildLabelText(
    name: string,
    value: number,
    percent: number,
    content: string,
): string {
    switch (content) {
        case "name":
            return name;
        case "value":
            return formatAbbreviated(value);
        case "percent":
            return formatPercent(percent);
        case "nameAndPercent":
            return `${name} (${formatPercent(percent)})`;
        case "nameAndValue":
            return `${name} (${formatAbbreviated(value)})`;
        default:
            return name;
    }
}
