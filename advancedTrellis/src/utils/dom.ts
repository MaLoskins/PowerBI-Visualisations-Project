/* ═══════════════════════════════════════════════
   Advanced Trellis – DOM Utilities
   ═══════════════════════════════════════════════ */

"use strict";

/** Create an HTML element with optional class name and parent */
export function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    parent?: HTMLElement,
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (parent) parent.appendChild(element);
    return element;
}

/** Remove all child nodes from an element */
export function clearChildren(element: HTMLElement | SVGElement): void {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/** Create an SVG element in the SVG namespace */
export function svgEl<K extends keyof SVGElementTagNameMap>(
    tag: K,
    parent?: SVGElement,
): SVGElementTagNameMap[K] {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    if (parent) parent.appendChild(element);
    return element;
}
