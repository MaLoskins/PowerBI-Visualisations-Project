/* ═══════════════════════════════════════════════
   WaterfallChart - Bar Renderer
   SVG rect rendering for waterfall bars
   ═══════════════════════════════════════════════ */

"use strict";

import { select, Selection } from "d3-selection";
import { WaterfallBar, RenderConfig, ChartCallbacks, BarType } from "../types";
import { AxisScales } from "./axes";
import { CSS_PREFIX } from "../constants";

type SVGSel = Selection<SVGGElement, unknown, null, undefined>;

/** Resolve the fill colour for a bar based on its classification (W8). */
export function resolveBarColor(barType: BarType, colors: RenderConfig["colors"]): string {
    switch (barType) {
        case "start":    return colors.startColor;
        case "increase": return colors.increaseColor;
        case "decrease": return colors.decreaseColor;
        case "total":    return colors.totalColor;
    }
}

/** Pixel geometry for a single bar. */
export interface BarRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

/** Compute pixel geometry for a single bar from its data and scales. */
export function computeBarRect(
    bar: WaterfallBar,
    scales: AxisScales,
    isVertical: boolean,
): BarRect {
    const catPos = scales.categoryScale(bar.category) ?? 0;
    const bandwidth = scales.categoryScale.bandwidth();
    const lo = Math.min(bar.base, bar.top);
    const hi = Math.max(bar.base, bar.top);

    if (isVertical) {
        return {
            x: catPos,
            y: scales.valueScale(hi),
            width: bandwidth,
            height: Math.max(1, scales.valueScale(lo) - scales.valueScale(hi)),
        };
    } else {
        return {
            x: scales.valueScale(lo),
            y: catPos,
            width: Math.max(1, scales.valueScale(hi) - scales.valueScale(lo)),
            height: bandwidth,
        };
    }
}

/** Render all waterfall bars into the provided SVG group. */
export function renderBars(
    g: SVGSel,
    bars: WaterfallBar[],
    scales: AxisScales,
    cfg: RenderConfig,
    callbacks: ChartCallbacks,
): void {
    g.selectAll("*").remove();

    const isVertical = cfg.chart.orientation === "vertical";

    g.selectAll<SVGRectElement, WaterfallBar>(`.${CSS_PREFIX}bar`)
        .data(bars, (d) => d.category + ":" + d.rowIndex)
        .join("rect")
        .attr("class", `${CSS_PREFIX}bar`)
        .attr("data-row", (d) => d.rowIndex)
        .attr("data-bar-type", (d) => d.barType)
        .each(function (d) {
            const rect = computeBarRect(d, scales, isVertical);
            select(this)
                .attr("x", rect.x)
                .attr("y", rect.y)
                .attr("width", rect.width)
                .attr("height", rect.height);
        })
        .attr("rx", cfg.chart.barCornerRadius)
        .attr("ry", cfg.chart.barCornerRadius)
        .attr("fill", (d) => resolveBarColor(d.barType, cfg.colors))
        .style("cursor", (d) => (d.selectionId ? "pointer" : "default"))
        .on("click", function (event: MouseEvent, d: WaterfallBar) {
            event.stopPropagation();
            callbacks.onBarClick(d, event);
        })
        .on("mouseover", function (event: MouseEvent, d: WaterfallBar) {
            callbacks.onBarMouseOver(d, event);
        })
        .on("mousemove", function (event: MouseEvent, d: WaterfallBar) {
            callbacks.onBarMouseMove(d, event);
        })
        .on("mouseout", function () {
            callbacks.onBarMouseOut();
        });
}
