/*
 *  Advanced Pie / Donut Chart – Power BI Custom Visual
 *  interactions/selection.ts – Selection styling and helpers
 */
"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.visuals.ISelectionId;

import { select } from "d3-selection";
import { PieArcDatum } from "d3-shape";

import { PieSlice, OuterSlice, RenderConfig } from "../types";
import { DIM_OPACITY, FULL_OPACITY } from "../constants";

/* ═══════════════════════════════════════════════
   Apply Selection Styles (I1)
   ═══════════════════════════════════════════════ */

/** Dim unselected slices and scale selected ones */
export function applySelectionStyles(
    svgEl: SVGSVGElement,
    legendEl: HTMLElement,
    selectionManager: ISelectionManager,
    cfg: RenderConfig,
): void {
    const ids = selectionManager.getSelectionIds() as ISelectionId[];
    const hasSelection = ids.length > 0;

    const svg = select(svgEl);

    /* ── Main slices ── */
    svg.selectAll<SVGPathElement, PieArcDatum<PieSlice>>(".apie-slice")
        .style("opacity", (d: PieArcDatum<PieSlice>) => {
            if (!hasSelection) return String(FULL_OPACITY);
            const match = ids.some((id: ISelectionId) => id.equals(d.data.selectionId));
            return match ? String(FULL_OPACITY) : String(DIM_OPACITY);
        })
        .attr("transform", (d: PieArcDatum<PieSlice>) => {
            if (!hasSelection) return "scale(1)";
            const match = ids.some((id: ISelectionId) => id.equals(d.data.selectionId));
            return match ? `scale(${cfg.color.selectedSliceScale})` : "scale(1)";
        });

    /* ── Outer ring slices ── */
    interface OuterArcBound { data: OuterSlice }
    svg.selectAll<SVGPathElement, OuterArcBound>(".apie-outer-slice")
        .style("opacity", (d: OuterArcBound) => {
            if (!hasSelection) return String(FULL_OPACITY);
            const match = ids.some((id: ISelectionId) => id.equals(d.data.selectionId));
            return match ? String(FULL_OPACITY) : String(DIM_OPACITY);
        });

    /* ── Legend items ── */
    const legendItems = legendEl.querySelectorAll(".apie-legend-item");
    legendItems.forEach((item: Element) => {
        const htmlItem = item as HTMLElement;
        htmlItem.style.opacity = hasSelection ? String(DIM_OPACITY) : String(FULL_OPACITY);
    });
}

/* ═══════════════════════════════════════════════
   Click Handlers (I2)
   ═══════════════════════════════════════════════ */

/** Handle click on a main slice */
export async function handleSliceClick(
    slice: PieSlice,
    event: MouseEvent,
    selectionManager: ISelectionManager,
): Promise<void> {
    const multiSelect = event.ctrlKey || event.metaKey;
    await selectionManager.select(slice.selectionId, multiSelect);
}

/** Handle click on an outer ring slice */
export async function handleOuterSliceClick(
    slice: OuterSlice,
    event: MouseEvent,
    selectionManager: ISelectionManager,
): Promise<void> {
    const multiSelect = event.ctrlKey || event.metaKey;
    await selectionManager.select(slice.selectionId, multiSelect);
}

/** Handle background click to clear selection */
export async function handleBackgroundClick(
    selectionManager: ISelectionManager,
): Promise<void> {
    await selectionManager.clear();
}
