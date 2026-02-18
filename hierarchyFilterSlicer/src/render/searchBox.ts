/* ═══════════════════════════════════════════════
   Hierarchy Filter Slicer – Search Box Renderer
   Text input for filtering tree nodes (SB1)
   ═══════════════════════════════════════════════ */

"use strict";

import { RenderConfig, SearchCallbacks } from "../types";
import { el } from "../utils/dom";

export interface SearchBoxElements {
    container: HTMLDivElement;
    input: HTMLInputElement;
}

/**
 * Create the search box DOM. Called once in the constructor.
 * The input fires onSearchChange on every keystroke.
 */
export function createSearchBox(
    parent: HTMLElement,
    cfg: RenderConfig,
    callbacks: SearchCallbacks,
): SearchBoxElements {
    const container = el("div", "search-container");

    const input = document.createElement("input");
    input.type = "text";
    input.className = "hfslicer-search-input";
    input.placeholder = cfg.search.searchPlaceholder;
    input.spellcheck = false;
    input.autocomplete = "off";

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    input.addEventListener("input", () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            callbacks.onSearchChange(input.value);
        }, 150);
    });

    container.appendChild(input);
    parent.appendChild(container);

    return { container, input };
}

/** Update search box styles and visibility from RenderConfig. */
export function updateSearchBoxStyle(
    elements: SearchBoxElements,
    cfg: RenderConfig,
): void {
    elements.container.style.display = cfg.search.showSearchBox ? "flex" : "none";
    elements.input.placeholder = cfg.search.searchPlaceholder;
}

/** Get the current search term. */
export function getSearchTerm(elements: SearchBoxElements): string {
    return elements.input.value;
}

/** Clear the search input. */
export function clearSearch(elements: SearchBoxElements): void {
    elements.input.value = "";
}
