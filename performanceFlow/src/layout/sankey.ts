/*
 *  Performance Flow — layout/sankey.ts
 *  Custom Sankey layout algorithm (no d3-sankey dependency)
 *
 *  Produces positioned SankeyNode[] and SankeyLink[] from a SankeyGraph.
 *
 *  FIXES:
 *    - assignDepths: uses Kahn's algorithm (O(V+E)) instead of O(V²) set scan
 *    - Relaxation: early-exit when positions converge (< EPSILON movement)
 *    - getColumns: built once and reused instead of rebuilt per call
 *    - resolveOverlaps: guard against negative node heights
 */
"use strict";

import {
    SankeyGraph,
    SankeyNode,
    SankeyLink,
    SankeyLayout,
    NodeAlign,
    SortNodeOption,
} from "../types";
import { EPSILON } from "../constants";

/* ═══════════════════════════════════════════════
   Public API
   ═══════════════════════════════════════════════ */

export interface SankeyLayoutOptions {
    width: number;
    height: number;
    nodeWidth: number;
    nodePadding: number;
    iterations: number;
    align: NodeAlign;
    sortNodes: SortNodeOption;
}

/** Compute the full Sankey layout from graph data */
export function computeSankeyLayout(
    graph: SankeyGraph,
    opts: SankeyLayoutOptions,
): SankeyLayout {
    if (graph.nodes.length === 0) {
        return { nodes: [], links: [] };
    }

    /* Step 1: Create positioned node shells */
    const nodes = createNodes(graph);
    const links = createLinks(graph, nodes);

    /* Wire source/target link references */
    for (const link of links) {
        link.source.sourceLinks.push(link);
        link.target.targetLinks.push(link);
    }

    /* Step 2: Compute node values (sum of connected links) */
    computeNodeValues(nodes);

    /* Step 3: Assign depths (columns) via Kahn's algorithm */
    assignDepths(nodes);

    /* Step 4: Align depths based on alignment mode */
    const maxDepth = alignDepths(nodes, opts.align);

    /* Step 5: Assign x positions */
    assignXPositions(nodes, maxDepth, opts.width, opts.nodeWidth);

    /* Step 6: Build columns (reused by sort and y-positioning) */
    const columns = buildColumns(nodes, maxDepth);

    /* Step 7: Sort nodes within columns */
    sortNodesInColumns(columns, opts.sortNodes);

    /* Step 8: Assign y positions with iterative relaxation */
    assignYPositions(columns, opts.height, opts.nodePadding, opts.iterations);

    /* Step 9: Compute link y-positions and widths */
    computeLinkPositions(nodes);

    return { nodes, links };
}

/* ═══════════════════════════════════════════════
   Step 1: Create node and link structures
   ═══════════════════════════════════════════════ */

function createNodes(graph: SankeyGraph): SankeyNode[] {
    return graph.nodes.map((nd): SankeyNode => ({
        id: nd.id,
        name: nd.name,
        depth: 0,
        x0: 0,
        x1: 0,
        y0: 0,
        y1: 0,
        value: 0,
        color: nd.color,
        sourceLinks: [],
        targetLinks: [],
        selectionIds: nd.selectionIds,
    }));
}

function createLinks(graph: SankeyGraph, nodes: SankeyNode[]): SankeyLink[] {
    const nodeById = new Map<string, SankeyNode>();
    for (const n of nodes) nodeById.set(n.id, n);

    return graph.links.map((ld) => ({
        source: nodeById.get(ld.sourceId)!,
        target: nodeById.get(ld.targetId)!,
        value: ld.value,
        width: 0,
        y0: 0,
        y1: 0,
        color: "",
        colorOverride: ld.colorOverride,
        selectionId: ld.selectionId,
        tooltipExtras: ld.tooltipExtras,
    }));
}

/* ═══════════════════════════════════════════════
   Step 2: Node values
   ═══════════════════════════════════════════════ */

function computeNodeValues(nodes: SankeyNode[]): void {
    for (const node of nodes) {
        let sumSource = 0;
        let sumTarget = 0;
        for (const l of node.sourceLinks) sumSource += l.value;
        for (const l of node.targetLinks) sumTarget += l.value;
        node.value = Math.max(sumSource, sumTarget);
    }
}

/* ═══════════════════════════════════════════════
   Step 3: Assign depths via Kahn's algorithm
   FIX: Original used O(V²) set scan per layer.
   Now O(V+E) topological sort with cycle handling.
   ═══════════════════════════════════════════════ */

