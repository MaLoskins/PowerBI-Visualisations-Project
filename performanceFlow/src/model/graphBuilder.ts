/*
 *  Performance Flow — model/graphBuilder.ts
 *  buildGraph() — assemble SankeyGraph from FlowRow[]
 *
 *  applyTopNGrouping() — buckets low-value leaf nodes into
 *  "Other (N categories)" to prevent barcode columns.
 *
 *  FIX v2:
 *  - Percentage threshold uses TOTAL flow value, not just leaf subtotal.
 *  - "Other" label includes count of grouped categories.
 *  - Grouped category names tracked for tooltip display.
 *  - computeMaxDepth uses Kahn's algorithm (no infinite loop).
 *  - preAggregateRows() collapses any linkColor-induced row splits.
 */
"use strict";

import {
    FlowRow,
    SankeyGraph,
    SankeyNodeDatum,
    SankeyLinkDatum,
    RenderConfig,
} from "../types";
import { getResourceColor } from "../utils/color";
import { SLATE_400 } from "../constants";

/* ═══════════════════════════════════════════════
   Grouping Metadata (exposed for tooltip use)
   ═══════════════════════════════════════════════ */

export interface GroupingMeta {
    /** Map from "Other (N categories)" label → original names */
    groupedCategories: Map<string, string[]>;
}

/* sentinel prefix used to detect "Other" nodes */
const OTHER_PREFIX = "Other";

/** Check if a node name is an "Other" bucket label */
export function isOtherNode(name: string): boolean {
    return name.startsWith(OTHER_PREFIX + " (") || name === OTHER_PREFIX;
}

/* ═══════════════════════════════════════════════
   Top-N Grouping — "Other" bucket
   ═══════════════════════════════════════════════ */

export interface GroupingResult {
    rows: FlowRow[];
    meta: GroupingMeta;
}

/**
 * Pre-process rows: replace low-value leaf destinations/sources
 * with "Other (N categories)".  Returns new rows + metadata.
 */
export function applyTopNGrouping(
    rows: FlowRow[],
    cfg: RenderConfig,
): GroupingResult {
    const meta: GroupingMeta = { groupedCategories: new Map() };

    if (!cfg.grouping.enableGrouping) {
        return { rows, meta };
    }

    /* Total flow value used for percentage thresholds */
    let totalFlowValue = 0;
    for (const row of rows) totalFlowValue += row.value;

    let result = rows;

    /* Group destinations (right-side leaf nodes) */
    const destResult = groupLeafNodes(
        result, "destination",
        cfg.grouping.maxDestinations,
        cfg.grouping.minPctThreshold,
        totalFlowValue,
    );
    result = destResult.rows;
    if (destResult.otherLabel && destResult.groupedNames.length > 0) {
        meta.groupedCategories.set(destResult.otherLabel, destResult.groupedNames);
    }

    /* Group sources (left-side leaf nodes) */
    const srcResult = groupLeafNodes(
        result, "source",
        cfg.grouping.maxSources,
        cfg.grouping.minPctThreshold,
        totalFlowValue,
    );
    result = srcResult.rows;
    if (srcResult.otherLabel && srcResult.groupedNames.length > 0) {
        meta.groupedCategories.set(srcResult.otherLabel, srcResult.groupedNames);
    }

    return { rows: result, meta };
}

/* ─────────────────────────────────────────────── */

interface LeafGroupResult {
    rows: FlowRow[];
    otherLabel: string | null;
    groupedNames: string[];
}

function groupLeafNodes(
    rows: FlowRow[],
    side: "source" | "destination",
    maxNodes: number,
    minPct: number,
    totalFlowValue: number,
): LeafGroupResult {
    /* Identify which names appear on each side */
    const sources = new Set<string>();
    const destinations = new Set<string>();
    for (const row of rows) {
        sources.add(row.source);
        destinations.add(row.destination);
    }

    /* Leaf nodes: appear on one side only (not intermediate) */
    const leafSet = new Set<string>();
    if (side === "destination") {
        for (const d of destinations) {
            if (!sources.has(d)) leafSet.add(d);
        }
    } else {
        for (const s of sources) {
            if (!destinations.has(s)) leafSet.add(s);
        }
    }

    /* If already within limit, no grouping needed */
    if (leafSet.size <= maxNodes) {
        return { rows, otherLabel: null, groupedNames: [] };
    }

    /* Sum total value per leaf node */
    const nodeValues = new Map<string, number>();
    for (const row of rows) {
        const key = side === "destination" ? row.destination : row.source;
        if (leafSet.has(key)) {
            nodeValues.set(key, (nodeValues.get(key) || 0) + row.value);
        }
    }

    /* Sort by value descending */
    const sorted = [...nodeValues.entries()].sort((a, b) => b[1] - a[1]);

    /*
     * Keep up to (maxNodes - 1) nodes, reserving one slot for
     * the "Other" bucket itself.  Also drop anything below the
     * minimum percentage of TOTAL flow.
     */
    const keepSet = new Set<string>();
    const pctThreshold = minPct > 0 && totalFlowValue > 0
        ? (minPct / 100) * totalFlowValue
        : 0;
    const keepSlots = Math.max(1, maxNodes - 1);

    for (let i = 0; i < Math.min(keepSlots, sorted.length); i++) {
        const [name, value] = sorted[i];
        if (pctThreshold > 0 && value < pctThreshold) {
            break; /* rest are even smaller */
        }
        keepSet.add(name);
    }

    /* Collect names that will be grouped */
    const groupedNames: string[] = [];
    for (const [name] of sorted) {
        if (!keepSet.has(name)) groupedNames.push(name);
    }

    if (groupedNames.length === 0) {
        return { rows, otherLabel: null, groupedNames: [] };
    }

    /* Build descriptive label */
    const noun = side === "source" ? "sources" : "categories";
    const otherLabel = `${OTHER_PREFIX} (${groupedNames.length} ${noun})`;

    /* Fast lookup for names being grouped */
    const groupSet = new Set(groupedNames);

    /* Remap rows */
    const newRows = rows.map((row) => {
        const key = side === "destination" ? row.destination : row.source;
        if (leafSet.has(key) && groupSet.has(key)) {
            return side === "destination"
                ? { ...row, destination: otherLabel }
                : { ...row, source: otherLabel };
        }
        return row;
    });

    return { rows: newRows, otherLabel, groupedNames };
}

