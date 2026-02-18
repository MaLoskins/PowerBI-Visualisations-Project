/* ═══════════════════════════════════════════════
   Trend Line Renderer
   Regression path sampled at ~100 points
   ═══════════════════════════════════════════════ */

"use strict";

import { line } from "d3-shape";
import { Selection } from "d3-selection";

import { ChartDimensions, RenderConfig, ScatterDataPoint } from "../types";
import { TREND_LINE_SAMPLES, DASH_ARRAYS } from "../constants";
import { computeRegression } from "../utils/regression";
import { NumericScale } from "./axes";

/**
 * Render the trend line as a <path> element.
 * Samples the regression function across the x domain.
 */
export function renderTrendLine(
    trendGroup: Selection<SVGGElement, unknown, null, undefined>,
    points: ScatterDataPoint[],
    xScale: NumericScale,
    yScale: NumericScale,
    dims: ChartDimensions,
    cfg: RenderConfig["trend"],
): void {
    trendGroup.selectAll("*").remove();

    if (!cfg.showTrendLine || points.length < 2) return;

    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);

    const predictFn = computeRegression(xs, ys, cfg.trendLineType);
    if (!predictFn) return;

    /* ── Sample points across the x domain ── */
    const domain = xScale.domain() as [number, number];
    const step = (domain[1] - domain[0]) / TREND_LINE_SAMPLES;
    const pathData: [number, number][] = [];

    for (let i = 0; i <= TREND_LINE_SAMPLES; i++) {
        const xVal = domain[0] + i * step;
        const yVal = predictFn(xVal);
        const px = xScale(xVal)!;
        const py = yScale(yVal)!;

        // Only include points within the plot area (with small buffer)
        if (px >= -10 && px <= dims.plotWidth + 10 && isFinite(py)) {
            pathData.push([px, Math.max(-10, Math.min(dims.plotHeight + 10, py))]);
        }
    }

    if (pathData.length < 2) return;

    const lineGen = line<[number, number]>()
        .x((d) => d[0])
        .y((d) => d[1]);

    const dashArray = cfg.trendLineStyle === "dashed" ? DASH_ARRAYS["dashed"] : "none";

    trendGroup
        .append("path")
        .attr("class", "bscatter-trend-line")
        .attr("d", lineGen(pathData)!)
        .attr("fill", "none")
        .attr("stroke", cfg.trendLineColor)
        .attr("stroke-width", cfg.trendLineWidth)
        .attr("stroke-dasharray", dashArray)
        .style("pointer-events", "none");
}
