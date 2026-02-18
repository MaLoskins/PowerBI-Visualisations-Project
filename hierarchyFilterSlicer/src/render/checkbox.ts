/* ═══════════════════════════════════════════════
   Hierarchy Filter Slicer – Checkbox Renderer
   Draws CSS-based checkboxes with three states (CB1)
   ═══════════════════════════════════════════════ */

"use strict";

import { CheckState, RenderConfig } from "../types";
import { el } from "../utils/dom";

/**
 * Create a checkbox <div> element styled for the given check state.
 * Uses CSS-only rendering — no native <input>.
 */
export function renderCheckbox(
    state: CheckState,
    cfg: RenderConfig["checkbox"],
): HTMLDivElement {
    const box = el("div", "checkbox");

    const size = cfg.checkboxSize + "px";
    box.style.width = size;
    box.style.height = size;
    box.style.minWidth = size;
    box.style.borderRadius = cfg.checkboxRadius + "px";
    box.style.display = "flex";
    box.style.alignItems = "center";
    box.style.justifyContent = "center";
    box.style.cursor = "pointer";
    box.style.flexShrink = "0";
    box.style.transition = "background 0.1s, border-color 0.1s";

    applyCheckboxState(box, state, cfg);

    return box;
}

/** Update an existing checkbox element to reflect a new state. */
export function applyCheckboxState(
    box: HTMLDivElement,
    state: CheckState,
    cfg: RenderConfig["checkbox"],
): void {
    /* ── Clear existing content ── */
    box.textContent = "";

    if (state === "checked") {
        box.style.backgroundColor = cfg.checkedColor;
        box.style.borderColor = cfg.checkedColor;
        box.style.border = `2px solid ${cfg.checkedColor}`;

        /* ── Tick mark via pseudo-content span ── */
        const tick = document.createElement("span");
        tick.textContent = "✓";
        tick.style.color = "#FFFFFF";
        tick.style.fontSize = (cfg.checkboxSize * 0.65) + "px";
        tick.style.lineHeight = "1";
        tick.style.fontWeight = "bold";
        box.appendChild(tick);

    } else if (state === "indeterminate") {
        box.style.backgroundColor = cfg.indeterminateColor;
        box.style.borderColor = cfg.indeterminateColor;
        box.style.border = `2px solid ${cfg.indeterminateColor}`;

        /* ── Dash mark ── */
        const dash = document.createElement("span");
        dash.textContent = "–";
        dash.style.color = "#FFFFFF";
        dash.style.fontSize = (cfg.checkboxSize * 0.7) + "px";
        dash.style.lineHeight = "1";
        dash.style.fontWeight = "bold";
        box.appendChild(dash);

    } else {
        /* unchecked */
        box.style.backgroundColor = "transparent";
        box.style.border = `2px solid ${cfg.uncheckedBorder}`;
    }
}
