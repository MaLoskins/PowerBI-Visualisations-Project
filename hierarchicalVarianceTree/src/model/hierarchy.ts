/* ═══════════════════════════════════════════════
   model/hierarchy.ts – Tree Building & Aggregation
   ═══════════════════════════════════════════════ */

"use strict";

import { VarianceNode, StartExpanded } from "../types";
import { HIERARCHY_SEP, ROOT_LABEL } from "../constants";
import { LeafRow } from "./parser";

/**
 * Build a hierarchical variance tree from parsed leaf rows.
 * Category columns define hierarchy levels. The root aggregates everything.
 * Intermediate nodes aggregate actual/budget from their children.
 * Only leaf nodes carry selectionIds. (H1)
 */
export function buildHierarchy(
    leaves: LeafRow[],
    categoryNames: string[],
    startExpanded: StartExpanded,
): VarianceNode | null {
    if (leaves.length === 0) return null;

    const numLevels = categoryNames.length;

    /* ── Create root ── */
    const root: VarianceNode = createNode(ROOT_LABEL, 0, [], startExpanded);

    /* ── Insert each leaf into the tree ── */
    for (const leaf of leaves) {
        let parent = root;

        for (let lvl = 0; lvl < numLevels; lvl++) {
            const catVal = leaf.categoryValues[lvl] || "(Blank)";
            const isLast = lvl === numLevels - 1;

            /* Find or create child at this level */
            let child = parent.children.find((c) => c.label === catVal);
            if (!child) {
                const path = [...parent.categoryPath, catVal];
                child = createNode(catVal, lvl + 1, path, startExpanded);
                parent.children.push(child);
            }

            if (isLast) {
                /* Leaf level: accumulate actual/budget directly */
                child.actual += leaf.actual;
                child.budget += leaf.budget;
                child.isLeaf = true;
                child.selectionId = leaf.selectionId;
                child.tooltipExtras = leaf.tooltipExtras;
            }

            parent = child;
        }
    }

    /* ── Aggregate bottom-up ── */
    aggregateNode(root);

    /* ── Apply initial expansion state ── */
    applyExpansionState(root, startExpanded);

    return root;
}

/** Create a blank node. */
function createNode(
    label: string,
    depth: number,
    categoryPath: string[],
    startExpanded: StartExpanded,
): VarianceNode {
    return {
        id: categoryPath.length > 0 ? categoryPath.join(HIERARCHY_SEP) : ROOT_LABEL,
        label,
        depth,
        actual: 0,
        budget: 0,
        variance: 0,
        variancePct: 0,
        children: [],
        isLeaf: false,
        isExpanded: startExpanded === "all",
        selectionId: null,
        categoryPath,
        tooltipExtras: [],
    };
}

/** Recursively aggregate actual/budget from children, compute variance. (H2) */
function aggregateNode(node: VarianceNode): void {
    if (node.children.length > 0) {
        /* Non-leaf: aggregate from children */
        let totalActual = 0;
        let totalBudget = 0;

        for (const child of node.children) {
            aggregateNode(child);
            totalActual += child.actual;
            totalBudget += child.budget;
        }

        node.actual = totalActual;
        node.budget = totalBudget;
        node.isLeaf = false;
    }

    /* Compute variance and percentage */
    node.variance = node.actual - node.budget;
    node.variancePct = node.budget !== 0 ? node.variance / Math.abs(node.budget) : NaN;
}

/** Apply initial expansion state after tree is built. */
function applyExpansionState(node: VarianceNode, mode: StartExpanded): void {
    switch (mode) {
        case "all":
            node.isExpanded = true;
            break;
        case "rootOnly":
            node.isExpanded = node.depth === 0;
            break;
        case "none":
            node.isExpanded = false;
            break;
    }

    for (const child of node.children) {
        applyExpansionState(child, mode);
    }
}

/** Collect all visible nodes (expanded tree walk). */
export function collectVisibleNodes(root: VarianceNode): VarianceNode[] {
    const result: VarianceNode[] = [];
    walkVisible(root, result);
    return result;
}

function walkVisible(node: VarianceNode, result: VarianceNode[]): void {
    result.push(node);
    if (node.isExpanded && node.children.length > 0) {
        for (const child of node.children) {
            walkVisible(child, result);
        }
    }
}

/** Find a node by ID in the tree. */
export function findNodeById(root: VarianceNode, id: string): VarianceNode | null {
    if (root.id === id) return root;
    for (const child of root.children) {
        const found = findNodeById(child, id);
        if (found) return found;
    }
    return null;
}
