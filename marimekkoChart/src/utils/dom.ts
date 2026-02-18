/*
 *  Marimekko Chart – Power BI Custom Visual
 *  utils/dom.ts — DOM element factories and helpers
 */
"use strict";

/** Create an HTML element with optional className and textContent */
export function el(
    tag: string,
    className?: string,
    textContent?: string,
): HTMLElement {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent !== undefined) element.textContent = textContent;
    return element;
}

/** Remove all children from a parent element */
export function clearChildren(parent: Element): void {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

/** Clamp a numeric value between min and max */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/** Create an SVG element in the SVG namespace */
export function svgEl(tag: string): SVGElement {
    return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

/** Measure text width using a temporary canvas context */
export function measureTextWidth(text: string, fontSize: number, fontFamily: string): number {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return text.length * fontSize * 0.6;
    ctx.font = `${fontSize}px ${fontFamily}`;
    return ctx.measureText(text).width;
}

/** Truncate text with ellipsis to fit within maxWidth */
export function truncateText(
    text: string,
    maxWidth: number,
    fontSize: number,
    fontFamily: string,
): string {
    if (measureTextWidth(text, fontSize, fontFamily) <= maxWidth) return text;
    let truncated = text;
    while (truncated.length > 1) {
        truncated = truncated.slice(0, -1);
        if (measureTextWidth(truncated + "…", fontSize, fontFamily) <= maxWidth) {
            return truncated + "…";
        }
    }
    return "…";
}
