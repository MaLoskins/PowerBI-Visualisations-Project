/* ═══════════════════════════════════════════════
   Packed Bubble Chart – Legend Renderer
   ═══════════════════════════════════════════════ */

"use strict";

import { RenderConfig } from "../types";
import { CSS_PREFIX, FONT_STACK, RESOURCE_COLORS } from "../constants";
import { clearChildren } from "../utils/dom";

export interface LegendDimensions {
    /** Height consumed by top/bottom legend, or width consumed by right legend */
    size: number;
}

/** Render or update the legend.
 *  Returns the space consumed so the chart area can be adjusted. */
export function renderLegend(
    container: HTMLDivElement,
    groups: string[],
    cfg: RenderConfig,
): LegendDimensions {
    clearChildren(container);

    if (!cfg.legend.showLegend || groups.length === 0) {
        container.style.display = "none";
        return { size: 0 };
    }

    container.style.display = "flex";
    container.style.fontFamily = FONT_STACK;
    container.style.fontSize = `${cfg.legend.fontSize}px`;
    container.style.color = cfg.legend.fontColor;
    container.style.padding = "4px 8px";
    container.style.gap = "12px";
    container.style.flexWrap = "wrap";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";

    const isRight = cfg.legend.position === "right";
    container.style.flexDirection = isRight ? "column" : "row";

    for (let i = 0; i < groups.length; i++) {
        const item = document.createElement("div");
        item.className = `${CSS_PREFIX}-legend-item`;
        item.style.display = "flex";
        item.style.alignItems = "center";
        item.style.gap = "4px";

        const swatch = document.createElement("span");
        swatch.className = `${CSS_PREFIX}-legend-swatch`;
        swatch.style.width = "10px";
        swatch.style.height = "10px";
        swatch.style.borderRadius = "50%";
        swatch.style.flexShrink = "0";
        swatch.style.backgroundColor = RESOURCE_COLORS[i % RESOURCE_COLORS.length];

        const text = document.createElement("span");
        text.textContent = groups[i];
        text.style.whiteSpace = "nowrap";

        item.appendChild(swatch);
        item.appendChild(text);
        container.appendChild(item);
    }

    /* Measure consumed space */
    const rect = container.getBoundingClientRect();
    return { size: isRight ? rect.width : rect.height };
}
