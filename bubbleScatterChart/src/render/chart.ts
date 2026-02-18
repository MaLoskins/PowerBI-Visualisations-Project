/* ═══════════════════════════════════════════════
   Chart Renderer
   Bubble (circle) rendering with d3 scales
   ═══════════════════════════════════════════════ */

"use strict";

import { scaleSqrt } from "d3-scale";
import { Selection } from "d3-selection";

import {
    RenderConfig,
    ScatterDataPoint,
} from "../types";
import { LOG_CLAMP_VALUE } from "../constants";
import { NumericScale } from "./axes";

export interface ChartCallbacks {
    onClick: (point: ScatterDataPoint, event: MouseEvent) => void;
    onMouseOver: (point: ScatterDataPoint, event: MouseEvent) => void;
    onMouseMove: (point: ScatterDataPoint, event: MouseEvent) => void;
    onMouseOut: () => void;
}

/**
 * Render bubble circles into the content group.
 * All attribute updates are immediate (no d3-transition dependency).
 */
export function renderBubbles(
    bubbleGroup: Selection<SVGGElement, unknown, null, undefined>,
    points: ScatterDataPoint[],
    xScale: NumericScale,
    yScale: NumericScale,
    cfg: RenderConfig,
    hasSize: boolean,
    callbacks: ChartCallbacks,
): void {
    const chartCfg = cfg.chart;
    const axisCfg = cfg.axis;

    /* ── Size scale ── */
    const sizePoints = points.filter((p) => p.size != null);
    const sizeExtent: [number, number] = hasSize && sizePoints.length > 0
        ? [
              Math.min(...sizePoints.map((p) => p.size!)),
              Math.max(...sizePoints.map((p) => p.size!)),
          ]
        : [1, 1];

    const sizeScale = scaleSqrt()
        .domain([Math.max(0, sizeExtent[0]), Math.max(1, sizeExtent[1])])
        .range([chartCfg.minBubbleRadius, chartCfg.maxBubbleRadius]);

    /* ── Join data ── */
    const circles = bubbleGroup
        .selectAll<SVGCircleElement, ScatterDataPoint>(".bscatter-bubble")
        .data(points, (d: ScatterDataPoint) => d.id);

    /* ── Enter ── */
    const enter = circles
        .enter()
        .append("circle")
        .attr("class", "bscatter-bubble")
        .attr("data-row", (d: ScatterDataPoint) => d.rowIndex)
        .style("cursor", "pointer");

    /* ── Enter + Update (merge) ── */
    const merged = enter.merge(circles);

    merged
        .attr("cx", (d: ScatterDataPoint) => xScale(clampForScale(d.x, axisCfg.xAxisScale))!)
        .attr("cy", (d: ScatterDataPoint) => yScale(clampForScale(d.y, axisCfg.yAxisScale))!)
        .attr("r", (d: ScatterDataPoint) => (hasSize && d.size != null ? sizeScale(Math.max(0, d.size)) : chartCfg.minBubbleRadius))
        .attr("fill", (d: ScatterDataPoint) => d.color)
        .attr("fill-opacity", chartCfg.bubbleOpacity)
        .attr("stroke", chartCfg.bubbleBorderColor)
        .attr("stroke-width", chartCfg.bubbleBorderWidth);

    /* ── Event listeners ── */
    merged
        .on("click", function (_event: MouseEvent, d: ScatterDataPoint) {
            _event.stopPropagation();
            callbacks.onClick(d, _event);
        })
        .on("mouseover", function (_event: MouseEvent, d: ScatterDataPoint) {
            callbacks.onMouseOver(d, _event);
        })
        .on("mousemove", function (_event: MouseEvent, d: ScatterDataPoint) {
            callbacks.onMouseMove(d, _event);
        })
        .on("mouseout", function () {
            callbacks.onMouseOut();
        });

    /* ── Exit ── */
    circles.exit().remove();
}

/**
 * Render ghost/trail bubbles for play-axis animation.
 */
export function renderTrailBubbles(
    trailGroup: Selection<SVGGElement, unknown, null, undefined>,
    points: ScatterDataPoint[],
    xScale: NumericScale,
    yScale: NumericScale,
    cfg: RenderConfig,
    hasSize: boolean,
    axisCfg: RenderConfig["axis"],
): void {
    const chartCfg = cfg.chart;

    const sizePoints = points.filter((p) => p.size != null);
    const sizeExtent: [number, number] = hasSize && sizePoints.length > 0
        ? [
              Math.min(...sizePoints.map((p) => p.size!)),
              Math.max(...sizePoints.map((p) => p.size!)),
          ]
        : [1, 1];

    const sizeScale = scaleSqrt()
        .domain([Math.max(0, sizeExtent[0]), Math.max(1, sizeExtent[1])])
        .range([chartCfg.minBubbleRadius, chartCfg.maxBubbleRadius]);

    const trails = trailGroup
        .selectAll<SVGCircleElement, ScatterDataPoint>(".bscatter-trail")
        .data(points, (d: ScatterDataPoint) => d.id + "-trail");

    trails
        .enter()
        .append("circle")
        .attr("class", "bscatter-trail")
        .attr("cx", (d: ScatterDataPoint) => xScale(clampForScale(d.x, axisCfg.xAxisScale))!)
        .attr("cy", (d: ScatterDataPoint) => yScale(clampForScale(d.y, axisCfg.yAxisScale))!)
        .attr("r", (d: ScatterDataPoint) => (hasSize && d.size != null ? sizeScale(Math.max(0, d.size)) : chartCfg.minBubbleRadius))
        .attr("fill", (d: ScatterDataPoint) => d.color)
        .attr("fill-opacity", cfg.play.trailOpacity)
        .attr("stroke", "none")
        .style("pointer-events", "none");

    trails.exit().remove();
}

/* ── Helpers ── */

function clampForScale(value: number, scaleType: string): number {
    if (scaleType === "log" && value <= 0) return LOG_CLAMP_VALUE;
    return value;
}
