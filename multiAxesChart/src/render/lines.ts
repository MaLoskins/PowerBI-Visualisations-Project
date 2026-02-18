/* ═══════════════════════════════════════════════
   Line & Area Rendering
   ═══════════════════════════════════════════════ */
"use strict";

import { Selection } from "d3-selection";
import { ScaleLinear, ScaleBand } from "d3-scale";
import { line, area, curveMonotoneX } from "d3-shape";
import type { RenderConfig, ChartLayout, CategoryDataPoint, AxisBinding } from "../types";
import { DASH_PATTERNS } from "../constants";
import { hexWithOpacity } from "../utils/color";

type SvgSel = Selection<SVGGElement, unknown, null, undefined>;

export interface LineCallbacks {
    onDotClick: (catIndex: number, seriesIndex: number, e: MouseEvent) => void;
    onDotMouseOver: (catIndex: number, seriesIndex: number, x: number, y: number) => void;
    onDotMouseMove: (x: number, y: number) => void;
    onDotMouseOut: () => void;
}

/** Render line and area series. */
export function renderLinesAndAreas(
    g: SvgSel,
    categories: CategoryDataPoint[],
    xScale: ScaleBand<string>,
    yScales: Map<AxisBinding, ScaleLinear<number, number>>,
    cfg: RenderConfig,
    measureCount: number,
    layout: ChartLayout,
    callbacks: LineCallbacks,
): void {
    g.selectAll("*").remove();

    const bandwidth = xScale.bandwidth();

    for (let m = 0; m < measureCount; m++) {
        const s = cfg.series[m];
        if (s.chartType !== "line" && s.chartType !== "area") continue;

        const yScale = yScales.get(s.axis);
        if (!yScale) continue;

        /* ── Build point list, skip nulls ── */
        const points: { x: number; y: number; catIdx: number; val: number }[] = [];
        for (const cat of categories) {
            const val = cat.values[m];
            if (val == null) continue;
            const px = (xScale(cat.categoryLabel) ?? 0) + bandwidth / 2;
            const py = yScale(val);
            points.push({ x: px, y: py, catIdx: cat.categoryIndex, val });
        }

        if (points.length === 0) continue;

        /* ── Area fill (beneath line) ── */
        if (s.chartType === "area") {
            const zeroY = yScale(0);
            const areaGen = area<{ x: number; y: number }>()
                .x(d => d.x)
                .y0(zeroY)
                .y1(d => d.y)
                .curve(curveMonotoneX);

            g.append("path")
                .attr("class", "maxes-area")
                .attr("d", areaGen(points) || "")
                .attr("fill", hexWithOpacity(s.color, s.areaOpacity))
                .attr("stroke", "none")
                .attr("data-series", m);
        }

        /* ── Line path ── */
        const lineGen = line<{ x: number; y: number }>()
            .x(d => d.x)
            .y(d => d.y)
            .curve(curveMonotoneX);

        g.append("path")
            .attr("class", "maxes-line")
            .attr("d", lineGen(points) || "")
            .attr("fill", "none")
            .attr("stroke", s.color)
            .attr("stroke-width", s.lineWidth)
            .attr("stroke-dasharray", DASH_PATTERNS[s.lineStyle] || "")
            .attr("data-series", m);

        /* ── Dots ── */
        if (s.dotRadius > 0) {
            for (const pt of points) {
                g.append("circle")
                    .attr("class", "maxes-dot")
                    .attr("cx", pt.x)
                    .attr("cy", pt.y)
                    .attr("r", s.dotRadius)
                    .attr("fill", s.color)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 1)
                    .attr("data-cat", pt.catIdx)
                    .attr("data-series", m)
                    .style("cursor", "pointer")
                    .on("click", (e: MouseEvent) => callbacks.onDotClick(pt.catIdx, m, e))
                    .on("mouseover", (e: MouseEvent) => callbacks.onDotMouseOver(pt.catIdx, m, e.pageX, e.pageY))
                    .on("mousemove", (e: MouseEvent) => callbacks.onDotMouseMove(e.pageX, e.pageY))
                    .on("mouseout", () => callbacks.onDotMouseOut());
            }
        }
    }
}
