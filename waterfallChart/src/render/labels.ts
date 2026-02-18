/* ═══════════════════════════════════════════════
   WaterfallChart - Value Labels
   Incremental value + optional running total labels
   ═══════════════════════════════════════════════ */

"use strict";

import { Selection } from "d3-selection";
import { WaterfallBar, RenderConfig, LabelPosition } from "../types";
import { AxisScales } from "./axes";
import { computeBarRect } from "./chart";
import { CSS_PREFIX, FONT_STACK, MIN_BAR_HEIGHT_FOR_INSIDE_LABEL } from "../constants";
import { formatValue } from "../utils/format";

type SVGSel = Selection<SVGGElement, unknown, null, undefined>;

/** Render value labels on or near each bar. */
export function renderValueLabels(
    g: SVGSel,
    bars: WaterfallBar[],
    scales: AxisScales,
    cfg: RenderConfig,
): void {
    g.selectAll("*").remove();
    if (!cfg.labels.showValueLabels) return;

    const isVertical = cfg.chart.orientation === "vertical";

    g.selectAll<SVGTextElement, WaterfallBar>(`.${CSS_PREFIX}value-label`)
        .data(bars)
        .join("text")
        .attr("class", `${CSS_PREFIX}value-label`)
        .attr("font-size", cfg.labels.labelFontSize + "px")
        .attr("font-family", FONT_STACK)
        .attr("fill", (d) => {
            const pos = effectiveLabelPosition(d, scales, isVertical, cfg.labels.labelPosition);
            return pos === "inside" ? "#FFFFFF" : cfg.labels.labelFontColor;
        })
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .each(function (d) {
            const el = this as SVGTextElement;
            const rect = computeBarRect(d, scales, isVertical);
            const pos = effectiveLabelPosition(d, scales, isVertical, cfg.labels.labelPosition);

            if (isVertical) {
                el.setAttribute("x", String(rect.x + rect.width / 2));
                if (pos === "inside") {
                    el.setAttribute("y", String(rect.y + rect.height / 2));
                } else {
                    /* Above: place above the higher end of the bar */
                    const isPositive = d.top >= d.base;
                    el.setAttribute("y", String(isPositive ? rect.y - 6 : rect.y + rect.height + 12));
                }
            } else {
                el.setAttribute("y", String(rect.y + rect.height / 2));
                if (pos === "inside") {
                    el.setAttribute("x", String(rect.x + rect.width / 2));
                } else {
                    const isPositive = d.top >= d.base;
                    el.setAttribute("x", String(isPositive ? rect.x + rect.width + 6 : rect.x - 6));
                    el.setAttribute("text-anchor", isPositive ? "start" : "end");
                }
            }
        })
        .text((d) => {
            /* For total bars, show the total value rather than incremental */
            const showVal = d.barType === "total" || d.barType === "start"
                ? d.runningTotal
                : d.value;
            return formatValue(
                showVal,
                cfg.labels.valueFormat,
                cfg.labels.showPlusMinus && d.barType !== "total" && d.barType !== "start",
            );
        });
}

/** Render running total labels alongside connectors (optional). */
export function renderRunningTotalLabels(
    g: SVGSel,
    bars: WaterfallBar[],
    scales: AxisScales,
    cfg: RenderConfig,
): void {
    g.selectAll("*").remove();
    if (!cfg.labels.showRunningTotal || bars.length < 2) return;

    const isVertical = cfg.chart.orientation === "vertical";
    const bandwidth = scales.categoryScale.bandwidth();

    /* Show running total between bars (at connector position) */
    const data = bars.slice(0, -1); /* One label per connector */

    g.selectAll<SVGTextElement, WaterfallBar>(`.${CSS_PREFIX}running-label`)
        .data(data)
        .join("text")
        .attr("class", `${CSS_PREFIX}running-label`)
        .attr("font-size", (cfg.labels.labelFontSize - 1) + "px")
        .attr("font-family", FONT_STACK)
        .attr("fill", cfg.labels.labelFontColor)
        .attr("opacity", 0.7)
        .each(function (d) {
            const el = this as SVGTextElement;
            const catPos = (scales.categoryScale(d.category) ?? 0) + bandwidth;
            const valPos = scales.valueScale(d.runningTotal);

            if (isVertical) {
                el.setAttribute("x", String(catPos + 2));
                el.setAttribute("y", String(valPos - 4));
                el.setAttribute("text-anchor", "start");
            } else {
                el.setAttribute("x", String(valPos));
                el.setAttribute("y", String(catPos + 12));
                el.setAttribute("text-anchor", "middle");
            }
        })
        .text((d) => formatValue(d.runningTotal, cfg.labels.valueFormat, false));
}

/** Determine effective label position, resolving "auto". */
function effectiveLabelPosition(
    bar: WaterfallBar,
    scales: AxisScales,
    isVertical: boolean,
    requested: LabelPosition,
): "above" | "inside" {
    if (requested === "inside") return "inside";
    if (requested === "above") return "above";

    /* Auto: use "inside" if bar is tall enough, otherwise "above" */
    const rect = computeBarRect(bar, scales, isVertical);
    const size = isVertical ? rect.height : rect.width;
    return size >= MIN_BAR_HEIGHT_FOR_INSIDE_LABEL ? "inside" : "above";
}
