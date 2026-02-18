/*
 *  Marimekko Chart – Power BI Custom Visual
 *  utils/color.ts — Colour resolution, palette cycling
 */
"use strict";

import {
    RESOURCE_COLORS,
    PASTEL_COLORS,
    VIVID_COLORS,
} from "../constants";

/** Resolve a colour from a palette by index, cycling through the array */
export function colorByIndex(index: number, palette: "default" | "pastel" | "vivid"): string {
    const colors = palette === "pastel"
        ? PASTEL_COLORS
        : palette === "vivid"
            ? VIVID_COLORS
            : RESOURCE_COLORS;
    return colors[index % colors.length];
}

/** Build a mapping of segmentCategory → colour */
export function buildSegmentColorMap(
    segmentCategories: string[],
    palette: "default" | "pastel" | "vivid",
): Map<string, string> {
    const map = new Map<string, string>();
    segmentCategories.forEach((cat, i) => {
        map.set(cat, colorByIndex(i, palette));
    });
    return map;
}

/** Validate hex colour string, return fallback if invalid */
export function validHex(hex: string | undefined, fallback: string): string {
    if (!hex) return fallback;
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex)) return hex;
    return fallback;
}
