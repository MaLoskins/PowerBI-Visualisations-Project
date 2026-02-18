/* ═══════════════════════════════════════════════
   Linear Gauge – Selection Handling
   Click-to-select, multi-select, deselect logic
   ═══════════════════════════════════════════════ */
"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.visuals.ISelectionId;
import { GaugeItem } from "../types";

/**
 * Handle a click event on a gauge row.
 * Supports multi-select with Ctrl/Cmd.
 */
export function handleGaugeClick(
    item: GaugeItem,
    e: MouseEvent,
    selectionManager: ISelectionManager,
    onSelectionChanged: () => void,
): void {
    const isMulti = e.ctrlKey || e.metaKey;
    selectionManager.select(item.selectionId, isMulti).then(() => {
        onSelectionChanged();
    });
}

/**
 * Handle a click on the background (clear selection).
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
 * Build a Set of selected IDs (stringified keys) for fast lookup.
 */
export function buildSelectedIdSet(
    selectionManager: ISelectionManager,
): Set<string> {
    const ids = selectionManager.getSelectionIds() as ISelectionId[];
    const set = new Set<string>();
    for (const id of ids) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sid = id as any;
        if (sid && typeof sid.getKey === "function") {
            set.add(sid.getKey());
        } else if (sid && sid.key) {
            set.add(sid.key);
        }
    }
    return set;
}
