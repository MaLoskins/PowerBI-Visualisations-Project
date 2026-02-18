/*
 *  Bullet Chart – Power BI Custom Visual
 *  src/utils/format.ts
 *
 *  Number and percent formatting helpers.
 */
"use strict";

/** Format a number for display, using compact notation for large values. */
export function formatValue(value: number): string {
    if (value === 0) return "0";
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    if (abs >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (abs >= 10_000) return (value / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toFixed(1);
}

/** Format a ratio (0–1 or larger) as percent. */
export function formatPercent(value: number): string {
    return (value * 100).toFixed(1).replace(/\.0$/, "") + "%";
}

/** Compute nice tick values for an axis from 0 to max. */
export function niceTickValues(maxVal: number, maxTicks: number): number[] {
    if (maxVal <= 0 || maxTicks < 2) return [0];

    const rough = maxVal / (maxTicks - 1);
    const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
    const residual = rough / magnitude;

    let niceStep: number;
    if (residual <= 1.5) niceStep = 1 * magnitude;
    else if (residual <= 3) niceStep = 2 * magnitude;
    else if (residual <= 7) niceStep = 5 * magnitude;
    else niceStep = 10 * magnitude;

    const ticks: number[] = [];
    for (let v = 0; v <= maxVal + niceStep * 0.01; v += niceStep) {
        ticks.push(Math.round(v * 1e10) / 1e10);
    }
    return ticks;
}
