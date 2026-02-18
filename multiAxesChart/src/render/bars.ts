/* ═══════════════════════════════════════════════
   Bar Rendering — grouped bars per axis
   ═══════════════════════════════════════════════ */
"use strict";

import { Selection } from "d3-selection";
import { ScaleLinear, ScaleBand, scaleBand } from "d3-scale";
import type { RenderConfig, ChartLayout, CategoryDataPoint, AxisBinding } from "../types";
import { BAR_GROUP_PADDING } from "../constants";

type SvgSel = Selection<SVGGElement, unknown, null, undefined>;

export interface BarCallbacks {
    onClick: (catIndex: number, seriesIndex: number, e: MouseEvent) => void;
    onMouseOver: (catIndex: number, seriesIndex: number, x: number, y: number) => void;
    onMouseMove: (x: number, y: number) => void;
    onMouseOut: () => void;
}

/** Render bar series. Groups bars sharing the same axis side-by-side. */
export function renderBars(
    g: SvgSel,
    categories: CategoryDataPoint[],
    xScale: ScaleBand<string>,
    yScales: Map<AxisBinding, ScaleLinear<number, number>>,
    cfg: RenderConfig,
    measureCount: number,
    layout: ChartLayout,
    callbacks: BarCallbacks,
): void {
    g.selectAll("*").remove();

    /* ── Identify bar series and group by axis ── */
    const barSeriesByAxis = new Map<AxisBinding, number[]>();
    for (let m = 0; m < measureCount; m++) {
        const s = cfg.series[m];
        if (s.chartType !== "bar") continue;
        if (!barSeriesByAxis.has(s.axis)) barSeriesByAxis.set(s.axis, []);
        barSeriesByAxis.get(s.axis)!.push(m);
    }

    const bandwidth = xScale.bandwidth();

    /* ── Build a sub-band scale for each axis group ── */
    for (const [axis, seriesIndices] of barSeriesByAxis) {
        const yScale = yScales.get(axis);
        if (!yScale) continue;

        const subBand = scaleBand<number>()
            .domain(seriesIndices)
            .range([0, bandwidth])
            .paddingInner(BAR_GROUP_PADDING)
            .paddingOuter(0.05);

        const subWidth = subBand.bandwidth();
        const zeroY = yScale(0);

        for (const cat of categories) {
            const xBase = xScale(cat.categoryLabel) ?? 0;

            for (const m of seriesIndices) {
                const val = cat.values[m];
                if (val == null) continue;

                const s = cfg.series[m];
                const barX = xBase + (subBand(m) ?? 0);
                const barY = yScale(val);
                const barH = Math.abs(barY - zeroY);
                const barTop = val >= 0 ? barY : zeroY;
                const radius = Math.min(s.barCornerRadius, subWidth / 2, barH / 2);

                /* ── Rounded-top rect via path ── */
                const path = roundedTopRect(barX, barTop, subWidth, barH, radius, val >= 0);

                g.append("path")
                    .attr("class", "maxes-bar")
                    .attr("d", path)
                    .attr("fill", s.color)
                    .attr("data-cat", cat.categoryIndex)
                    .attr("data-series", m)
                    .style("cursor", "pointer")
                    .on("click", (e: MouseEvent) => callbacks.onClick(cat.categoryIndex, m, e))
                    .on("mouseover", (e: MouseEvent) => callbacks.onMouseOver(cat.categoryIndex, m, e.pageX, e.pageY))
                    .on("mousemove", (e: MouseEvent) => callbacks.onMouseMove(e.pageX, e.pageY))
                    .on("mouseout", () => callbacks.onMouseOut());
            }
        }
    }
}

/** Generate SVG path for a rectangle with rounded top corners (or bottom for negative). */
function roundedTopRect(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    isPositive: boolean,
): string {
    if (r <= 0 || h <= 0) {
        return `M${x},${y} h${w} v${h} h${-w} Z`;
    }

    if (isPositive) {
        // Rounded top corners
        return `M${x},${y + r}`
            + ` a${r},${r} 0 0 1 ${r},${-r}`
            + ` h${w - 2 * r}`
            + ` a${r},${r} 0 0 1 ${r},${r}`
            + ` v${h - r}`
            + ` h${-w}`
            + ` Z`;
    } else {
        // Rounded bottom corners
        return `M${x},${y}`
            + ` h${w}`
            + ` v${h - r}`
            + ` a${r},${r} 0 0 1 ${-r},${r}`
            + ` h${-(w - 2 * r)}`
            + ` a${r},${r} 0 0 1 ${-r},${-r}`
            + ` Z`;
    }
}
