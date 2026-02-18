/* ═══════════════════════════════════════════════
   Hierarchy Filter Slicer – Tree Renderer
   Renders the visible tree rows into the scrollable
   body container (T1)
   ═══════════════════════════════════════════════ */

"use strict";

import { HierarchyNode, RenderConfig, TreeCallbacks } from "../types";
import { el, clearChildren } from "../utils/dom";
import { renderCheckbox } from "./checkbox";

/**
 * Render the visible tree rows into the provided body container.
 * Clears existing content and rebuilds from the flat visible list.
 */
export function renderTree(
    body: HTMLDivElement,
    visibleNodes: HierarchyNode[],
    cfg: RenderConfig,
    callbacks: TreeCallbacks,
    searchTerm: string,
): void {
    clearChildren(body);

    for (const node of visibleNodes) {
        const row = createRow(node, cfg, callbacks, searchTerm);
        body.appendChild(row);
    }
}

/* ── Create a single tree row ── */

function createRow(
    node: HierarchyNode,
    cfg: RenderConfig,
    callbacks: TreeCallbacks,
    searchTerm: string,
): HTMLDivElement {
    const row = el("div", "row");

    row.style.height = cfg.tree.rowHeight + "px";
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.paddingLeft = (node.level * cfg.tree.indentSize) + "px";
    row.style.cursor = "pointer";
    row.style.userSelect = "none";
    row.style.fontSize = cfg.tree.fontSize + "px";
    row.style.fontFamily = cfg.tree.fontFamily;
    row.style.color = cfg.tree.fontColor;

    if (node.checkState === "checked") {
        row.style.fontWeight = cfg.tree.selectedFontWeight;
    } else {
        row.style.fontWeight = "normal";
    }

    /* ── 1. Expand/collapse toggle ── */
    const toggle = el("div", "toggle");
    toggle.style.width = "18px";
    toggle.style.minWidth = "18px";
    toggle.style.textAlign = "center";
    toggle.style.flexShrink = "0";

    if (!node.isLeaf && node.children.length > 0) {
        toggle.textContent = node.isExpanded ? "▾" : "▸";
        toggle.style.cursor = "pointer";
        toggle.style.color = cfg.tree.fontColor;
        toggle.style.fontSize = (cfg.tree.fontSize + 2) + "px";

        toggle.addEventListener("click", (e: MouseEvent) => {
            e.stopPropagation();
            callbacks.onToggleExpand(node);
        });
    }

    row.appendChild(toggle);

    /* ── 2. Checkbox ── */
    const checkbox = renderCheckbox(node.checkState, cfg.checkbox);
    checkbox.addEventListener("click", (e: MouseEvent) => {
        e.stopPropagation();
        callbacks.onToggleCheck(node);
    });
    row.appendChild(checkbox);

    /* ── 3. Optional icon ── */
    if (cfg.tree.showIcons) {
        const icon = el("span", "icon");
        icon.style.fontSize = cfg.tree.iconSize + "px";
        icon.style.marginLeft = "4px";
        icon.style.marginRight = "2px";
        icon.style.flexShrink = "0";
        icon.style.lineHeight = "1";

        if (node.isLeaf) {
            icon.textContent = "📄";
        } else {
            icon.textContent = node.isExpanded ? "📂" : "📁";
        }

        row.appendChild(icon);
    }

    /* ── 4. Label text ── */
    const label = el("span", "label");
    label.style.marginLeft = "4px";
    label.style.overflow = "hidden";
    label.style.textOverflow = "ellipsis";
    label.style.whiteSpace = "nowrap";
    label.style.flexGrow = "1";

    const term = searchTerm.trim().toLowerCase();
    if (term.length > 0 && cfg.search.highlightMatches) {
        /* ── Highlight matching substring ── */
        const lowerLabel = node.label.toLowerCase();
        const matchIdx = lowerLabel.indexOf(term);

        if (matchIdx >= 0) {
            const before = node.label.substring(0, matchIdx);
            const match = node.label.substring(matchIdx, matchIdx + term.length);
            const after = node.label.substring(matchIdx + term.length);

            if (before) label.appendChild(document.createTextNode(before));

            const strong = document.createElement("strong");
            strong.textContent = match;
            strong.className = "hfslicer-highlight";
            label.appendChild(strong);

            if (after) label.appendChild(document.createTextNode(after));
        } else {
            label.textContent = node.label;
        }
    } else {
        label.textContent = node.label;
    }

    row.appendChild(label);

    /* ── Row click → toggle check ── */
    row.addEventListener("click", (e: MouseEvent) => {
        e.stopPropagation();
        callbacks.onToggleCheck(node);
    });

    return row;
}
