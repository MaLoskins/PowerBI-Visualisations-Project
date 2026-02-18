/* ═══════════════════════════════════════════════
   Quadrant Renderer
   Crossing lines + corner labels
   ═══════════════════════════════════════════════ */

"use strict";

import { Selection } from "d3-selection";

import { ChartDimensions, RenderConfig } from "../types";
import { DASH_ARRAYS, QUADRANT_LABEL_PAD, QUADRANT_LABEL_FONT_SIZE } from "../constants";
import { NumericScale } from "./axes";

/**
 * Render quadrant dividing lines and optional labels.
 */
export function renderQuadrants(
    quadrantGroup: Selection<SVGGElement, unknown, null, undefined>,
    xScale: NumericScale,
    yScale: NumericScale,
    dims: ChartDimensions,
    cfg: RenderConfig["quadrant"],
): void {
    quadrantGroup.selectAll("*").remove();

    if (!cfg.showQuadrants) return;

    const cx = xScale(cfg.quadrantXValue) ?? 0;
    const cy = yScale(cfg.quadrantYValue) ?? 0;

    const dashArray = DASH_ARRAYS[cfg.quadrantLineStyle] ?? "none";

    /* ── Vertical line (X = quadrantXValue) ── */
    if (cx >= 0 && cx <= dims.plotWidth) {
        quadrantGroup
            .append("line")
            .attr("class", "bscatter-quadrant-line")
            .attr("x1", cx)
            .attr("x2", cx)
            .attr("y1", 0)
            .attr("y2", dims.plotHeight)
            .attr("stroke", cfg.quadrantLineColor)
            .attr("stroke-width", cfg.quadrantLineWidth)
            .attr("stroke-dasharray", dashArray)
            .attr("shape-rendering", "crispEdges")
            .style("pointer-events", "none");
    }

    /* ── Horizontal line (Y = quadrantYValue) ── */
    if (cy >= 0 && cy <= dims.plotHeight) {
        quadrantGroup
            .append("line")
            .attr("class", "bscatter-quadrant-line")
            .attr("x1", 0)
            .attr("x2", dims.plotWidth)
            .attr("y1", cy)
            .attr("y2", cy)
            .attr("stroke", cfg.quadrantLineColor)
            .attr("stroke-width", cfg.quadrantLineWidth)
            .attr("stroke-dasharray", dashArray)
            .attr("shape-rendering", "crispEdges")
            .style("pointer-events", "none");
    }

    /* ── Quadrant labels ── */
    if (!cfg.showQuadrantLabels) return;

    const labelColor = cfg.quadrantLineColor;
    const pad = QUADRANT_LABEL_PAD;
    const fs = QUADRANT_LABEL_FONT_SIZE;

    // Q1: top-right (high x, high y)
    quadrantGroup
        .append("text")
        .attr("class", "bscatter-quadrant-label")
        .attr("x", Math.min(dims.plotWidth - pad, Math.max(cx + pad, pad)))
        .attr("y", Math.max(pad + fs, Math.min(cy - pad, dims.plotHeight - pad)))
        .attr("text-anchor", cx + pad < dims.plotWidth / 2 ? "start" : "end")
        .attr("fill", labelColor)
        .attr("font-size", `${fs}px`)
        .attr("opacity", 0.6)
        .style("pointer-events", "none")
        .text(cfg.q1Label);

    // Q2: top-left (low x, high y)
    quadrantGroup
        .append("text")
        .attr("class", "bscatter-quadrant-label")
        .attr("x", Math.max(pad, Math.min(cx - pad, dims.plotWidth - pad)))
        .attr("y", Math.max(pad + fs, Math.min(cy - pad, dims.plotHeight - pad)))
        .attr("text-anchor", cx - pad > dims.plotWidth / 2 ? "end" : "start")
        .attr("fill", labelColor)
        .attr("font-size", `${fs}px`)
        .attr("opacity", 0.6)
        .style("pointer-events", "none")
        .text(cfg.q2Label);

    // Q3: bottom-left (low x, low y)
    quadrantGroup
        .append("text")
        .attr("class", "bscatter-quadrant-label")
        .attr("x", Math.max(pad, Math.min(cx - pad, dims.plotWidth - pad)))
        .attr("y", Math.min(dims.plotHeight - pad, Math.max(cy + pad + fs, pad + fs)))
        .attr("text-anchor", cx - pad > dims.plotWidth / 2 ? "end" : "start")
        .attr("fill", labelColor)
        .attr("font-size", `${fs}px`)
        .attr("opacity", 0.6)
        .style("pointer-events", "none")
        .text(cfg.q3Label);

    // Q4: bottom-right (high x, low y)
    quadrantGroup
        .append("text")
        .attr("class", "bscatter-quadrant-label")
        .attr("x", Math.min(dims.plotWidth - pad, Math.max(cx + pad, pad)))
        .attr("y", Math.min(dims.plotHeight - pad, Math.max(cy + pad + fs, pad + fs)))
        .attr("text-anchor", cx + pad < dims.plotWidth / 2 ? "start" : "end")
        .attr("fill", labelColor)
        .attr("font-size", `${fs}px`)
        .attr("opacity", 0.6)
        .style("pointer-events", "none")
        .text(cfg.q4Label);
}
