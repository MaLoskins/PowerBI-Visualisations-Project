/* ═══════════════════════════════════════════════
   DOM Utilities — element factories & helpers
   ═══════════════════════════════════════════════ */
"use strict";

/** Create an HTML element with optional className and parent. */
export function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    parent?: HTMLElement,
): HTMLElementTagNameMap[K] {
    const elem = document.createElement(tag);
    if (className) elem.className = className;
    if (parent) parent.appendChild(elem);
    return elem;
}

/** Remove all child nodes from an element. */
export function clearChildren(node: HTMLElement | SVGElement): void {
    while (node.firstChild) node.removeChild(node.firstChild);
}

/** Clamp a number between min and max. */
export function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}
