/* ═══════════════════════════════════════════════
   Data Labels Renderer
   Text labels displayed above/near bubbles
   ═══════════════════════════════════════════════ */

"use strict";

import { Selection } from "d3-selection";

import { RenderConfig, ScatterDataPoint } from "../types";
import { LOG_CLAMP_VALUE } from "../constants";
import { formatNumber } from "../utils/format";
import { NumericScale } from "./axes";

/**
 * Render data labels next to each bubble.
 */
export function renderDataLabels(
    labelGroup: Selection<SVGGElement, unknown, null, undefined>,
    points: ScatterDataPoint[],
    xScale: NumericScale,
    yScale: NumericScale,
    cfg: RenderConfig["label"],
    axisCfg: RenderConfig["axis"],
    bubbleRadius: number,
): void {
    labelGroup.selectAll("*").remove();

    if (!cfg.showDataLabels || points.length === 0) return;

    labelGroup
        .selectAll<SVGTextElement, ScatterDataPoint>(".bscatter-data-label")
        .data(points, (d) => d.id)
        .enter()
        .append("text")
        .attr("class", "bscatter-data-label")
        .attr("x", (d) => xScale(clampForScale(d.x, axisCfg.xAxisScale))!)
        .attr("y", (d) => yScale(clampForScale(d.y, axisCfg.yAxisScale))! - bubbleRadius - 4)
        .attr("text-anchor", "middle")
        .attr("fill", cfg.labelFontColor)
        .attr("font-size", cfg.labelFontSize + "px")
        .style("pointer-events", "none")
        .text((d) => getLabelText(d, cfg.labelContent));
}

/* ── Helpers ── */

function getLabelText(
    point: ScatterDataPoint,
    content: string,
): string {
    switch (content) {
        case "category":
            return point.category;
        case "value":
            return `(${formatNumber(point.x)}, ${formatNumber(point.y)})`;
        case "both":
            return `${point.category} (${formatNumber(point.x)}, ${formatNumber(point.y)})`;
        default:
            return point.category;
    }
}

function clampForScale(value: number, scaleType: string): number {
    if (scaleType === "log" && value <= 0) return LOG_CLAMP_VALUE;
    return value;
}
