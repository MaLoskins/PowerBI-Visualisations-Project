/*
 *  Performance Flow — layout/sankey.ts
 *  Custom Sankey layout algorithm (no d3-sankey dependency)
 *
 *  FIX v2:
 *  - "Other" bucket nodes always anchor to bottom of their column.
 *  - assignDepths uses Kahn's algorithm O(V+E).
 *  - Relaxation exits early on convergence.
 *  - Columns built once and reused.
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
import { isOtherNode } from "../model/graphBuilder";

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

    const nodes = createNodes(graph);
    const links = createLinks(graph, nodes);

    for (const link of links) {
        link.source.sourceLinks.push(link);
        link.target.targetLinks.push(link);
    }

    computeNodeValues(nodes);
    assignDepths(nodes);

    const maxDepth = alignDepths(nodes, opts.align);
    assignXPositions(nodes, maxDepth, opts.width, opts.nodeWidth);

    const columns = buildColumns(nodes, maxDepth);
    sortNodesInColumns(columns, opts.sortNodes);

    assignYPositions(columns, opts.height, opts.nodePadding, opts.iterations);
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
        x0: 0, x1: 0, y0: 0, y1: 0,
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
        width: 0, y0: 0, y1: 0,
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
   ═══════════════════════════════════════════════ */

function assignDepths(nodes: SankeyNode[]): void {
    if (nodes.length === 0) return;

    const inDegree = new Map<SankeyNode, number>();
    for (const n of nodes) inDegree.set(n, 0);
    for (const n of nodes) {
        for (const link of n.sourceLinks) {
            inDegree.set(link.target, (inDegree.get(link.target) || 0) + 1);
        }
    }

    const queue: SankeyNode[] = [];
    for (const n of nodes) {
        if (inDegree.get(n)! === 0) {
            n.depth = 0;
            queue.push(n);
        }
    }

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
            const newDepth = node.depth + 1;
            if (newDepth > target.depth) target.depth = newDepth;

            const remaining = inDegree.get(target)! - 1;
            inDegree.set(target, remaining);
            if (remaining === 0) queue.push(target);
        }
    }

    let maxD = 0;
    for (const n of nodes) { if (n.depth > maxD) maxD = n.depth; }
    for (const n of nodes) {
        if (!processed.has(n)) n.depth = maxD;
    }
}

/* ═══════════════════════════════════════════════
   Step 4: Align depths
   ═══════════════════════════════════════════════ */

function alignDepths(nodes: SankeyNode[], align: NodeAlign): number {
    let maxDepth = 0;
    for (const n of nodes) { if (n.depth > maxDepth) maxDepth = n.depth; }
    if (maxDepth === 0) return 0;

    if (align === "right" || align === "center") {
        for (const n of nodes) {
            if (n.sourceLinks.length === 0) n.depth = maxDepth;
        }
    } else if (align === "justify") {
        for (const n of nodes) {
            if (n.sourceLinks.length === 0 && n.targetLinks.length > 0) {
                n.depth = maxDepth;
            }
        }
    }

    maxDepth = 0;
    for (const n of nodes) { if (n.depth > maxDepth) maxDepth = n.depth; }
    return maxDepth;
}

/* ═══════════════════════════════════════════════
   Step 5: X positions
   ═══════════════════════════════════════════════ */

