/* ═══════════════════════════════════════════════
   Linear Gauge – DOM Utilities
   Element factories and DOM helpers
   ═══════════════════════════════════════════════ */
"use strict";

/**
 * Create an HTML element with optional className and textContent.
 */
export function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    textContent?: string,
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent !== undefined) element.textContent = textContent;
    return element;
}

/**
 * Remove all child nodes from an element.
 */
export function clearChildren(node: HTMLElement | SVGElement): void {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

/**
 * Clamp a number between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}
