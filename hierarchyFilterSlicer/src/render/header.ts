/* ═══════════════════════════════════════════════
   Hierarchy Filter Slicer – Header Renderer
   Select All toggle + Expand/Collapse buttons (HD1)
   ═══════════════════════════════════════════════ */

"use strict";

import { RenderConfig, HeaderCallbacks, CheckState } from "../types";
import { el } from "../utils/dom";
import { renderCheckbox, applyCheckboxState } from "./checkbox";

export interface HeaderElements {
    container: HTMLDivElement;
    selectAllCheckbox: HTMLDivElement | null;
    selectAllLabel: HTMLSpanElement | null;
}

/**
 * Build the header DOM. Called once in the constructor.
 * Returns references to elements that need updating.
 */
export function createHeader(
    parent: HTMLElement,
    cfg: RenderConfig,
    callbacks: HeaderCallbacks,
): HeaderElements {
    const container = el("div", "header");
    let selectAllCheckbox: HTMLDivElement | null = null;
    let selectAllLabel: HTMLSpanElement | null = null;

    /* ── Left side: Select All ── */
    if (cfg.header.showSelectAll) {
        const selectAllRow = el("div", "header-select-all");
        selectAllRow.style.display = "flex";
        selectAllRow.style.alignItems = "center";
        selectAllRow.style.gap = "6px";
        selectAllRow.style.cursor = "pointer";

        selectAllCheckbox = renderCheckbox("unchecked", cfg.checkbox);
        selectAllLabel = el("span", "header-label");
        selectAllLabel.textContent = "Select All";

        selectAllRow.appendChild(selectAllCheckbox);
        selectAllRow.appendChild(selectAllLabel);

        selectAllRow.addEventListener("click", (e: MouseEvent) => {
            e.stopPropagation();
            callbacks.onSelectAll();
        });

        container.appendChild(selectAllRow);
    }

    /* ── Right side: Expand / Collapse buttons ── */
    if (cfg.header.showExpandCollapse) {
        const btnGroup = el("div", "header-btns");
        btnGroup.style.display = "flex";
        btnGroup.style.alignItems = "center";
        btnGroup.style.gap = "2px";
        btnGroup.style.marginLeft = "auto";

        const expandBtn = el("button", "header-btn");
        expandBtn.textContent = "▸▸";
        expandBtn.title = "Expand All";
        expandBtn.addEventListener("click", (e: MouseEvent) => {
            e.stopPropagation();
            callbacks.onExpandAll();
        });

        const collapseBtn = el("button", "header-btn");
        collapseBtn.textContent = "▾▾";
        collapseBtn.title = "Collapse All";
        collapseBtn.addEventListener("click", (e: MouseEvent) => {
            e.stopPropagation();
            callbacks.onCollapseAll();
        });

        btnGroup.appendChild(expandBtn);
        btnGroup.appendChild(collapseBtn);
        container.appendChild(btnGroup);
    }

    parent.appendChild(container);

    return { container, selectAllCheckbox, selectAllLabel };
}

/** Update header styles from RenderConfig. */
export function updateHeaderStyle(
    elements: HeaderElements,
    cfg: RenderConfig,
): void {
    const c = elements.container;
    c.style.backgroundColor = cfg.header.headerBackground;
    c.style.borderBottom = `1px solid ${cfg.header.headerBorderColor}`;
    c.style.color = cfg.header.headerFontColor;
    c.style.fontSize = cfg.header.headerFontSize + "px";
    c.style.display = cfg.header.showHeader ? "flex" : "none";

    if (elements.selectAllLabel) {
        elements.selectAllLabel.style.color = cfg.header.headerFontColor;
        elements.selectAllLabel.style.fontSize = cfg.header.headerFontSize + "px";
    }
}

/** Update the select-all checkbox to reflect current global check state. */
export function updateSelectAllState(
    elements: HeaderElements,
    state: CheckState,
    cfg: RenderConfig["checkbox"],
): void {
    if (elements.selectAllCheckbox) {
        applyCheckboxState(elements.selectAllCheckbox, state, cfg);
    }
}
