/* ═══════════════════════════════════════════════
   Advanced Trellis – Selection & Interactivity
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import type { TrellisDataPoint } from "../types";
import { DIM_OPACITY } from "../constants";

import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.visuals.ISelectionId;

/**
 * Handle a click on a data point.
 * Supports multi-select with Ctrl/Meta.
 */
export async function handleClick(
    point: TrellisDataPoint,
    event: MouseEvent,
    selectionManager: ISelectionManager,
    onAfterSelect: () => void,
): Promise<void> {
    const isMulti = event.ctrlKey || event.metaKey;
    await selectionManager.select(point.selectionId, isMulti);
    onAfterSelect();
}

/**
 * Clear selection when clicking on the background.
 */
export async function handleBackgroundClick(
    selectionManager: ISelectionManager,
    onAfterSelect: () => void,
): Promise<void> {
    await selectionManager.clear();
    onAfterSelect();
}

/**
 * Apply selection-based visual styles to all interactive SVG elements.
 * Dims unselected elements when a selection is active.
 */
export function applySelectionStyles(
    container: HTMLElement,
    selectionManager: ISelectionManager,
): void {
    const selectionIds = selectionManager.getSelectionIds() as ISelectionId[];
    const hasSelection = selectionIds.length > 0;

    /* Build a set of selected keys for fast lookup */
    const selectedKeys = new Set<string>();
    if (hasSelection) {
        for (const sid of selectionIds) {
            selectedKeys.add(sid.getKey() as string);
        }
    }

    /* Select all interactive elements with data-sid attribute */
    const elements = container.querySelectorAll("[data-sid]");
    for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as SVGElement;
        const key = el.getAttribute("data-sid") ?? "";

        if (!hasSelection) {
            el.style.opacity = "1";
        } else if (selectedKeys.has(key)) {
            el.style.opacity = "1";
        } else {
            el.style.opacity = String(DIM_OPACITY);
        }
    }
}
