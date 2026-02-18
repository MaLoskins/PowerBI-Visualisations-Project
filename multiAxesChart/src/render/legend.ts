/* ═══════════════════════════════════════════════
   Legend Rendering
   ═══════════════════════════════════════════════ */
"use strict";

import { Selection } from "d3-selection";
import type { RenderConfig, ChartLayout, ChartType } from "../types";

type SvgSel = Selection<SVGGElement, unknown, null, undefined>;

/** Render the legend showing one entry per active measure. */
export function renderLegend(
    g: SvgSel,
    measureNames: string[],
    measureCount: number,
    cfg: RenderConfig,
    layout: ChartLayout,
): void {
    g.selectAll("*").remove();
    if (!cfg.legend.showLegend) return;

    const isTop = cfg.legend.legendPosition === "top";
    const baseY = isTop ? 14 : layout.totalHeight - 10;

    let xCursor = layout.chartLeft;
    const fontSize = cfg.legend.legendFontSize;
    const gap = 20;
    const iconSize = 12;

    for (let m = 0; m < measureCount; m++) {
        const s = cfg.series[m];
        if (s.chartType === "none") continue;

        /* ── Icon ── */
        renderLegendIcon(g, s.chartType, xCursor, baseY - iconSize / 2, iconSize, s.color);
        xCursor += iconSize + 4;

        /* ── Label ── */
        const label = g.append("text")
            .attr("class", "maxes-legend-label")
            .attr("x", xCursor)
            .attr("y", baseY)
            .attr("dominant-baseline", "central")
            .attr("fill", cfg.legend.legendFontColor)
            .attr("font-size", fontSize + "px")
            .text(measureNames[m]);

        // Estimate text width (approximate)
        const textWidth = measureNames[m].length * fontSize * 0.6;
        xCursor += textWidth + gap;
    }
}

/** Draw a small icon in the legend representing the chart type. */
function renderLegendIcon(
    g: SvgSel,
    chartType: ChartType,
    x: number,
    y: number,
    size: number,
    color: string,
): void {
    if (chartType === "bar") {
        // Small bar icon
        g.append("rect")
            .attr("class", "maxes-legend-icon")
            .attr("x", x)
            .attr("y", y + 2)
            .attr("width", size)
            .attr("height", size - 2)
            .attr("rx", 1)
            .attr("fill", color);
    } else if (chartType === "line") {
        // Small line icon
        g.append("line")
            .attr("class", "maxes-legend-icon")
            .attr("x1", x)
            .attr("x2", x + size)
            .attr("y1", y + size / 2)
            .attr("y2", y + size / 2)
            .attr("stroke", color)
            .attr("stroke-width", 2);
        g.append("circle")
            .attr("cx", x + size / 2)
            .attr("cy", y + size / 2)
            .attr("r", 2.5)
            .attr("fill", color);
    } else if (chartType === "area") {
        // Small area icon
        const pts = `${x},${y + size} ${x + size * 0.3},${y + 3} ${x + size * 0.7},${y + 6} ${x + size},${y + 1} ${x + size},${y + size}`;
        g.append("polygon")
            .attr("class", "maxes-legend-icon")
            .attr("points", pts)
            .attr("fill", color)
            .attr("opacity", 0.5);
        g.append("polyline")
            .attr("points", `${x},${y + size} ${x + size * 0.3},${y + 3} ${x + size * 0.7},${y + 6} ${x + size},${y + 1}`)
            .attr("stroke", color)
            .attr("stroke-width", 1.5)
            .attr("fill", "none");
    }
}
