/* ═══════════════════════════════════════════════
   Advanced Gauge – DOM Utilities
   Element factories, clearing, clamping
   ═══════════════════════════════════════════════ */
"use strict";

import { CSS_PREFIX } from "../constants";

/** Create an HTML element with an optional CSS class (auto-prefixed). */
export function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    parent?: HTMLElement,
): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    if (className) node.className = CSS_PREFIX + className;
    if (parent) parent.appendChild(node);
    return node;
}

/** Remove all child nodes from an element. */
export function clearChildren(node: HTMLElement | SVGElement): void {
    while (node.firstChild) node.removeChild(node.firstChild);
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/** Create an SVG namespace element. */
export function svgEl<K extends keyof SVGElementTagNameMap>(
    tag: K,
    parent?: SVGElement | HTMLElement,
): SVGElementTagNameMap[K] {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    if (parent) parent.appendChild(node);
    return node;
}
