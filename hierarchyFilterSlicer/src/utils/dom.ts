/* ═══════════════════════════════════════════════
   Hierarchy Filter Slicer – DOM Utilities
   Pure helper functions for element creation
   ═══════════════════════════════════════════════ */

"use strict";

import { CSS_PREFIX } from "../constants";

/**
 * Create an HTML element with optional class names and inline styles.
 * Class names are automatically prefixed with the visual CSS prefix.
 */
export function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    classNames?: string | string[],
    styles?: Partial<CSSStyleDeclaration>,
): HTMLElementTagNameMap[K] {
    const elem = document.createElement(tag);

    if (classNames) {
        const names = Array.isArray(classNames) ? classNames : [classNames];
        for (const name of names) {
            elem.classList.add(CSS_PREFIX + name);
        }
    }

    if (styles) {
        for (const key of Object.keys(styles) as Array<keyof CSSStyleDeclaration>) {
            const val = styles[key];
            if (val !== undefined && val !== null) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (elem.style as any)[key] = val;
            }
        }
    }

    return elem;
}

/** Remove all child nodes from a parent element. */
export function clearChildren(parent: HTMLElement): void {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/** Set multiple CSS custom properties on an element. */
export function setCssVars(
    elem: HTMLElement,
    vars: Record<string, string>,
): void {
    for (const [key, val] of Object.entries(vars)) {
        elem.style.setProperty(key, val);
    }
}
