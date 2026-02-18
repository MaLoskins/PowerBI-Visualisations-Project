/* ═══════════════════════════════════════════════
   Tag Cloud – DOM Utilities
   ═══════════════════════════════════════════════ */

"use strict";

/** Create an HTML element with optional className */
export function el(tag: string, className?: string): HTMLElement {
    const e = document.createElement(tag);
    if (className) e.className = className;
    return e;
}

/** Remove all child nodes from an element */
export function clearChildren(parent: HTMLElement | SVGElement): void {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
