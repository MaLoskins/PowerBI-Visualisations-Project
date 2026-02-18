/* ═══════════════════════════════════════════════
   WaterfallChart - DOM Utilities
   Element factories, clearChildren, clamp
   ═══════════════════════════════════════════════ */

"use strict";

import { CSS_PREFIX } from "../constants";

/** Create an HTML element with optional class name (auto-prefixed) and parent. */
export function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    parent?: HTMLElement,
): HTMLElementTagNameMap[K] {
    const elem = document.createElement(tag);
    if (className) {
        elem.className = className
            .split(" ")
            .map((c) => CSS_PREFIX + c)
            .join(" ");
    }
    if (parent) {
        parent.appendChild(elem);
    }
    return elem;
}

/** Remove all child nodes from a parent element. */
export function clearChildren(parent: HTMLElement | SVGElement): void {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

/** Clamp a numeric value between min and max. */
export function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}

/** Create an SVG namespace element. */
export function svgEl<K extends keyof SVGElementTagNameMap>(
    tag: K,
    parent?: SVGElement,
): SVGElementTagNameMap[K] {
    const elem = document.createElementNS("http://www.w3.org/2000/svg", tag);
    if (parent) {
        parent.appendChild(elem);
    }
    return elem;
}