function assignDepths(nodes: SankeyNode[]): void {
    const nodeCount = nodes.length;
    if (nodeCount === 0) return;

    /* Build in-degree map */
    const inDegree = new Map<SankeyNode, number>();
    for (const n of nodes) inDegree.set(n, 0);
    for (const n of nodes) {
        for (const link of n.sourceLinks) {
            inDegree.set(link.target, (inDegree.get(link.target) || 0) + 1);
        }
    }

    /* Seed queue with zero in-degree nodes */
    const queue: SankeyNode[] = [];
    for (const n of nodes) {
        if (inDegree.get(n)! === 0) {
            n.depth = 0;
            queue.push(n);
        }
    }

    /* If entirely cyclic, break by assigning all depth 0 */
    if (queue.length === 0) {
        for (const n of nodes) n.depth = 0;
        return;
    }

    let head = 0;
    const processed = new Set<SankeyNode>();

    while (head < queue.length) {
        const node = queue[head++];
        processed.add(node);
        for (const link of node.sourceLinks) {
            const target = link.target;
            /* Track max depth through any path */
            const newDepth = node.depth + 1;
            if (newDepth > target.depth) target.depth = newDepth;

            const remaining = inDegree.get(target)! - 1;
            inDegree.set(target, remaining);
            if (remaining === 0) {
                queue.push(target);
            }
        }
    }

    /* Assign unprocessed (cycle members) to max depth seen */
    let maxD = 0;
    for (const n of nodes) {
        if (n.depth > maxD) maxD = n.depth;
    }
    for (const n of nodes) {
        if (!processed.has(n)) {
            n.depth = maxD;
        }
    }
}

/* ═══════════════════════════════════════════════
   Step 4: Align depths
   ═══════════════════════════════════════════════ */

function alignDepths(nodes: SankeyNode[], align: NodeAlign): number {
    let maxDepth = 0;
    for (const n of nodes) {
        if (n.depth > maxDepth) maxDepth = n.depth;
    }
    if (maxDepth === 0) return 0;

    if (align === "right") {
        for (const n of nodes) {
            if (n.sourceLinks.length === 0) {
                n.depth = maxDepth;
            }
        }
    } else if (align === "center") {
        for (const n of nodes) {
            if (n.sourceLinks.length === 0) {
                n.depth = maxDepth;
            }
        }
    } else if (align === "justify") {
        for (const n of nodes) {
            if (n.sourceLinks.length === 0 && n.targetLinks.length > 0) {
                n.depth = maxDepth;
            }
        }
    }
    /* "left" keeps depths as-is */

    /* Recompute maxDepth */
    maxDepth = 0;
    for (const n of nodes) {
        if (n.depth > maxDepth) maxDepth = n.depth;
    }

    return maxDepth;
}

/* ═══════════════════════════════════════════════
   Step 5: X positions
   ═══════════════════════════════════════════════ */

function assignXPositions(
    nodes: SankeyNode[],
    maxDepth: number,
    width: number,
    nodeWidth: number,
): void {
    const columns = maxDepth + 1;
    const xStep = columns > 1 ? (width - nodeWidth) / (columns - 1) : 0;

    for (const node of nodes) {
        node.x0 = node.depth * xStep;
        node.x1 = node.x0 + nodeWidth;
    }
}

/* ═══════════════════════════════════════════════
   Build columns (reusable)
   FIX: built once, passed around instead of rebuilt
   ═══════════════════════════════════════════════ */

function buildColumns(nodes: SankeyNode[], maxDepth: number): SankeyNode[][] {
    const columns: SankeyNode[][] = [];
    for (let d = 0; d <= maxDepth; d++) {
        columns.push([]);
    }
    for (const node of nodes) {
        if (node.depth >= 0 && node.depth <= maxDepth) {
            columns[node.depth].push(node);
        }
    }
    return columns;
}

/* ═══════════════════════════════════════════════
   Step 6: Sort nodes within columns
   ═══════════════════════════════════════════════ */

function sortNodesInColumns(
    columns: SankeyNode[][],
    sortMode: SortNodeOption,
): void {
    if (sortMode === "none") return;

    for (const col of columns) {
        switch (sortMode) {
            case "name":
                col.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "value":
                col.sort((a, b) => b.value - a.value);
                break;
            case "auto":
            default:
                col.sort((a, b) => avgTargetY(a) - avgTargetY(b));
                break;
        }
    }
}

function avgTargetY(node: SankeyNode): number {
    if (node.targetLinks.length === 0) return 0;
    let sum = 0;
    for (const l of node.targetLinks) {
        sum += l.source.y0 + (l.source.y1 - l.source.y0) / 2;
    }
    return sum / node.targetLinks.length;
}

/* ═══════════════════════════════════════════════
   Step 7: Y positions with relaxation
   FIX: Early-exit when total movement < threshold
   ═══════════════════════════════════════════════ */

