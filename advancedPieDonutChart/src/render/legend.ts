/*
 *  Advanced Pie / Donut Chart – Power BI Custom Visual
 *  render/legend.ts – Legend rendering and positioning
 */
"use strict";

import { PieSlice, RenderConfig, LegendCallbacks } from "../types";
import { LEGEND_SWATCH_SIZE, LEGEND_ITEM_GAP, LEGEND_PADDING } from "../constants";
import { el, clearChildren } from "../utils/dom";

/* ═══════════════════════════════════════════════
   Legend (G1)
   ═══════════════════════════════════════════════ */

export interface LegendMetrics {
    width: number;
    height: number;
}

/** Render the legend into the given container and return its measured size */
export function renderLegend(
    container: HTMLElement,
    slices: PieSlice[],
    cfg: RenderConfig,
    callbacks: LegendCallbacks,
): LegendMetrics {
    clearChildren(container);

    if (!cfg.legend.showLegend || slices.length === 0) {
        container.style.display = "none";
        return { width: 0, height: 0 };
    }

    container.style.display = "flex";
    container.style.flexWrap = "wrap";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.style.gap = LEGEND_ITEM_GAP + "px";
    container.style.padding = LEGEND_PADDING + "px";
    container.style.fontSize = cfg.legend.legendFontSize + "px";
    container.style.color = cfg.legend.legendFontColor;

    /* Set flow direction based on position */
    const isVertical = cfg.legend.legendPosition === "left" || cfg.legend.legendPosition === "right";
    container.style.flexDirection = isVertical ? "column" : "row";

    for (const slice of slices) {
        const item = el("div", "apie-legend-item");
        item.style.display = "flex";
        item.style.alignItems = "center";
        item.style.gap = "4px";
        item.style.cursor = "pointer";
        item.style.whiteSpace = "nowrap";

        const swatch = el("span", "apie-legend-swatch");
        swatch.style.width = LEGEND_SWATCH_SIZE + "px";
        swatch.style.height = LEGEND_SWATCH_SIZE + "px";
        swatch.style.borderRadius = "2px";
        swatch.style.backgroundColor = slice.color;
        swatch.style.flexShrink = "0";

        const label = el("span", "apie-legend-label", slice.category);

        item.appendChild(swatch);
        item.appendChild(label);

        item.addEventListener("click", (e) => {
            callbacks.onLegendClick(slice, e as MouseEvent);
        });

        container.appendChild(item);
    }

    return {
        width: container.offsetWidth,
        height: container.offsetHeight,
    };
}
