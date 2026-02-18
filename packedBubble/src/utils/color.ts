/* ═══════════════════════════════════════════════
   Packed Bubble Chart – Colour Utilities
   ═══════════════════════════════════════════════ */

"use strict";

import { RESOURCE_COLORS } from "../constants";

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

/** Check if a string is a valid hex colour */
export function isValidHex(value: string | null | undefined): boolean {
    return typeof value === "string" && HEX_RE.test(value.trim());
}

/** Resolve bubble fill colour.
 *  Priority: explicit colorField → group palette → default */
export function resolveBubbleColor(
    colorHex: string | null,
    group: string | null,
    groupIndex: number,
    colorByGroup: boolean,
    defaultColor: string,
): string {
    if (colorHex && isValidHex(colorHex)) {
        return colorHex.trim();
    }
    if (colorByGroup && group !== null && groupIndex >= 0) {
        return RESOURCE_COLORS[groupIndex % RESOURCE_COLORS.length];
    }
    return defaultColor;
}

/** Build a group → colour map from the RESOURCE_COLORS palette */
export function buildGroupColorMap(groups: string[]): Map<string, string> {
    const map = new Map<string, string>();
    for (let i = 0; i < groups.length; i++) {
        map.set(groups[i], RESOURCE_COLORS[i % RESOURCE_COLORS.length]);
    }
    return map;
}
