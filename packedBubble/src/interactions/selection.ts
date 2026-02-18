/* ═══════════════════════════════════════════════
   Packed Bubble Chart – Selection Handler
   ═══════════════════════════════════════════════ */

"use strict";

import { Selection } from "d3-selection";
import { BubbleNode } from "../types";
import { SimNode } from "../layout/simulation";
import { CSS_PREFIX } from "../constants";

import powerbi from "powerbi-visuals-api";
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.visuals.ISelectionId;

type SVGSel = Selection<SVGSVGElement, unknown, null, undefined>;

/** Handle click on a bubble: select or multi-select */
export function handleBubbleClick(
    node: BubbleNode,
    event: MouseEvent,
    selectionManager: ISelectionManager,
): void {
    const isMulti = event.ctrlKey || event.metaKey;
    selectionManager.select(node.selectionId, isMulti);
}

/** Handle click on background: clear selection */
export function handleBackgroundClick(
    selectionManager: ISelectionManager,
): void {
    selectionManager.clear();
}

/** Apply selection styles to bubbles.
 *  Dims unselected bubbles when there's an active selection. */
export function applySelectionStyles(
    svg: SVGSel,
    selectionManager: ISelectionManager,
    defaultOpacity: number,
): void {
    const selectedIds = selectionManager.getSelectionIds() as ISelectionId[];
    const hasSelection = selectedIds.length > 0;

    svg.select<SVGGElement>(`.${CSS_PREFIX}-bubbles`)
        .selectAll<SVGGElement, SimNode>(`.${CSS_PREFIX}-bubble`)
        .each(function (d) {
            const circle = this.querySelector(`.${CSS_PREFIX}-circle`) as SVGCircleElement | null;
            if (!circle) return;

            if (!hasSelection) {
                circle.setAttribute("fill-opacity", String(defaultOpacity));
                circle.removeAttribute("data-selected");
                return;
            }

            const isSelected = selectedIds.some(
                (sid) => sid.equals(d.selectionId),
            );

            circle.setAttribute("fill-opacity", isSelected ? String(defaultOpacity) : "0.25");
            if (isSelected) {
                circle.setAttribute("data-selected", "true");
            } else {
                circle.removeAttribute("data-selected");
            }
        });

    /* Also dim labels for unselected bubbles */
    if (hasSelection) {
        svg.select<SVGGElement>(`.${CSS_PREFIX}-labels`)
            .selectAll<SVGGElement, SimNode>(`.${CSS_PREFIX}-label`)
            .style("opacity", (d) => {
                const isSelected = selectedIds.some(
                    (sid) => sid.equals(d.selectionId),
                );
                return isSelected ? "1" : "0.25";
            });
    } else {
        svg.select<SVGGElement>(`.${CSS_PREFIX}-labels`)
            .selectAll<SVGGElement, SimNode>(`.${CSS_PREFIX}-label`)
            .style("opacity", "1");
    }
}
