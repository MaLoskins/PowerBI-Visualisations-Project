/*
 *  Advanced Pie / Donut Chart – Power BI Custom Visual
 *  utils/dom.ts – DOM helper functions
 */
"use strict";

/** Create an HTML element with optional className and text content */
export function el(
    tag: string,
    className?: string,
    textContent?: string,
): HTMLElement {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (textContent !== undefined) node.textContent = textContent;
    return node;
}

/** Remove all children of an element */
export function clearChildren(node: HTMLElement | SVGElement): void {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
