/* ═══════════════════════════════════════════════
   Data Labels Rendering
   ═══════════════════════════════════════════════ */
"use strict";

import { Selection } from "d3-selection";
import { ScaleLinear, ScaleBand, scaleBand } from "d3-scale";
import type { RenderConfig, ChartLayout, CategoryDataPoint, AxisBinding } from "../types";
import { BAR_GROUP_PADDING } from "../constants";
import { formatDataLabel } from "../utils/format";

type SvgSel = Selection<SVGGElement, unknown, null, undefined>;

/** Render data labels above bars and at line/area data points. */
export function renderDataLabels(
    g: SvgSel,
    categories: CategoryDataPoint[],
    xScale: ScaleBand<string>,
    yScales: Map<AxisBinding, ScaleLinear<number, number>>,
    cfg: RenderConfig,
    measureCount: number,
    layout: ChartLayout,
): void {
    g.selectAll("*").remove();
    if (!cfg.labels.showDataLabels) return;

    const bandwidth = xScale.bandwidth();
    const fontSize = cfg.labels.dataLabelFontSize;
    const fontColor = cfg.labels.dataLabelFontColor;

    /* ── Compute bar sub-band scales (same logic as bars.ts) ── */
    const barSeriesByAxis = new Map<AxisBinding, number[]>();
    for (let m = 0; m < measureCount; m++) {
        const s = cfg.series[m];
        if (s.chartType !== "bar") continue;
        if (!barSeriesByAxis.has(s.axis)) barSeriesByAxis.set(s.axis, []);
        barSeriesByAxis.get(s.axis)!.push(m);
    }

    const subBandScales = new Map<AxisBinding, ReturnType<typeof scaleBand<number>>>();
    for (const [axis, indices] of barSeriesByAxis) {
        subBandScales.set(axis, scaleBand<number>()
            .domain(indices)
            .range([0, bandwidth])
            .paddingInner(BAR_GROUP_PADDING)
            .paddingOuter(0.05));
    }

    for (let m = 0; m < measureCount; m++) {
        const s = cfg.series[m];
        if (s.chartType === "none") continue;

        const yScale = yScales.get(s.axis);
        if (!yScale) continue;

        for (const cat of categories) {
            const val = cat.values[m];
            if (val == null) continue;

            let lx: number;
            let ly: number;

            if (s.chartType === "bar") {
                const subBand = subBandScales.get(s.axis);
                if (!subBand) continue;
                const xBase = xScale(cat.categoryLabel) ?? 0;
                lx = xBase + (subBand(m) ?? 0) + subBand.bandwidth() / 2;
                ly = yScale(val) - 4;
            } else {
                // line or area — position above the data point
                lx = (xScale(cat.categoryLabel) ?? 0) + bandwidth / 2;
                ly = yScale(val) - 6;
            }

            g.append("text")
                .attr("class", "maxes-data-label")
                .attr("x", lx)
                .attr("y", ly)
                .attr("text-anchor", "middle")
                .attr("fill", fontColor)
                .attr("font-size", fontSize + "px")
                .text(formatDataLabel(val));
        }
    }
}
