/* ═══════════════════════════════════════════════
   DOM Utilities
   Element factories, helpers — no Power BI imports
   ═══════════════════════════════════════════════ */

"use strict";

/** Create an HTML element with optional className and text. */
export function el(
    tag: string,
    className?: string,
    textContent?: string,
): HTMLElement {
    const elem = document.createElement(tag);
    if (className) elem.className = className;
    if (textContent) elem.textContent = textContent;
    return elem;
}

/** Remove all children from an element. */
export function clearChildren(parent: HTMLElement | SVGElement): void {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
