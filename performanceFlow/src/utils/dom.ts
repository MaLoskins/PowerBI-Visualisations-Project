/*
 *  Performance Flow — utils/dom.ts
 *  Element factories and DOM helpers
 */
"use strict";

import { CSS_PREFIX } from "../constants";

const SVG_NS = "http://www.w3.org/2000/svg";

/** Create an HTML element with optional className and text */
export function el(
    tag: string,
    className?: string,
    text?: string,
): HTMLElement {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text) e.textContent = text;
    return e;
}

/** Create an SVG element (namespace-aware) */
export function svgEl(tag: string, className?: string): SVGElement {
    const e = document.createElementNS(SVG_NS, tag);
    if (className) e.setAttribute("class", className);
    return e;
}

/** Remove all children from an element */
export function clearChildren(parent: Element): void {
    while (parent.firstChild) parent.removeChild(parent.firstChild);
}

/** Clamp value between min and max */
export function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}

/** Build a prefixed CSS class name */
export function pfx(name: string): string {
    return CSS_PREFIX + name;
}
