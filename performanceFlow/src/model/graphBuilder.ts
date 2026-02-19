/*
 *  Performance Flow — model/graphBuilder.ts
 *  buildGraph() — assemble SankeyGraph from FlowRow[]
 *  Detects multi-level flows (nodes appearing as both source and destination)
 *
 *  FIX: computeMaxDepth BFS now has visited guard + iteration cap
 *       to prevent infinite loops on cyclic or dense graphs.
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

/* ── Topological depth computation ──
 *
 * FIX: The original BFS could push the same node into the queue
 * repeatedly whenever a longer path was found (newD > existingD).
 * On dense or cyclic graphs this caused exponential queue growth,
 * freezing Power BI.
 *
 * Now we:
 *  1. Use an in-degree based topological sort (Kahn's algorithm)
 *     which processes each node exactly once.
 *  2. Fall back to depth-0 for any cycle members.
 *  3. Cap total iterations at nodeCount * 2 as a safety net.
 */

function computeMaxDepth(
    nodeMap: Map<string, SankeyNodeDatum>,
    links: SankeyLinkDatum[],
): number {
    const nodeCount = nodeMap.size;
    if (nodeCount === 0) return 0;

    /* Build adjacency + in-degree */
    const outgoing = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const [id] of nodeMap) {
        outgoing.set(id, []);
        inDegree.set(id, 0);
    }

    for (const link of links) {
        outgoing.get(link.sourceId)!.push(link.targetId);
        inDegree.set(link.targetId, inDegree.get(link.targetId)! + 1);
    }

    /* Kahn's algorithm: seed with nodes that have zero in-degree */
    const depth = new Map<string, number>();
    const queue: string[] = [];

    for (const [id] of nodeMap) {
        if (inDegree.get(id)! === 0) {
            depth.set(id, 0);
            queue.push(id);
        }
    }

    /* If no root nodes (pure cycle), assign all depth 0 */
    if (queue.length === 0) {
        return 0;
    }

    let maxD = 0;
    let head = 0;
    const maxIter = nodeCount * 2; // safety cap

    while (head < queue.length && head < maxIter) {
        const id = queue[head++];
        const d = depth.get(id)!;
        for (const targetId of outgoing.get(id)!) {
            const newD = d + 1;
            /* Only process each node once via in-degree decrement */
            const remaining = inDegree.get(targetId)! - 1;
            inDegree.set(targetId, remaining);

            /* Track the maximum depth seen for this node */
            const existingD = depth.get(targetId);
            if (existingD === undefined || newD > existingD) {
                depth.set(targetId, newD);
                if (newD > maxD) maxD = newD;
            }

            /* Enqueue only when all predecessors processed */
            if (remaining === 0) {
                queue.push(targetId);
            }
        }
    }

    return maxD;
}
