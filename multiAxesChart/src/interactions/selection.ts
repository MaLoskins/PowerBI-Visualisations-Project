/* ═══════════════════════════════════════════════
   Selection — apply selection styles to SVG
   ═══════════════════════════════════════════════ */
"use strict";

import { select, Selection } from "d3-selection";
import type { RenderConfig } from "../types";

type SvgRoot = Selection<SVGSVGElement, unknown, null, undefined>;

const DIMMED_OPACITY = 0.25;
const FULL_OPACITY = 1;

/** Apply selection highlight/dimming to all chart elements. */
export function applySelectionStyles(
    svg: SvgRoot,
    selectedCatIndices: Set<number>,
    hasSelection: boolean,
    cfg: RenderConfig,
): void {
    if (!hasSelection) {
        // No selection — restore all elements to full opacity
        svg.selectAll(".maxes-bar, .maxes-line, .maxes-area, .maxes-dot, .maxes-data-label")
            .attr("opacity", FULL_OPACITY);
        svg.selectAll(".maxes-bar")
            .attr("stroke", "none")
            .attr("stroke-width", 0);
        return;
    }

    /* ── Bars ── */
    svg.selectAll(".maxes-bar").each(function () {
        const el = select(this);
        const catIdx = parseInt(el.attr("data-cat") ?? "-1", 10);
        const isSelected = selectedCatIndices.has(catIdx);
        el.attr("opacity", isSelected ? FULL_OPACITY : DIMMED_OPACITY);

        if (isSelected) {
            el.attr("stroke", cfg.colors.selectedColor)
                .attr("stroke-width", 2);
        } else {
            el.attr("stroke", "none")
                .attr("stroke-width", 0);
        }
    });

    /* ── Dots ── */
    svg.selectAll(".maxes-dot").each(function () {
        const el = select(this);
        const catIdx = parseInt(el.attr("data-cat") ?? "-1", 10);
        const isSelected = selectedCatIndices.has(catIdx);
        el.attr("opacity", isSelected ? FULL_OPACITY : DIMMED_OPACITY);

        if (isSelected) {
            el.attr("stroke", cfg.colors.selectedColor)
                .attr("stroke-width", 2);
        } else {
            el.attr("stroke", "#fff")
                .attr("stroke-width", 1);
        }
    });

    /* ── Lines and areas: dim if no selected cats have data on this series ── */
    svg.selectAll(".maxes-line, .maxes-area").each(function () {
        const el = select(this);
        // Lines/areas are per-series, dim them slightly if selection is active
        el.attr("opacity", 0.4);
    });

    /* ── Data labels ── */
    svg.selectAll(".maxes-data-label")
        .attr("opacity", DIMMED_OPACITY);
}
