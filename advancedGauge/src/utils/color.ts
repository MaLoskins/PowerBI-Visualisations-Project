/* ═══════════════════════════════════════════════
   Advanced Gauge – Colour Utilities
   Hex validation, opacity application
   ═══════════════════════════════════════════════ */
"use strict";

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

/** Validate a hex colour string. Returns the input if valid, fallback otherwise. */
export function safeHex(value: string | undefined | null, fallback: string): string {
    if (value && HEX_RE.test(value)) return value;
    return fallback;
}

/** Convert a hex colour to an rgba() string with the given opacity (0–1). */
export function hexToRgba(hex: string, opacity: number): string {
    const h = hex.replace("#", "");
    const full = h.length === 3
        ? h.split("").map(c => c + c).join("")
        : h;
    const r = parseInt(full.substring(0, 2), 16);
    const g = parseInt(full.substring(2, 4), 16);
    const b = parseInt(full.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${opacity})`;
}
