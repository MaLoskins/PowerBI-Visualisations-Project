/*
 *  Advanced Pie / Donut Chart – Power BI Custom Visual
 *  utils/color.ts – Colour resolution, palette generation, hex/HSL conversion
 */
"use strict";

import { RESOURCE_COLORS } from "../constants";

/* ═══════════════════════════════════════════════
   Hex ↔ HSL Conversion
   ═══════════════════════════════════════════════ */

interface HSL {
    h: number; /* 0-360 */
    s: number; /* 0-100 */
    l: number; /* 0-100 */
}

/** Parse a hex colour string to RGB (C1) */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const cleaned = hex.replace("#", "");
    const num = parseInt(cleaned, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
    };
}

/** Convert RGB (0-255) to HSL (C2) */
function rgbToHsl(r: number, g: number, b: number): HSL {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l: l * 100 };

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;

    return { h: h * 360, s: s * 100, l: l * 100 };
}

/** Convert HSL to hex (C3) */
function hslToHex(h: number, s: number, l: number): string {
    const sn = s / 100;
    const ln = l / 100;
    const a = sn * Math.min(ln, 1 - ln);
    const f = (n: number): number => {
        const k = (n + h / 30) % 12;
        return ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    };
    const toHex = (x: number): string =>
        Math.round(x * 255).toString(16).padStart(2, "0");
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase();
}

/** Convert a hex colour to HSL */
export function hexToHsl(hex: string): HSL {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHsl(r, g, b);
}

/* ═══════════════════════════════════════════════
   Palette Generation (C4)
   ═══════════════════════════════════════════════ */

/** Generate N colours from the default RESOURCE_COLORS cycle */
export function getDefaultPalette(n: number): string[] {
    const result: string[] = [];
    for (let i = 0; i < n; i++) {
        result.push(RESOURCE_COLORS[i % RESOURCE_COLORS.length]);
    }
    return result;
}

/** Generate pastel palette: RESOURCE_COLORS hues with S=70%, L=80% */
export function getPastelPalette(n: number): string[] {
    const result: string[] = [];
    for (let i = 0; i < n; i++) {
        const base = RESOURCE_COLORS[i % RESOURCE_COLORS.length];
        const hsl = hexToHsl(base);
        result.push(hslToHex(hsl.h, 70, 80));
    }
    return result;
}

/** Generate vivid palette: RESOURCE_COLORS hues with S=100%, L=50% */
export function getVividPalette(n: number): string[] {
    const result: string[] = [];
    for (let i = 0; i < n; i++) {
        const base = RESOURCE_COLORS[i % RESOURCE_COLORS.length];
        const hsl = hexToHsl(base);
        result.push(hslToHex(hsl.h, 100, 50));
    }
    return result;
}

/** Generate monochrome palette: N shades from L=85% down to L=30% of monochromeBase */
export function getMonochromePalette(n: number, baseHex: string): string[] {
    const hsl = hexToHsl(baseHex);
    const result: string[] = [];
    for (let i = 0; i < n; i++) {
        const t = n > 1 ? i / (n - 1) : 0;
        const lightness = 85 - t * 55; /* 85% → 30% */
        result.push(hslToHex(hsl.h, hsl.s, lightness));
    }
    return result;
}

/** Resolve a full colour palette based on palette type and count (C5) */
export function resolvePalette(
    palette: string,
    count: number,
    monochromeBase: string,
): string[] {
    switch (palette) {
        case "pastel":
            return getPastelPalette(count);
        case "vivid":
            return getVividPalette(count);
        case "monochrome":
            return getMonochromePalette(count, monochromeBase);
        default:
            return getDefaultPalette(count);
    }
}

/** Create a lighter shade of a colour for outer ring segments (C6) */
export function lightenColor(hex: string, amount: number = 15): string {
    const hsl = hexToHsl(hex);
    const newL = Math.min(95, hsl.l + amount);
    return hslToHex(hsl.h, hsl.s, newL);
}
