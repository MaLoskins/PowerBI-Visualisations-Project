/* ═══════════════════════════════════════════════
   Advanced Gauge – Label Renderer
   Value label, min/max labels, title
   ═══════════════════════════════════════════════ */
"use strict";

import { select } from "d3-selection";
import type { RenderConfig, GaugeData, GaugeLayout } from "../types";
import { CSS_PREFIX } from "../constants";
import { formatValue, formatMinMax } from "../utils/format";

/**
 * Render all text labels for the gauge.
 * Appends to the same SVG as the gauge arcs — positions are absolute (not relative to gauge group).
 */
export function renderLabels(
    svg: SVGSVGElement,
    data: GaugeData,
    layout: GaugeLayout,
    cfg: RenderConfig,
    locale: string,
): void {
    const d3svg = select(svg);
    const { cx, cy, outerRadius, startAngleRad, endAngleRad } = layout;

    /* ── Value Label (centred inside the arc) ── */
    if (cfg.labels.showValueLabel) {
        const formattedValue = formatValue(
            data.value,
            cfg.labels.valueFormat,
            data.minValue,
            data.maxValue,
            data.valueFormatString,
            locale,
        );

        d3svg.append("text")
            .attr("class", CSS_PREFIX + "value-label")
            .attr("x", cx)
            .attr("y", cy + cfg.labels.valueFontSize * 0.15)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", cfg.labels.valueFontColor)
            .attr("font-size", cfg.labels.valueFontSize + "px")
            .attr("font-weight", "600")
            .text(formattedValue);
    }

    /* ── Min / Max Labels (at arc endpoints) ── */
    if (cfg.labels.showMinMaxLabels) {
        const labelOffset = 6;

        // Min label (left end of arc)
        const minSin = Math.sin(startAngleRad);
        const minCos = Math.cos(startAngleRad);
        const minX = cx + minSin * (outerRadius + labelOffset);
        const minY = cy - minCos * (outerRadius + labelOffset);

        d3svg.append("text")
            .attr("class", CSS_PREFIX + "min-label")
            .attr("x", minX)
            .attr("y", minY + cfg.labels.minMaxFontSize)
            .attr("text-anchor", minSin < 0 ? "end" : "start")
            .attr("fill", cfg.labels.minMaxFontColor)
            .attr("font-size", cfg.labels.minMaxFontSize + "px")
            .text(formatMinMax(data.minValue, locale));

        // Max label (right end of arc)
        const maxSin = Math.sin(endAngleRad);
        const maxCos = Math.cos(endAngleRad);
        const maxX = cx + maxSin * (outerRadius + labelOffset);
        const maxY = cy - maxCos * (outerRadius + labelOffset);

        d3svg.append("text")
            .attr("class", CSS_PREFIX + "max-label")
            .attr("x", maxX)
            .attr("y", maxY + cfg.labels.minMaxFontSize)
            .attr("text-anchor", maxSin > 0 ? "end" : "start")
            .attr("fill", cfg.labels.minMaxFontColor)
            .attr("font-size", cfg.labels.minMaxFontSize + "px")
            .text(formatMinMax(data.maxValue, locale));
    }

    /* ── Title (above the gauge) ── */
    if (cfg.labels.showTitle && cfg.labels.titleText) {
        d3svg.append("text")
            .attr("class", CSS_PREFIX + "title")
            .attr("x", cx)
            .attr("y", cfg.labels.titleFontSize + 4)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "hanging")
            .attr("fill", cfg.labels.titleFontColor)
            .attr("font-size", cfg.labels.titleFontSize + "px")
            .attr("font-weight", "600")
            .text(cfg.labels.titleText);
    }
}
