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
import { ColorPalette } from "../types";

/** Resolve a colour from a palette by index, cycling through the array */
export function colorByIndex(index: number, palette: ColorPalette): string {
    const colors = palette === "pastel"
        ? PASTEL_COLORS
        : palette === "vivid"
            ? VIVID_COLORS
            : RESOURCE_COLORS;
    return colors[index % colors.length];
}

/** Build a mapping of segmentCategory → colour */
export function buildSegmentColorMap(
    segmentCategories: readonly string[],
    palette: ColorPalette,
): Map<string, string> {
    const map = new Map<string, string>();
    for (let i = 0; i < segmentCategories.length; i++) {
        map.set(segmentCategories[i], colorByIndex(i, palette));
    }
    return map;
}

/** Validate hex colour string, return fallback if invalid */
export function validHex(hex: string | undefined, fallback: string): string {
    if (!hex) return fallback;
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex)) return hex;
    return fallback;
}
