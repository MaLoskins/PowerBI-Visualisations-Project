/*
 *  Marimekko Chart – Power BI Custom Visual
 *  render/chart.ts — Primary chart rendering (columns, segments, patterns)
 */
"use strict";

import * as d3 from "d3-selection";

import { MekkoColumn, MekkoSegment, RenderConfig, ChartCallbacks } from "../types";
import { NEGATIVE_PATTERN_ID } from "../constants";

/* ═══════════════════════════════════════════════
   Layout Pass
   Compute x, width, y, height for all columns and segments.
   ═══════════════════════════════════════════════ */

/** Assign pixel positions to all columns and their segments (M1) */
export function layoutColumns(
    columns: MekkoColumn[],
    chartWidth: number,
    chartHeight: number,
    columnGap: number,
    segmentGap: number,
): void {
    const numCols = columns.length;
    if (numCols === 0) return;

    const totalGap = columnGap * (numCols - 1);
    const availableWidth = Math.max(0, chartWidth - totalGap);

    let cx = 0;
    for (const col of columns) {
        col.width = Math.max(0, col.fractionOfTotal * availableWidth);
        col.x = cx;
        cx += col.width + columnGap;

        /* Stack segments top-to-bottom */
        const numSegs = col.segments.length;
        const totalSegGap = segmentGap * Math.max(0, numSegs - 1);
        const availableHeight = Math.max(0, chartHeight - totalSegGap);

        let sy = 0;
        for (const seg of col.segments) {
            seg.height = Math.max(0, seg.fractionOfColumn * availableHeight);
            seg.y = sy;
            sy += seg.height + segmentGap;
        }
    }
}

/* ═══════════════════════════════════════════════
   Defs — hatched pattern for negative values
   ═══════════════════════════════════════════════ */

/** Ensure the SVG <defs> contains the hatch pattern for negative values */
export function ensureHatchPattern(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
): void {
    if (svg.select(`#${NEGATIVE_PATTERN_ID}`).empty()) {
        const defs = svg.select("defs").empty()
            ? svg.append("defs")
            : svg.select<SVGDefsElement>("defs");

        const pattern = defs.append("pattern")
            .attr("id", NEGATIVE_PATTERN_ID)
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", 6)
            .attr("height", 6)
            .attr("patternTransform", "rotate(45)");

        pattern.append("line")
            .attr("x1", 0).attr("y1", 0)
            .attr("x2", 0).attr("y2", 6)
            .attr("stroke", "rgba(0,0,0,0.3)")
            .attr("stroke-width", 2);
    }
}

/* ═══════════════════════════════════════════════
   Render Segments
   ═══════════════════════════════════════════════ */

/** Render all column segments as rects into the chart group (M2) */
export function renderSegments(
    chartG: d3.Selection<SVGGElement, unknown, null, undefined>,
    columns: MekkoColumn[],
    cfg: RenderConfig,
    callbacks: ChartCallbacks,
): void {
    chartG.selectAll(".marimekko-column").remove();

    for (const col of columns) {
        const colG = chartG.append("g")
            .attr("class", "marimekko-column")
            .attr("data-x-category", col.xCategory);

        for (const seg of col.segments) {
            if (seg.height <= 0 || col.width <= 0) continue;

            const segG = colG.append("g")
                .attr("class", "marimekko-segment")
                .attr("data-segment", seg.segmentCategory)
                .attr("data-row", String(seg.rowIndex))
                .style("cursor", "pointer");

            /* Main filled rect */
            segG.append("rect")
                .attr("class", "marimekko-segment-rect")
                .attr("x", col.x)
                .attr("y", seg.y)
                .attr("width", col.width)
                .attr("height", seg.height)
                .attr("rx", cfg.chart.cornerRadius)
                .attr("ry", cfg.chart.cornerRadius)
                .attr("fill", seg.color)
                .attr("stroke", cfg.color.segmentBorderColor)
                .attr("stroke-width", cfg.color.segmentBorderWidth);

            /* Hatch overlay for negative values */
            if (seg.isNegative) {
                segG.append("rect")
                    .attr("class", "marimekko-segment-hatch")
                    .attr("x", col.x)
                    .attr("y", seg.y)
                    .attr("width", col.width)
                    .attr("height", seg.height)
                    .attr("rx", cfg.chart.cornerRadius)
                    .attr("ry", cfg.chart.cornerRadius)
                    .attr("fill", `url(#${NEGATIVE_PATTERN_ID})`)
                    .attr("pointer-events", "none");
            }

            /* Click handler */
            segG.on("click", (event: MouseEvent) => {
                event.stopPropagation();
                callbacks.onSegmentClick(seg, event);
            });
        }
    }
}

/* ═══════════════════════════════════════════════
   Background click handler
   ═══════════════════════════════════════════════ */

/** Attach background click to deselect */
export function attachBackgroundClick(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    callbacks: ChartCallbacks,
): void {
    svg.on("click", () => {
        callbacks.onBackgroundClick();
    });
}