/* ═══════════════════════════════════════════════
   Pre-aggregation: collapse linkColor-induced splits
   ═══════════════════════════════════════════════
   When linkColor was kind:"GroupingOrMeasure", Power BI
   may have created extra rows per (source,dest,color).
   Even after fixing capabilities.json to Measure-only,
   cached data or model refreshes might deliver split rows.

   This merges rows with identical (source, destination)
   BEFORE top-N grouping, so the grouping logic sees the
   true aggregated values.
   ═══════════════════════════════════════════════ */

export function preAggregateRows(rows: FlowRow[]): FlowRow[] {
    const map = new Map<string, FlowRow>();

    for (const row of rows) {
        const key = row.source + "\0" + row.destination;
        const existing = map.get(key);

        if (existing) {
            existing.value += row.value;
            if (!existing.linkColorValue && row.linkColorValue) {
                existing.linkColorValue = row.linkColorValue;
            }
        } else {
            map.set(key, { ...row });
        }
    }

    return [...map.values()];
}

/* ═══════════════════════════════════════════════
   buildGraph()
   ═══════════════════════════════════════════════ */

/** Build the Sankey graph structure from (already-grouped) rows */
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

    /* Force "Other" bucket nodes to a muted colour */
    for (const [label, node] of nodeMap) {
        if (isOtherNode(label)) {
            node.color = SLATE_400;
        }
    }

    /* ── Aggregate links (merge any remaining duplicates) ── */
    const linkAggMap = new Map<string, SankeyLinkDatum>();

    for (const row of rows) {
        const key = row.source + "\0" + row.destination;
        const existing = linkAggMap.get(key);

        const srcNode = nodeMap.get(row.source)!;
        const dstNode = nodeMap.get(row.destination)!;
        srcNode.selectionIds.push(row.selectionId);
        dstNode.selectionIds.push(row.selectionId);

        if (existing) {
            existing.value += row.value;
            if (!existing.colorOverride && row.linkColorValue) {
                existing.colorOverride = row.linkColorValue;
            }
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

    const maxDepth = computeMaxDepth(nodeMap, links);

    return {
        nodes: Array.from(nodeMap.values()),
        links,
        nodeMap,
        maxDepth,
    };
}

/* ═══════════════════════════════════════════════
   Topological depth (Kahn's algorithm)
   ═══════════════════════════════════════════════ */

function computeMaxDepth(
    nodeMap: Map<string, SankeyNodeDatum>,
    links: SankeyLinkDatum[],
): number {
    const nodeCount = nodeMap.size;
    if (nodeCount === 0) return 0;

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

    const depth = new Map<string, number>();
    const queue: string[] = [];

    for (const [id] of nodeMap) {
        if (inDegree.get(id)! === 0) {
            depth.set(id, 0);
            queue.push(id);
        }
    }

    if (queue.length === 0) return 0;

    let maxD = 0;
    let head = 0;
    const maxIter = nodeCount * 2;

    while (head < queue.length && head < maxIter) {
        const id = queue[head++];
        const d = depth.get(id)!;
        for (const targetId of outgoing.get(id)!) {
            const newD = d + 1;
            const remaining = inDegree.get(targetId)! - 1;
            inDegree.set(targetId, remaining);

            const existingD = depth.get(targetId);
            if (existingD === undefined || newD > existingD) {
                depth.set(targetId, newD);
                if (newD > maxD) maxD = newD;
            }

            if (remaining === 0) {
                queue.push(targetId);
            }
        }
    }

    return maxD;
}
