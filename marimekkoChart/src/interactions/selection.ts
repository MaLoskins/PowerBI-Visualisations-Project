/*
 *  Marimekko Chart – Power BI Custom Visual
 *  interactions/selection.ts — Selection highlight logic
 */
"use strict";

import * as d3 from "d3-selection";

import { MekkoSegment } from "../types";
import { DIM_OPACITY, FULL_OPACITY, SELECTED_STROKE_WIDTH } from "../constants";

/**
 * Apply selection highlighting to segment rects.
 * If no selection is active, all segments are fully opaque.
 * Otherwise, selected segments are highlighted, others dimmed.
 */
export function applySelectionStyles(
    chartG: d3.Selection<SVGGElement, unknown, null, undefined>,
    selectedRows: Set<number>,
    selectedColor: string,
): void {
    const hasSelection = selectedRows.size > 0;

    chartG.selectAll<SVGGElement, unknown>(".marimekko-segment").each(function () {
        const segG = d3.select(this);
        const rowStr = segG.attr("data-row");
        const rowIdx = rowStr !== null ? parseInt(rowStr, 10) : -1;
        const isSelected = hasSelection && selectedRows.has(rowIdx);

        const rect = segG.select(".marimekko-segment-rect");

        if (!hasSelection) {
            /* No selection — full opacity, no highlight */
            segG.style("opacity", String(FULL_OPACITY));
            rect.attr("stroke", null)
                .attr("stroke-width", null);
        } else if (isSelected) {
            /* Selected — full opacity with highlight stroke */
            segG.style("opacity", String(FULL_OPACITY));
            rect.attr("stroke", selectedColor)
                .attr("stroke-width", SELECTED_STROKE_WIDTH);
        } else {
            /* Not selected — dimmed */
            segG.style("opacity", String(DIM_OPACITY));
            rect.attr("stroke", null)
                .attr("stroke-width", null);
        }
    });
}

/** Get the set of row indices from currently selected segments */
export function getSelectedRowSet(
    selectedSegments: MekkoSegment[],
): Set<number> {
    return new Set(selectedSegments.map((s) => s.rowIndex));
}