function assignXPositions(
    nodes: SankeyNode[], maxDepth: number,
    width: number, nodeWidth: number,
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
   ═══════════════════════════════════════════════ */

function buildColumns(nodes: SankeyNode[], maxDepth: number): SankeyNode[][] {
    const columns: SankeyNode[][] = [];
    for (let d = 0; d <= maxDepth; d++) columns.push([]);
    for (const node of nodes) {
        if (node.depth >= 0 && node.depth <= maxDepth) {
            columns[node.depth].push(node);
        }
    }
    return columns;
}

/* ═══════════════════════════════════════════════
   Step 6: Sort nodes within columns
   FIX: "Other" nodes always sort to bottom
   ═══════════════════════════════════════════════ */

function sortNodesInColumns(
    columns: SankeyNode[][],
    sortMode: SortNodeOption,
): void {
    for (const col of columns) {
        if (sortMode !== "none") {
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

        /*
         * Post-sort pass: push "Other" bucket nodes to the
         * bottom of their column regardless of sort mode.
         * This keeps the catch-all out of the way of
         * meaningful categories.
         */
        pushOtherToBottom(col);
    }
}

function pushOtherToBottom(col: SankeyNode[]): void {
    const others: SankeyNode[] = [];
    const rest: SankeyNode[] = [];
    for (const n of col) {
        if (isOtherNode(n.name)) {
            others.push(n);
        } else {
            rest.push(n);
        }
    }
    if (others.length === 0) return;

    col.length = 0;
    col.push(...rest, ...others);
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
    columns: SankeyNode[][],
    height: number,
    padding: number,
    iterations: number,
): void {
    const maxDepth = columns.length - 1;

    for (const col of columns) initializeColumn(col, height, padding);

    const convergenceThreshold = 0.5;
    for (let iter = 0; iter < iterations; iter++) {
        const factor = Math.pow(0.99, iter);
        let totalMovement = 0;

        for (let d = 1; d <= maxDepth; d++) {
            totalMovement += relaxColumn(columns[d], factor, "target");
        }
        for (let d = maxDepth - 1; d >= 0; d--) {
            totalMovement += relaxColumn(columns[d], factor, "source");
        }
        for (const col of columns) resolveOverlaps(col, height, padding);

        if (totalMovement < convergenceThreshold) break;
    }
}

function initializeColumn(col: SankeyNode[], height: number, padding: number): void {
    if (col.length === 0) return;

    let totalValue = 0;
    for (const n of col) totalValue += n.value;

    const totalPadding = Math.max(0, (col.length - 1) * padding);
    const availableHeight = Math.max(0, height - totalPadding);
    const scale = totalValue > 0 ? availableHeight / totalValue : 0;

    let y = 0;
    for (const node of col) {
        node.y0 = y;
        node.y1 = y + Math.max(1, node.value * scale);
        y = node.y1 + padding;
    }

    const totalH = col[col.length - 1].y1 - col[0].y0;
    if (totalH < height) {
        const offset = (height - totalH) / 2;
        for (const node of col) { node.y0 += offset; node.y1 += offset; }
    }
}

function relaxColumn(
    col: SankeyNode[],
    alpha: number,
    direction: "source" | "target",
): number {
    let totalMovement = 0;
    for (const node of col) {
        let weightedY = 0;
        let totalWeight = 0;
        const links = direction === "target" ? node.targetLinks : node.sourceLinks;
        for (const link of links) {
            const peer = direction === "target" ? link.source : link.target;
            const center = (peer.y0 + peer.y1) / 2;
            weightedY += center * link.value;
            totalWeight += link.value;
        }
        if (totalWeight > 0) {
            const dy = ((weightedY / totalWeight) - (node.y0 + node.y1) / 2) * alpha;
            node.y0 += dy;
            node.y1 += dy;
            totalMovement += Math.abs(dy);
        }
    }
    return totalMovement;
}

function resolveOverlaps(col: SankeyNode[], height: number, padding: number): void {
    if (col.length === 0) return;
    col.sort((a, b) => a.y0 - b.y0);

    let y = 0;
    for (const node of col) {
        const dy = y - node.y0;
        if (dy > EPSILON) { node.y0 += dy; node.y1 += dy; }
        y = node.y1 + padding;
    }

    const last = col[col.length - 1];
    const overflow = last.y1 - height;
    if (overflow > EPSILON) {
        last.y0 -= overflow;
        last.y1 -= overflow;
        for (let i = col.length - 2; i >= 0; i--) {
            const gap = col[i].y1 + padding - col[i + 1].y0;
            if (gap > EPSILON) { col[i].y0 -= gap; col[i].y1 -= gap; }
        }
    }
}

/* ═══════════════════════════════════════════════
   Step 8: Link positions
   ═══════════════════════════════════════════════ */

function computeLinkPositions(nodes: SankeyNode[]): void {
    for (const node of nodes) {
        node.sourceLinks.sort((a, b) => a.target.y0 - b.target.y0);
        node.targetLinks.sort((a, b) => a.source.y0 - b.source.y0);
    }

    for (const node of nodes) {
        const h = node.y1 - node.y0;
        let tot = 0;
        for (const l of node.sourceLinks) tot += l.value;
        const s = tot > 0 ? h / tot : 0;
        let y = node.y0;
        for (const link of node.sourceLinks) {
            link.width = link.value * s;
            link.y0 = y + link.width / 2;
            y += link.width;
        }
    }

    for (const node of nodes) {
        const h = node.y1 - node.y0;
        let tot = 0;
        for (const l of node.targetLinks) tot += l.value;
        const s = tot > 0 ? h / tot : 0;
        let y = node.y0;
        for (const link of node.targetLinks) {
            const w = link.value * s;
            link.y1 = y + w / 2;
            y += w;
        }
    }
}
