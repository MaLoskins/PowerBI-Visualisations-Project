/* ═══════════════════════════════════════════════
   Tag Cloud – Selection Handling
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.visuals.ISelectionId;
import { WordItem } from "../types";

/**
 * Handle word click: single-select or multi-select with Ctrl/Meta.
 * Returns the updated set of selected IDs for styling.
 */
export async function handleWordClick(
    item: WordItem,
    event: MouseEvent,
    selectionManager: ISelectionManager,
): Promise<Set<string>> {
    const isMulti = event.ctrlKey || event.metaKey;

    await selectionManager.select(item.selectionId, isMulti);

    return getSelectedIdSet(selectionManager);
}

/** Clear all selections */
export async function clearSelection(
    selectionManager: ISelectionManager,
): Promise<Set<string>> {
    await selectionManager.clear();
    return new Set();
}

/** Get the current set of selected IDs as serialised strings */
export function getSelectedIdSet(
    selectionManager: ISelectionManager,
): Set<string> {
    const ids: ISelectionId[] = selectionManager.getSelectionIds() as ISelectionId[];
    return new Set(ids.map(id => JSON.stringify(id)));
}
