/* ═══════════════════════════════════════════════
   render/legend.ts - Legend rendering
   ═══════════════════════════════════════════════ */
"use strict";

import { Selection } from "d3-selection";
import { RenderConfig } from "../types";

type SVGSel = Selection<SVGGElement, unknown, null, undefined>;

/** Render the legend with Actual, Budget, Favourable, Unfavourable entries */
export function renderLegend(
    g: SVGSel,
    cfg: RenderConfig,
    totalWidth: number,
): void {
    g.selectAll("*").remove();
    if (!cfg.legend.showLegend) {
        g.attr("display", "none");
        return;
    }
    g.attr("display", null);

    const entries = [
        { label: "Actual", color: cfg.colors.actualColor },
        { label: "Budget", color: cfg.colors.budgetColor },
        { label: "Favourable", color: cfg.colors.favourableColor },
        { label: "Unfavourable", color: cfg.colors.unfavourableColor },
    ];

    const fontSize = cfg.legend.legendFontSize;
    const swatchSize = fontSize;
    const spacing = 16;
    let x = 0;

    /* Approximate total width for centering */
    const totalLegendWidth = entries.reduce((acc, e) => {
        return acc + swatchSize + 4 + e.label.length * fontSize * 0.6 + spacing;
    }, 0);
    x = Math.max(0, (totalWidth - totalLegendWidth) / 2);

    for (const entry of entries) {
        /* Swatch */
        g.append("rect")
            .attr("class", "variance-legend-swatch")
            .attr("x", x)
            .attr("y", -swatchSize / 2)
            .attr("width", swatchSize)
            .attr("height", swatchSize)
            .attr("rx", 2)
            .attr("fill", entry.color);

        x += swatchSize + 4;

        /* Label */
        g.append("text")
            .attr("class", "variance-legend-label")
            .attr("x", x)
            .attr("y", 0)
            .attr("dy", "0.35em")
            .attr("font-size", fontSize + "px")
            .attr("fill", cfg.legend.legendFontColor)
            .text(entry.label);

        x += entry.label.length * fontSize * 0.6 + spacing;
    }
}
