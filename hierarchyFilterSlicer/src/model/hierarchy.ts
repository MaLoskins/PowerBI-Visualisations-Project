/* ═══════════════════════════════════════════════
   Hierarchy Filter Slicer – Hierarchy Builder
   Tree construction, check state propagation,
   search filtering, and flattening (H2)
   ═══════════════════════════════════════════════ */

"use strict";

import { HierarchyNode, CheckState } from "../types";
import { ParsedRow } from "./parser";
import { KEY_SEPARATOR } from "../constants";

/* ═══════════════════════════════════════════════
   Build Hierarchy
   ═══════════════════════════════════════════════ */

/**
 * Build a tree of HierarchyNode from parsed rows.
 * Each unique value at each level becomes a node. Leaf nodes
 * are at the deepest level of the hierarchy.
 */
export function buildHierarchy(
    rows: ParsedRow[],
    levelCount: number,
    previousCheckedKeys: ReadonlySet<string>,
    previousExpandedKeys: ReadonlySet<string>,
    isFirstLoad: boolean,
): HierarchyNode[] {
    const rootNodes: HierarchyNode[] = [];
    const nodeMap = new Map<string, HierarchyNode>();

    for (const row of rows) {
        let parentKey = "";
        let parentNode: HierarchyNode | null = null;

        for (let lvl = 0; lvl < levelCount; lvl++) {
            const label = row.levelValues[lvl];
            const key = parentKey
                ? parentKey + KEY_SEPARATOR + label
                : label;

            let node = nodeMap.get(key);

            if (!node) {
                const isLeaf = lvl === levelCount - 1;
                node = {
                    key,
                    label,
                    level: lvl,
                    children: [],
                    leafValues: [],
                    isExpanded: isFirstLoad ? true : previousExpandedKeys.has(key),
                    checkState: "unchecked",
                    parent: parentNode,
                    isLeaf,
                };
                nodeMap.set(key, node);

                if (lvl === 0) {
                    rootNodes.push(node);
                } else if (parentNode) {
                    parentNode.children.push(node);
                }
            }

            parentKey = key;
            parentNode = node;
        }
    }

    /* ── Collect leaf values bottom-up ── */
    collectLeafValues(rootNodes);

    /* ── Restore check state from previous keys ── */
    if (previousCheckedKeys.size > 0) {
        restoreCheckState(rootNodes, previousCheckedKeys);
    }

    /* ── Sort children alphabetically at each level ── */
    sortRecursive(rootNodes);

    return rootNodes;
}

/* ── Collect all leaf display values for each node ── */

function collectLeafValues(nodes: HierarchyNode[]): void {
    for (const node of nodes) {
        if (node.isLeaf) {
            node.leafValues = [node.label];
        } else {
            collectLeafValues(node.children);
            node.leafValues = [];
            for (const child of node.children) {
                for (const val of child.leafValues) {
                    if (!node.leafValues.includes(val)) {
                        node.leafValues.push(val);
                    }
                }
            }
        }
    }
}

/* ── Restore checked state from a set of previously checked keys ── */

function restoreCheckState(
    nodes: HierarchyNode[],
    checkedKeys: ReadonlySet<string>,
): void {
    for (const node of nodes) {
        if (node.isLeaf) {
            node.checkState = checkedKeys.has(node.key) ? "checked" : "unchecked";
        } else {
            restoreCheckState(node.children, checkedKeys);
            node.checkState = computeParentState(node.children);
        }
    }
}

/* ── Sort children alphabetically ── */

function sortRecursive(nodes: HierarchyNode[]): void {
    nodes.sort((a, b) => a.label.localeCompare(b.label));
    for (const node of nodes) {
        if (node.children.length > 0) {
            sortRecursive(node.children);
        }
    }
}

/* ═══════════════════════════════════════════════
   Check State Management
   ═══════════════════════════════════════════════ */

/** Compute the aggregate check state for a parent based on its children. */
export function computeParentState(children: HierarchyNode[]): CheckState {
    if (children.length === 0) return "unchecked";

    let allChecked = true;
    let anyChecked = false;

    for (const child of children) {
        if (child.checkState === "checked") {
            anyChecked = true;
        } else if (child.checkState === "indeterminate") {
            return "indeterminate";
        } else {
            allChecked = false;
        }
    }

    if (allChecked) return "checked";
    if (anyChecked) return "indeterminate";
    return "unchecked";
}

/**
 * Toggle the check state of a node and propagate up and down.
 * Returns the new check state of the toggled node.
 */
export function toggleCheck(node: HierarchyNode): void {
    const newState: CheckState = node.checkState === "checked" ? "unchecked" : "checked";

    /* ── Propagate down: set all descendants to the same state ── */
    setSubtreeState(node, newState);

    /* ── Propagate up: recompute parent states ── */
    propagateUp(node.parent);
}

/** Set all nodes in a subtree to a given check state. */
function setSubtreeState(node: HierarchyNode, state: CheckState): void {
    node.checkState = state;
    for (const child of node.children) {
        setSubtreeState(child, state);
    }
}

/** Recompute check state from a node up to the root. */
function propagateUp(node: HierarchyNode | null): void {
    while (node) {
        node.checkState = computeParentState(node.children);
        node = node.parent;
    }
}