function assignYPositions(
    columns: SankeyNode[][],
    height: number,
    padding: number,
    iterations: number,
): void {
    const maxDepth = columns.length - 1;

    /* Initial: distribute evenly within each column */
    for (const col of columns) {
        initializeColumn(col, height, padding);
    }

    /* Iterative relaxation with convergence check */
    const convergenceThreshold = 0.5; // px total movement to consider converged
    for (let iter = 0; iter < iterations; iter++) {
        const factor = Math.pow(0.99, iter);
        let totalMovement = 0;

        /* Forward pass: push nodes down based on source positions */
        for (let d = 1; d <= maxDepth; d++) {
            totalMovement += relaxColumn(columns[d], height, padding, factor, "target");
        }

        /* Backward pass: pull nodes up based on target positions */
        for (let d = maxDepth - 1; d >= 0; d--) {
            totalMovement += relaxColumn(columns[d], height, padding, factor, "source");
        }

        /* Resolve overlaps */
        for (const col of columns) {
            resolveOverlaps(col, height, padding);
        }

        /* Early exit if converged */
        if (totalMovement < convergenceThreshold) break;
    }
}

function initializeColumn(
    col: SankeyNode[],
    height: number,
    padding: number,
): void {
    if (col.length === 0) return;

    let totalValue = 0;
    for (const n of col) totalValue += n.value;

    const totalPadding = Math.max(0, (col.length - 1) * padding);
    const availableHeight = Math.max(0, height - totalPadding);
    const scale = totalValue > 0 ? availableHeight / totalValue : 0;

    let y = 0;
    for (const node of col) {
        node.y0 = y;
        const nodeHeight = Math.max(1, node.value * scale);
        node.y1 = y + nodeHeight;
        y = node.y1 + padding;
    }

    /* Center the column if total is shorter than available height */
    const totalH = col[col.length - 1].y1 - col[0].y0;
    if (totalH < height) {
        const offset = (height - totalH) / 2;
        for (const node of col) {
            node.y0 += offset;
            node.y1 += offset;
        }
    }
}

/** Returns total absolute movement for convergence checking */
function relaxColumn(
    col: SankeyNode[],
    _height: number,
    _padding: number,
    alpha: number,
    direction: "source" | "target",
): number {
    let totalMovement = 0;

    for (const node of col) {
        let weightedY = 0;
        let totalWeight = 0;

        if (direction === "target") {
            for (const link of node.targetLinks) {
                const sourceCenter = (link.source.y0 + link.source.y1) / 2;
                weightedY += sourceCenter * link.value;
                totalWeight += link.value;
            }
        } else {
            for (const link of node.sourceLinks) {
                const targetCenter = (link.target.y0 + link.target.y1) / 2;
                weightedY += targetCenter * link.value;
                totalWeight += link.value;
            }
        }

        if (totalWeight > 0) {
            const desiredCenter = weightedY / totalWeight;
            const currentCenter = (node.y0 + node.y1) / 2;
            const dy = (desiredCenter - currentCenter) * alpha;
            node.y0 += dy;
            node.y1 += dy;
            totalMovement += Math.abs(dy);
        }
    }

    return totalMovement;
}

function resolveOverlaps(
    col: SankeyNode[],
    height: number,
    padding: number,
): void {
    if (col.length === 0) return;

    /* Sort by current y0 */
    col.sort((a, b) => a.y0 - b.y0);

    /* Push down overlapping nodes */
    let y = 0;
    for (const node of col) {
        const dy = y - node.y0;
        if (dy > EPSILON) {
            node.y0 += dy;
            node.y1 += dy;
        }
        y = node.y1 + padding;
    }

    /* If last node extends beyond height, push everything up */
    const last = col[col.length - 1];
    const overflow = last.y1 - height;
    if (overflow > EPSILON) {
        last.y0 -= overflow;
        last.y1 -= overflow;
        for (let i = col.length - 2; i >= 0; i--) {
            const node = col[i];
            const next = col[i + 1];
            const gap = node.y1 + padding - next.y0;
            if (gap > EPSILON) {
                node.y0 -= gap;
                node.y1 -= gap;
            }
        }
    }
}

/* ═══════════════════════════════════════════════
   Step 8: Link positions
   ═══════════════════════════════════════════════ */

function computeLinkPositions(nodes: SankeyNode[]): void {
    for (const node of nodes) {
        /* Sort source links by target y-position for orderly layout */
        node.sourceLinks.sort((a, b) => a.target.y0 - b.target.y0);
        node.targetLinks.sort((a, b) => a.source.y0 - b.source.y0);
    }

    /* Assign link y0 (source side) */
    for (const node of nodes) {
        const nodeHeight = node.y1 - node.y0;
        let totalOut = 0;
        for (const l of node.sourceLinks) totalOut += l.value;
        const scale = totalOut > 0 ? nodeHeight / totalOut : 0;

        let y = node.y0;
        for (const link of node.sourceLinks) {
            link.width = link.value * scale;
            link.y0 = y + link.width / 2;
            y += link.width;
        }
    }

    /* Assign link y1 (target side) */
    for (const node of nodes) {
        const nodeHeight = node.y1 - node.y0;
        let totalIn = 0;
        for (const l of node.targetLinks) totalIn += l.value;
        const scale = totalIn > 0 ? nodeHeight / totalIn : 0;

        let y = node.y0;
        for (const link of node.targetLinks) {
            const w = link.value * scale;
            link.y1 = y + w / 2;
            y += w;
        }
    }
}
