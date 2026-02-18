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

/* ── Helpers ── */

function clampForScale(value: number, scaleType: string): number {
    if (scaleType === "log" && value <= 0) return LOG_CLAMP_VALUE;
    return value;
}

function buildSizeScale(
    points: ScatterDataPoint[],
    hasSize: boolean,
    chartCfg: RenderConfig["chart"],
): (value: number) => number {
    const sizePoints = hasSize ? points.filter((p) => p.size != null) : [];
    const sizeExtent: [number, number] = sizePoints.length > 0
        ? [
              Math.min(...sizePoints.map((p) => p.size!)),
              Math.max(...sizePoints.map((p) => p.size!)),
          ]
        : [1, 1];

    const scale = scaleSqrt()
        .domain([Math.max(0, sizeExtent[0]), Math.max(1, sizeExtent[1])])
        .range([chartCfg.minBubbleRadius, chartCfg.maxBubbleRadius]);
    return (v: number) => scale(v) as number;
}

/**
 * Render bubble circles into the content group.
 * Uses .join() for correct enter/update/exit handling.
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
    const sizeScale = buildSizeScale(points, hasSize, chartCfg);

    /* ── Join data ── */
    const merged = bubbleGroup
        .selectAll<SVGCircleElement, ScatterDataPoint>(".bscatter-bubble")
        .data(points, (d: ScatterDataPoint) => d.id)
        .join(
            (enter) =>
                enter
                    .append("circle")
                    .attr("class", "bscatter-bubble")
                    .attr("data-row", (d: ScatterDataPoint) => d.rowIndex)
                    .style("cursor", "pointer"),
        );

    merged
        .attr("cx", (d: ScatterDataPoint) => xScale(clampForScale(d.x, axisCfg.xAxisScale)) ?? 0)
        .attr("cy", (d: ScatterDataPoint) => yScale(clampForScale(d.y, axisCfg.yAxisScale)) ?? 0)
        .attr("r", (d: ScatterDataPoint) =>
            hasSize && d.size != null
                ? sizeScale(Math.max(0, d.size))
                : chartCfg.minBubbleRadius,
        )
        .attr("fill", (d: ScatterDataPoint) => d.color)
        .attr("fill-opacity", chartCfg.bubbleOpacity)
        .attr("stroke", chartCfg.bubbleBorderColor)
        .attr("stroke-width", chartCfg.bubbleBorderWidth);

    /* ── Event listeners ── */
    merged
        .on("click", function (event: MouseEvent, d: ScatterDataPoint) {
            event.stopPropagation();
            callbacks.onClick(d, event);
        })
        .on("mouseover", function (event: MouseEvent, d: ScatterDataPoint) {
            callbacks.onMouseOver(d, event);
        })
        .on("mousemove", function (event: MouseEvent, d: ScatterDataPoint) {
            callbacks.onMouseMove(d, event);
        })
        .on("mouseout", function () {
            callbacks.onMouseOut();
        });
}

/**
 * Render ghost/trail bubbles for play-axis animation.
 * Uses .join() for correct enter/update/exit handling.
 */
export function renderTrailBubbles(
    trailGroup: Selection<SVGGElement, unknown, null, undefined>,
    points: ScatterDataPoint[],
    xScale: NumericScale,
    yScale: NumericScale,
    cfg: RenderConfig,
    hasSize: boolean,
): void {
    const chartCfg = cfg.chart;
    const axisCfg = cfg.axis;
    const sizeScale = buildSizeScale(points, hasSize, chartCfg);

    trailGroup
        .selectAll<SVGCircleElement, ScatterDataPoint>(".bscatter-trail")
        .data(points, (d: ScatterDataPoint) => `${d.id}-trail`)
        .join(
            (enter) =>
                enter
                    .append("circle")
                    .attr("class", "bscatter-trail")
                    .attr("stroke", "none")
                    .style("pointer-events", "none"),
        )
        .attr("cx", (d: ScatterDataPoint) => xScale(clampForScale(d.x, axisCfg.xAxisScale)) ?? 0)
        .attr("cy", (d: ScatterDataPoint) => yScale(clampForScale(d.y, axisCfg.yAxisScale)) ?? 0)
        .attr("r", (d: ScatterDataPoint) =>
            hasSize && d.size != null
                ? sizeScale(Math.max(0, d.size))
                : chartCfg.minBubbleRadius,
        )
        .attr("fill", (d: ScatterDataPoint) => d.color)
        .attr("fill-opacity", cfg.play.trailOpacity);
}
