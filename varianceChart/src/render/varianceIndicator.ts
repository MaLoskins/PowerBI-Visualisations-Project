/* ═══════════════════════════════════════════════
   render/varianceIndicator.ts - Delta bar, lollipop, arrow, connector
   ═══════════════════════════════════════════════ */
"use strict";

import { Selection } from "d3-selection";
import { ScaleBand, ScaleLinear } from "d3-scale";
import { VarianceItem, RenderConfig, VarianceStyle } from "../types";
import { varianceColor } from "../utils/color";
import { ARROW_SIZE, LOLLIPOP_RADIUS } from "../constants";

type SVGSel = Selection<SVGGElement, unknown, null, undefined>;

/** Render variance indicators for all items */
export function renderVarianceIndicators(
    g: SVGSel,
    items: VarianceItem[],
    bandScale: ScaleBand<string>,
    valueScale: ScaleLinear<number, number>,
    cfg: RenderConfig,
    isVertical: boolean,
): void {
    g.selectAll("*").remove();
    if (!cfg.chart.showVarianceIndicator) return;

    const style = cfg.chart.varianceStyle;

    for (const item of items) {
        const bandPos = bandScale(item.category) ?? 0;
        const bandW = bandScale.bandwidth();
        const actualPos = valueScale(item.actual);
        const budgetPos = valueScale(item.budget);
        const vColor = varianceColor(item.variance, cfg.colors.favourableColor, cfg.colors.unfavourableColor);

        if (isVertical) {
            renderIndicatorVertical(g, style, bandPos, bandW, actualPos, budgetPos, vColor);
        } else {
            renderIndicatorHorizontal(g, style, bandPos, bandW, actualPos, budgetPos, vColor);
        }
    }
}

/* ── Vertical orientation ── */

function renderIndicatorVertical(
    g: SVGSel,
    style: VarianceStyle,
    bandX: number,
    bandW: number,
    actualY: number,
    budgetY: number,
    color: string,
): void {
    const cx = bandX + bandW / 2;

    switch (style) {
        case "deltaBar": {
            const barWidth = Math.max(4, bandW * 0.15);
            const y = Math.min(actualY, budgetY);
            const h = Math.abs(actualY - budgetY);
            g.append("rect")
                .attr("class", "variance-delta-bar")
                .attr("x", cx - barWidth / 2 + bandW * 0.35)
                .attr("y", y)
                .attr("width", barWidth)
                .attr("height", Math.max(1, h))
                .attr("fill", color)
                .attr("rx", 1);
            break;
        }
        case "lollipop": {
            const lineX = cx + bandW * 0.35;
            g.append("line")
                .attr("class", "variance-lollipop-line")
                .attr("x1", lineX).attr("x2", lineX)
                .attr("y1", budgetY).attr("y2", actualY)
                .attr("stroke", color)
                .attr("stroke-width", 2);
            g.append("circle")
                .attr("class", "variance-lollipop-dot")
                .attr("cx", lineX)
                .attr("cy", actualY)
                .attr("r", LOLLIPOP_RADIUS)
                .attr("fill", color);
            break;
        }
        case "arrow": {
            const arrowX = cx + bandW * 0.35;
            const goesUp = actualY < budgetY; /* lower Y = higher value in SVG */
            const tipY = goesUp ? actualY - 2 : actualY + 2;
            const dir = goesUp ? -1 : 1;

            g.append("line")
                .attr("class", "variance-arrow-stem")
                .attr("x1", arrowX).attr("x2", arrowX)
                .attr("y1", budgetY).attr("y2", tipY)
                .attr("stroke", color)
                .attr("stroke-width", 2);
            /* Arrow head */
            const headPath = `M${arrowX},${tipY} l${-ARROW_SIZE},${dir * ARROW_SIZE} l${ARROW_SIZE * 2},0 Z`;
            g.append("path")
                .attr("class", "variance-arrow-head")
                .attr("d", headPath)
                .attr("fill", color);
            break;
        }
        case "connectorLine": {
            const x1 = bandX + bandW * 0.15;
            const x2 = bandX + bandW * 0.85;
            g.append("line")
                .attr("class", "variance-connector")
                .attr("x1", x1).attr("x2", x2)
                .attr("y1", budgetY).attr("y2", budgetY)
                .attr("stroke", color)
                .attr("stroke-width", 1.5)
                .attr("stroke-dasharray", "4,2");
            g.append("line")
                .attr("class", "variance-connector-vert")
                .attr("x1", x2).attr("x2", x2)
                .attr("y1", budgetY).attr("y2", actualY)
                .attr("stroke", color)
                .attr("stroke-width", 1.5);
            break;
        }
    }
}

/* ── Horizontal orientation ── */

function renderIndicatorHorizontal(
    g: SVGSel,
    style: VarianceStyle,
    bandY: number,
    bandH: number,
    actualX: number,
    budgetX: number,
    color: string,
): void {
    const cy = bandY + bandH / 2;

    switch (style) {
        case "deltaBar": {
            const barHeight = Math.max(4, bandH * 0.15);
            const x = Math.min(actualX, budgetX);
            const w = Math.abs(actualX - budgetX);
            g.append("rect")
                .attr("class", "variance-delta-bar")
                .attr("x", x)
                .attr("y", cy - barHeight / 2 + bandH * 0.35)
                .attr("width", Math.max(1, w))
                .attr("height", barHeight)
                .attr("fill", color)
                .attr("rx", 1);
            break;
        }
        case "lollipop": {
            const lineY = cy + bandH * 0.35;
            g.append("line")
                .attr("class", "variance-lollipop-line")
                .attr("x1", budgetX).attr("x2", actualX)
                .attr("y1", lineY).attr("y2", lineY)
                .attr("stroke", color)
                .attr("stroke-width", 2);
            g.append("circle")
                .attr("class", "variance-lollipop-dot")
                .attr("cx", actualX)
                .attr("cy", lineY)
                .attr("r", LOLLIPOP_RADIUS)
                .attr("fill", color);
            break;
        }
        case "arrow": {
            const arrowY = cy + bandH * 0.35;
            const goesRight = actualX > budgetX;
            const tipX = goesRight ? actualX + 2 : actualX - 2;
            const dir = goesRight ? 1 : -1;

            g.append("line")
                .attr("class", "variance-arrow-stem")
                .attr("x1", budgetX).attr("x2", tipX)
                .attr("y1", arrowY).attr("y2", arrowY)
                .attr("stroke", color)
                .attr("stroke-width", 2);
            const headPath = `M${tipX},${arrowY} l${-dir * ARROW_SIZE},${-ARROW_SIZE} l0,${ARROW_SIZE * 2} Z`;
            g.append("path")
                .attr("class", "variance-arrow-head")
                .attr("d", headPath)
                .attr("fill", color);
            break;
        }
        case "connectorLine": {
            const y1 = bandY + bandH * 0.15;
            const y2 = bandY + bandH * 0.85;
            g.append("line")
                .attr("class", "variance-connector")
                .attr("x1", budgetX).attr("x2", budgetX)
                .attr("y1", y1).attr("y2", y2)
                .attr("stroke", color)
                .attr("stroke-width", 1.5)
                .attr("stroke-dasharray", "4,2");
            g.append("line")
                .attr("class", "variance-connector-horiz")
                .attr("x1", budgetX).attr("x2", actualX)
                .attr("y1", y2).attr("y2", y2)
                .attr("stroke", color)
                .attr("stroke-width", 1.5);
            break;
        }
    }
}