/**
 * Toggle select-all: if all roots are checked, uncheck all;
 * otherwise check all.
 */
export function toggleSelectAll(roots: HierarchyNode[]): void {
    const allChecked = roots.every(r => r.checkState === "checked");
    const newState: CheckState = allChecked ? "unchecked" : "checked";

    for (const root of roots) {
        setSubtreeState(root, newState);
    }
}

/* ═══════════════════════════════════════════════
   Expand / Collapse
   ═══════════════════════════════════════════════ */

/** Set expand state for the entire tree. */
export function setExpandAll(roots: HierarchyNode[], expanded: boolean): void {
    for (const root of roots) {
        setExpandRecursive(root, expanded);
    }
}

function setExpandRecursive(node: HierarchyNode, expanded: boolean): void {
    if (!node.isLeaf) {
        node.isExpanded = expanded;
        for (const child of node.children) {
            setExpandRecursive(child, expanded);
        }
    }
}

/* ═══════════════════════════════════════════════
   Search Filtering & Flattening
   ═══════════════════════════════════════════════ */

/**
 * Flatten the tree into a visible-row list, applying search filter.
 * If searchTerm is provided, only nodes whose label contains the
 * search term (case-insensitive) plus their ancestors are shown.
 */
export function flattenVisible(
    roots: HierarchyNode[],
    searchTerm: string,
): HierarchyNode[] {
    const result: HierarchyNode[] = [];
    const term = searchTerm.trim().toLowerCase();

    if (term.length > 0) {
        /* ── Search mode: find matches and include ancestors ── */
        const matchingKeys = new Set<string>();
        collectMatchingKeys(roots, term, matchingKeys);
        flattenSearchResults(roots, matchingKeys, result);
    } else {
        /* ── Normal mode: respect expand/collapse ── */
        flattenNormal(roots, result);
    }

    return result;
}

/** Recursively collect keys of nodes whose label matches the search term, plus all ancestor keys. */
function collectMatchingKeys(
    nodes: HierarchyNode[],
    term: string,
    keys: Set<string>,
): boolean {
    let hasMatch = false;

    for (const node of nodes) {
        const labelMatches = node.label.toLowerCase().includes(term);
        const childMatch = node.children.length > 0
            ? collectMatchingKeys(node.children, term, keys)
            : false;

        if (labelMatches || childMatch) {
            keys.add(node.key);
            hasMatch = true;
        }
    }

    return hasMatch;
}

/** Flatten nodes that are in the matchingKeys set (search results shown expanded). */
function flattenSearchResults(
    nodes: HierarchyNode[],
    matchingKeys: Set<string>,
    result: HierarchyNode[],
): void {
    for (const node of nodes) {
        if (matchingKeys.has(node.key)) {
            result.push(node);
            if (node.children.length > 0) {
                flattenSearchResults(node.children, matchingKeys, result);
            }
        }
    }
}

/** Flatten nodes respecting expand/collapse state. */
function flattenNormal(
    nodes: HierarchyNode[],
    result: HierarchyNode[],
): void {
    for (const node of nodes) {
        result.push(node);
        if (!node.isLeaf && node.isExpanded && node.children.length > 0) {
            flattenNormal(node.children, result);
        }
    }
}

/* ═══════════════════════════════════════════════
   Collect Keys
   ═══════════════════════════════════════════════ */

/** Collect the keys of all checked leaf nodes. */
export function collectCheckedLeafKeys(roots: HierarchyNode[]): Set<string> {
    const keys = new Set<string>();
    walkCollectCheckedKeys(roots, keys);
    return keys;
}

function walkCollectCheckedKeys(nodes: HierarchyNode[], keys: Set<string>): void {
    for (const node of nodes) {
        if (node.isLeaf && node.checkState === "checked") {
            keys.add(node.key);
        }
        if (node.children.length > 0) {
            walkCollectCheckedKeys(node.children, keys);
        }
    }
}

/** Collect the keys of all expanded non-leaf nodes. */
export function collectExpandedKeys(roots: HierarchyNode[]): Set<string> {
    const keys = new Set<string>();
    walkCollectExpandedKeys(roots, keys);
    return keys;
}

function walkCollectExpandedKeys(nodes: HierarchyNode[], keys: Set<string>): void {
    for (const node of nodes) {
        if (!node.isLeaf && node.isExpanded) {
            keys.add(node.key);
        }
        if (node.children.length > 0) {
            walkCollectExpandedKeys(node.children, keys);
        }
    }
}

/** Collect the display values of all checked leaf nodes (for filtering). */
export function collectCheckedLeafValues(roots: HierarchyNode[]): string[] {
    const values: string[] = [];
    walkCollectCheckedValues(roots, values);
    return values;
}

function walkCollectCheckedValues(nodes: HierarchyNode[], values: string[]): void {
    for (const node of nodes) {
        if (node.isLeaf && node.checkState === "checked") {
            if (!values.includes(node.label)) {
                values.push(node.label);
            }
        }
        if (node.children.length > 0) {
            walkCollectCheckedValues(node.children, values);
        }
    }
}

/** Count total leaf nodes. */
export function countLeaves(roots: HierarchyNode[]): number {
    let count = 0;
    for (const node of roots) {
        if (node.isLeaf) {
            count++;
        } else {
            count += countLeaves(node.children);
        }
    }
    return count;
}
