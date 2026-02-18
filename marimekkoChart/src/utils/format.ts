/*
 *  Marimekko Chart – Power BI Custom Visual
 *  utils/format.ts — Number, percent, and currency formatting
 */
"use strict";

/** Format a number as a percentage string (e.g., 0.456 → "45.6%") */
export function formatPercent(fraction: number, decimals: number = 1): string {
    return (fraction * 100).toFixed(decimals) + "%";
}

/** Format a number with thousands separators */
export function formatNumber(value: number, decimals: number = 0): string {
    return value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

/** Compact number format (e.g., 1200 → "1.2K") */
export function formatCompact(value: number): string {
    const abs = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    if (abs >= 1_000_000_000) return sign + (abs / 1_000_000_000).toFixed(1) + "B";
    if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1) + "M";
    if (abs >= 1_000) return sign + (abs / 1_000).toFixed(1) + "K";
    return sign + abs.toFixed(0);
}

/**
 * Build the label text for a segment based on the content setting.
 * fraction is 0–1, value is the raw data value.
 */
export function buildSegmentLabelText(
    content: "name" | "percent" | "value" | "nameAndPercent",
    segmentName: string,
    fraction: number,
    value: number,
): string {
    switch (content) {
        case "name":
            return segmentName;
        case "percent":
            return formatPercent(fraction);
        case "value":
            return formatCompact(value);
        case "nameAndPercent":
            return `${segmentName} ${formatPercent(fraction)}`;
    }
}
