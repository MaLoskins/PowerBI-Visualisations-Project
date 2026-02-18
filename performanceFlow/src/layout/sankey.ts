/*
 *  Performance Flow — layout/sankey.ts
 *  Custom Sankey layout algorithm (no d3-sankey dependency)
 *
 *  Produces positioned SankeyNode[] and SankeyLink[] from a SankeyGraph.
 *  Steps:
 *    1. Assign node depths (columns) via topological BFS
 *    2. Assign horizontal positions based on depth
 *    3. Initialize vertical positions
 *    4. Iteratively relax to minimise crossings
 *    5. Compute link positions (y0, y1, width)
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

    /* Step 3: Assign depths (columns) via BFS */
    assignDepths(nodes, links);

    /* Step 4: Align depths based on alignment mode */
    const maxDepth = alignDepths(nodes, opts.align);

    /* Step 5: Assign x positions */
    assignXPositions(nodes, maxDepth, opts.width, opts.nodeWidth);

    /* Step 6: Sort nodes within columns */
    sortNodesInColumns(nodes, maxDepth, opts.sortNodes);

    /* Step 7: Assign y positions with iterative relaxation */
    assignYPositions(nodes, maxDepth, opts.height, opts.nodePadding, opts.iterations);

    /* Step 8: Compute link y-positions and widths */
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
        sourceLinks: [] as SankeyLink[],
        targetLinks: [] as SankeyLink[],
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
        const sumSource = node.sourceLinks.reduce((s, l) => s + l.value, 0);
        const sumTarget = node.targetLinks.reduce((s, l) => s + l.value, 0);
        node.value = Math.max(sumSource, sumTarget);
    }
}

/* ═══════════════════════════════════════════════
   Step 3: Assign depths via BFS
   ═══════════════════════════════════════════════ */

function assignDepths(nodes: SankeyNode[], links: SankeyLink[]): void {
    const remaining = new Set(nodes);
    let currentDepth = 0;

    /* Find source nodes (no incoming links) */
    while (remaining.size > 0) {
        const sources: SankeyNode[] = [];
        for (const node of remaining) {
            const hasIncoming = node.targetLinks.some((l) => remaining.has(l.source));
            if (!hasIncoming) {
                sources.push(node);
            }
        }

        /* Break cycles: if no source found, pick the first remaining */
        if (sources.length === 0) {
            const first = remaining.values().next().value;
            if (first) {
                sources.push(first);
            }
        }

        for (const node of sources) {
            node.depth = currentDepth;
            remaining.delete(node);
        }
        currentDepth++;
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
        /* Push leaf nodes to the rightmost column */
        for (const n of nodes) {
            if (n.sourceLinks.length === 0) {
                n.depth = maxDepth;
            }
        }
    } else if (align === "center") {
        /* Center nodes that are both source and target */
        for (const n of nodes) {
            if (n.sourceLinks.length === 0) {
                n.depth = maxDepth;
            }
        }
    } else if (align === "justify") {
        /* Push leaf nodes (no outgoing) to the max depth */
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
   Step 6: Sort nodes within columns
   ═══════════════════════════════════════════════ */

function sortNodesInColumns(
    nodes: SankeyNode[],
    maxDepth: number,
    sortMode: SortNodeOption,
): void {
    if (sortMode === "none") return;

    /* Group by depth */
    const columns = getColumns(nodes, maxDepth);

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
                /* Sort by average y-position of incoming links for better crossing reduction */
                col.sort((a, b) => {
                    const aAvg = avgTargetY(a);
                    const bAvg = avgTargetY(b);
                    return aAvg - bAvg;
                });
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
   ═══════════════════════════════════════════════ */

function assignYPositions(
    nodes: SankeyNode[],
    maxDepth: number,
    height: number,
    padding: number,
    iterations: number,
): void {
    const columns = getColumns(nodes, maxDepth);

    /* Initial: distribute evenly within each column */
    for (const col of columns) {
        initializeColumn(col, height, padding);
    }

    /* Iterative relaxation */
    const alpha = 1;
    for (let iter = 0; iter < iterations; iter++) {
        const factor = alpha * Math.pow(0.99, iter);

        /* Forward pass: push nodes down based on source positions */
        for (let d = 1; d <= maxDepth; d++) {
            relaxColumn(columns[d], height, padding, factor, "target");
        }

        /* Backward pass: pull nodes up based on target positions */
        for (let d = maxDepth - 1; d >= 0; d--) {
            relaxColumn(columns[d], height, padding, factor, "source");
        }

        /* Resolve overlaps */
        for (const col of columns) {
            resolveOverlaps(col, height, padding);
        }
    }
}

function initializeColumn(
    col: SankeyNode[],
    height: number,
    padding: number,
): void {
    const totalValue = col.reduce((s, n) => s + n.value, 0);
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
    const totalH = col.length > 0 ? col[col.length - 1].y1 - col[0].y0 : 0;
    if (totalH < height) {
        const offset = (height - totalH) / 2;
        for (const node of col) {
            node.y0 += offset;
            node.y1 += offset;
        }
    }
}

function relaxColumn(
    col: SankeyNode[],
    height: number,
    padding: number,
    alpha: number,
    direction: "source" | "target",
): void {
    for (const node of col) {
        let weightedY = 0;
        let totalWeight = 0;

        if (direction === "target") {
            /* Use source positions of incoming links */
            for (const link of node.targetLinks) {
                const sourceCenter = (link.source.y0 + link.source.y1) / 2;
                weightedY += sourceCenter * link.value;
                totalWeight += link.value;
            }
        } else {
            /* Use target positions of outgoing links */
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
        }
    }
}

function resolveOverlaps(
    col: SankeyNode[],
    height: number,
    padding: number,
): void {
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
    if (col.length > 0) {
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
        const totalOut = node.sourceLinks.reduce((s, l) => s + l.value, 0);
        const scale = totalOut > 0 ? nodeHeight / totalOut : 0;

        let y = node.y0;
        for (const link of node.sourceLinks) {
            link.y0 = y + (link.value * scale) / 2;
            link.width = link.value * scale;
            y += link.value * scale;
        }
    }

    /* Assign link y1 (target side) */
    for (const node of nodes) {
        const nodeHeight = node.y1 - node.y0;
        const totalIn = node.targetLinks.reduce((s, l) => s + l.value, 0);
        const scale = totalIn > 0 ? nodeHeight / totalIn : 0;

        let y = node.y0;
        for (const link of node.targetLinks) {
            link.y1 = y + (link.value * scale) / 2;
            y += link.value * scale;
        }
    }
}

/* ═══════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════ */

function getColumns(nodes: SankeyNode[], maxDepth: number): SankeyNode[][] {
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
