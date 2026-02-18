/* ═══════════════════════════════════════════════
   interactions/selection.ts – Selection Management
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.visuals.ISelectionId;

import { VarianceNode } from "../types";

/**
 * Handle click on a node for Power BI selection.
 * Only leaf nodes are selectable (they carry selectionIds). (S1)
 */
export function handleNodeClick(
    node: VarianceNode,
    event: MouseEvent,
    selectionManager: ISelectionManager,
): void {
    if (!node.isLeaf || !node.selectionId) return;

    const multiSelect = event.ctrlKey || event.metaKey;

    selectionManager.select(node.selectionId, multiSelect).then(() => {
        /* Selection applied — visual will re-render via callback */
    });
}

/** Clear all selections. */
export function clearSelection(selectionManager: ISelectionManager): void {
    selectionManager.clear();
}

/** Get set of selected node IDs (matching selectionIds). */
export function getSelectedNodeIds(
    root: VarianceNode | null,
    selectionManager: ISelectionManager,
): Set<string> {
    const selectedIds = new Set<string>();
    if (!root) return selectedIds;

    const activeSelections = selectionManager.getSelectionIds() as ISelectionId[];
    if (activeSelections.length === 0) return selectedIds;

    /* Build lookup: walk tree, match selectionIds */
    collectSelectedIds(root, activeSelections, selectedIds);
    return selectedIds;
}

function collectSelectedIds(
    node: VarianceNode,
    activeSelections: ISelectionId[],
    result: Set<string>,
): void {
    if (node.selectionId) {
        for (const sel of activeSelections) {
            if (sel.equals(node.selectionId)) {
                result.add(node.id);
                break;
            }
        }
    }

    for (const child of node.children) {
        collectSelectedIds(child, activeSelections, result);
    }
}

/** Check whether there is any active selection. */
export function hasActiveSelection(selectionManager: ISelectionManager): boolean {
    return (selectionManager.getSelectionIds() as ISelectionId[]).length > 0;
}
