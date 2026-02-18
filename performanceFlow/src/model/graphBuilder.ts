/*
 *  Performance Flow — model/graphBuilder.ts
 *  buildGraph() — assemble SankeyGraph from FlowRow[]
 *  Detects multi-level flows (nodes appearing as both source and destination)
 */
"use strict";

import {
    FlowRow,
    SankeyGraph,
    SankeyNodeDatum,
    SankeyLinkDatum,
} from "../types";
import { getResourceColor } from "../utils/color";

/** Build the Sankey graph structure from parsed flow rows */
export function buildGraph(
    rows: FlowRow[],
    defaultNodeColor: string,
    colorByNode: boolean,
): SankeyGraph {
    const nodeMap = new Map<string, SankeyNodeDatum>();
    const links: SankeyLinkDatum[] = [];
    let nodeIndex = 0;

    /* ── Collect unique nodes ── */
    for (const row of rows) {
        if (!nodeMap.has(row.source)) {
            nodeMap.set(row.source, {
                id: row.source,
                name: row.source,
                color: colorByNode ? getResourceColor(nodeIndex++) : defaultNodeColor,
                selectionIds: [],
            });
        }
        if (!nodeMap.has(row.destination)) {
            nodeMap.set(row.destination, {
                id: row.destination,
                name: row.destination,
                color: colorByNode ? getResourceColor(nodeIndex++) : defaultNodeColor,
                selectionIds: [],
            });
        }
    }

    /* ── Aggregate links (may have duplicate source→dest pairs) ── */
    const linkAggMap = new Map<string, SankeyLinkDatum>();

    for (const row of rows) {
        const key = row.source + "\0" + row.destination;
        const existing = linkAggMap.get(key);

        /* Track selection IDs on nodes */
        const srcNode = nodeMap.get(row.source)!;
        const dstNode = nodeMap.get(row.destination)!;
        srcNode.selectionIds.push(row.selectionId);
        dstNode.selectionIds.push(row.selectionId);

        if (existing) {
            existing.value += row.value;
            /* Keep first non-null colour override */
            if (!existing.colorOverride && row.linkColorValue) {
                existing.colorOverride = row.linkColorValue;
            }
            /* Merge tooltip extras from first row only */
        } else {
            linkAggMap.set(key, {
                sourceId: row.source,
                targetId: row.destination,
                value: row.value,
                colorOverride: row.linkColorValue,
                selectionId: row.selectionId,
                tooltipExtras: row.tooltipExtras,
            });
        }
    }

    links.push(...linkAggMap.values());

    /* ── Compute max depth via topological order ── */
    const maxDepth = computeMaxDepth(nodeMap, links);

    return {
        nodes: Array.from(nodeMap.values()),
        links,
        nodeMap,
        maxDepth,
    };
}

/* ── Topological depth computation ── */

function computeMaxDepth(
    nodeMap: Map<string, SankeyNodeDatum>,
    links: SankeyLinkDatum[],
): number {
    /* Build adjacency: source → targets */
    const outgoing = new Map<string, string[]>();
    const incoming = new Map<string, string[]>();

    for (const [id] of nodeMap) {
        outgoing.set(id, []);
        incoming.set(id, []);
    }

    for (const link of links) {
        outgoing.get(link.sourceId)!.push(link.targetId);
        incoming.get(link.targetId)!.push(link.sourceId);
    }

    /* Source nodes (no incoming links) start at depth 0 */
    const depth = new Map<string, number>();
    const queue: string[] = [];

    for (const [id] of nodeMap) {
        if (incoming.get(id)!.length === 0) {
            depth.set(id, 0);
            queue.push(id);
        }
    }

    /* Handle cycles: if no root nodes, assign all depth 0 */
    if (queue.length === 0) {
        for (const [id] of nodeMap) {
            depth.set(id, 0);
        }
        return 0;
    }

    /* BFS to propagate depth */
    let maxD = 0;
    let head = 0;
    while (head < queue.length) {
        const id = queue[head++];
        const d = depth.get(id)!;
        for (const targetId of outgoing.get(id)!) {
            const existingD = depth.get(targetId);
            const newD = d + 1;
            if (existingD === undefined || newD > existingD) {
                depth.set(targetId, newD);
                if (newD > maxD) maxD = newD;
                queue.push(targetId);
            }
        }
    }

    /* Assign depth to any remaining unvisited nodes */
    for (const [id] of nodeMap) {
        if (!depth.has(id)) {
            depth.set(id, maxD);
        }
    }

    return maxD;
}
