/* ═══════════════════════════════════════════════
   Legend Renderer – HTML legend
   ═══════════════════════════════════════════════ */

"use strict";

import { RadarSeries, RenderConfig } from "../types";
import { clearChildren, el } from "../utils/dom";

/** Render (or hide) the HTML legend container */
export function renderLegend(
    container: HTMLElement,
    series: RadarSeries[],
    cfg: RenderConfig,
): void {
    clearChildren(container);

    if (!cfg.legend.showLegend || series.length <= 1) {
        container.style.display = "none";
        return;
    }

    container.style.display = "";
    container.className = "radar-legend radar-legend-" + cfg.legend.legendPosition;

    for (const s of series) {
        const item = el("div", "radar-legend-item", container);

        const swatch = el("div", "radar-legend-swatch", item);
        swatch.style.backgroundColor = s.color;

        const label = el("span", "radar-legend-label", item);
        label.textContent = s.name;
        label.style.fontSize = cfg.legend.legendFontSize + "px";
        label.style.color = cfg.legend.legendFontColor;
    }
}
