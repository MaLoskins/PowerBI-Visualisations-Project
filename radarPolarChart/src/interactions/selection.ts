/* ═══════════════════════════════════════════════
   Selection – apply visual selection styles
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import { select } from "d3-selection";
import { RadarDataPoint } from "../types";

/** Apply dimming to unselected polygons and dots */
export function applySelectionStyles(
    svgRoot: SVGSVGElement,
    selectionManager: ISelectionManager,
): void {
    const ids = selectionManager.getSelectionIds() as ISelectionId[];
    const hasSelection = ids.length > 0;

    /* Polygons */
    select(svgRoot)
        .selectAll<SVGElement, unknown>(".radar-polygon")
        .classed("radar-dimmed", function () {
            if (!hasSelection) return false;
            const si = this.getAttribute("data-series-index");
            return !ids.some((id) => {
                /* check if any selected id matches this series */
                const json = JSON.stringify(id);
                return json.includes(`"seriesIndex":${si}`);
            });
        });

    /* Dots */
    select(svgRoot)
        .selectAll<SVGElement, unknown>(".radar-dot")
        .classed("radar-dimmed", function () {
            if (!hasSelection) return false;
            return false; /* dots follow polygon selection for now */
        });
}

/** Handle click on a data point (dot or polygon vertex) */
export function handlePointClick(
    point: RadarDataPoint,
    event: MouseEvent,
    selectionManager: ISelectionManager,
): void {
    const multiSelect = event.ctrlKey || event.metaKey;
    selectionManager.select(point.selectionId, multiSelect);
}

/** Handle background click to clear selection */
export function handleBackgroundClick(
    selectionManager: ISelectionManager,
): void {
    selectionManager.clear();
}
