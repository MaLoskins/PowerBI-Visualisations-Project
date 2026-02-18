/* ═══════════════════════════════════════════════
   Selection Handler
   Click-to-select, multi-select, deselect
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.visuals.ISelectionId;

import { ScatterDataPoint } from "../types";
import { UNSELECTED_OPACITY } from "../constants";

/**
 * Handle click on a data point. Supports Ctrl/Meta multi-select.
 */
export function handleBubbleClick(
    point: ScatterDataPoint,
    event: MouseEvent,
    selectionManager: ISelectionManager,
    onSelectionChanged: () => void,
): void {
    const isMulti = event.ctrlKey || event.metaKey;
    selectionManager.select(point.selectionId, isMulti).then(() => {
        onSelectionChanged();
    });
}

/**
 * Handle click on empty background to clear selection.
 */
export function handleBackgroundClick(
    selectionManager: ISelectionManager,
    onSelectionChanged: () => void,
): void {
    selectionManager.clear().then(() => {
        onSelectionChanged();
    });
}

/**
 * Apply selection styling to bubble elements.
 * Dims unselected bubbles when any selection is active.
 */
export function applySelectionStyles(
    svgContainer: SVGGElement,
    selectionManager: ISelectionManager,
    points: ScatterDataPoint[],
): void {
    // Type workaround: selectionManager.getSelectionIds() returns ISelectionId[] (P1)
    const selectedIds = selectionManager.getSelectionIds() as ISelectionId[];
    const hasSelection = selectedIds.length > 0;

    if (!hasSelection) {
        // Restore all bubbles to full opacity
        const circles = svgContainer.querySelectorAll(".bscatter-bubble");
        circles.forEach((circle) => {
            (circle as SVGCircleElement).style.opacity = "1";
        });
        return;
    }

    // Build set of selected row indices for fast lookup
    const selectedSet = new Set<string>();
    for (const sid of selectedIds) {
        // Compare by key (P1)
        const key = (sid as unknown as { key: string }).key;
        if (key) selectedSet.add(key);
    }

    const circles = svgContainer.querySelectorAll(".bscatter-bubble");
    circles.forEach((circle, idx) => {
        if (idx < points.length) {
            const point = points[idx];
            const pointKey = (point.selectionId as unknown as { key: string }).key;
            const isSelected = selectedSet.has(pointKey);
            (circle as SVGCircleElement).style.opacity = isSelected ? "1" : String(UNSELECTED_OPACITY);
        }
    });
}
