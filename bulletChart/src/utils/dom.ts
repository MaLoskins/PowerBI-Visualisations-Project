/*
 *  Bullet Chart – Power BI Custom Visual
 *  src/utils/dom.ts
 *
 *  DOM element factories, helpers.
 */
"use strict";

/** Create an HTML element with optional class name and parent. */
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

/** Remove all child nodes from an element. */
export function clearChildren(element: HTMLElement | SVGElement): void {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/** SVG namespace constant. */
export const SVG_NS = "http://www.w3.org/2000/svg";
