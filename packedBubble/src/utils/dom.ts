/* ═══════════════════════════════════════════════
   Packed Bubble Chart – DOM Utilities
   ═══════════════════════════════════════════════ */

"use strict";

import { CSS_PREFIX } from "../constants";

/** Create an HTML element with optional class names (prefixed automatically) */
export function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    ...classNames: string[]
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    for (const cn of classNames) {
        element.classList.add(`${CSS_PREFIX}-${cn}`);
    }
    return element;
}

/** Remove all children from an element */
export function clearChildren(node: HTMLElement | SVGElement): void {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

/** Clamp a numeric value between min and max */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
