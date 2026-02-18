/* ═══════════════════════════════════════════════
   WaterfallChart - Selection Handling
   Click-to-select, multi-select, deselect, dimming
   ═══════════════════════════════════════════════ */

"use strict";

import { select } from "d3-selection";
import { WaterfallBar } from "../types";
import { CSS_PREFIX, UNSELECTED_OPACITY } from "../constants";

/**
 * Apply visual selection styles to bar rects.
 * Dims unselected bars when a selection is active.
 */
export function applySelectionStyles(
    svgRoot: SVGSVGElement,
    selectedIds: Set<string>,
    bars: WaterfallBar[],
    selectedColor: string,
): void {
    const hasSelection = selectedIds.size > 0;

    select(svgRoot)
        .selectAll<SVGRectElement, WaterfallBar>(`.${CSS_PREFIX}bar`)
        .data(bars, (d) => d.category + ":" + d.rowIndex)
        .attr("opacity", (d) => {
            if (!hasSelection) return 1;
            const key = selectionKey(d);
            return selectedIds.has(key) ? 1 : UNSELECTED_OPACITY;
        })
        .attr("stroke", (d) => {
            if (!hasSelection) return "none";
            const key = selectionKey(d);
            return selectedIds.has(key) ? selectedColor : "none";
        })
        .attr("stroke-width", (d) => {
            if (!hasSelection) return 0;
            const key = selectionKey(d);
            return selectedIds.has(key) ? 2 : 0;
        });
}

/** Generate a stable key for a bar for selection matching. */
export function selectionKey(bar: WaterfallBar): string {
    return bar.category + ":" + bar.rowIndex;
}

/** Build a set of selected keys from the selection manager's current IDs. */
export function buildSelectedKeySet(
    bars: WaterfallBar[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Power BI SDK type
    selectionManager: any,
): Set<string> {
    const selectedIds = selectionManager.getSelectionIds() as { key?: string }[];
    if (!selectedIds || selectedIds.length === 0) return new Set();

    const selectedKeyStrings = new Set(
        selectedIds.map((id: { key?: string }) => JSON.stringify(id)),
    );

    const result = new Set<string>();
    for (const bar of bars) {
        if (!bar.selectionId) continue;
        const barIdStr = JSON.stringify(bar.selectionId);
        if (selectedKeyStrings.has(barIdStr)) {
            result.add(selectionKey(bar));
        }
    }
    return result;
}
