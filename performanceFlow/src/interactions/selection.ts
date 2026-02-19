/*
 *  Performance Flow — interactions/selection.ts
 *  Selection highlighting, dimming, and style application
 */
"use strict";

import { select } from "d3-selection";
import { SankeyNode, SankeyLink } from "../types";
import { CSS_PREFIX, DIM_OPACITY, SELECTED_STROKE_WIDTH } from "../constants";

import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;
import ISelectionManager = powerbi.extensibility.ISelectionManager;

/* ═══════════════════════════════════════════════
   Public API
   ═══════════════════════════════════════════════ */

/** Handle node click selection */
export function handleNodeClick(
    node: SankeyNode,
    event: MouseEvent,
    selectionManager: ISelectionManager,
): void {
    const isMulti = event.ctrlKey || event.metaKey;
    if (node.selectionIds.length > 0) {
        selectionManager.select(node.selectionIds, isMulti);
    }
}

/** Handle link click selection */
export function handleLinkClick(
    link: SankeyLink,
    event: MouseEvent,
    selectionManager: ISelectionManager,
): void {
    const isMulti = event.ctrlKey || event.metaKey;
    selectionManager.select(link.selectionId, isMulti);
}

/** Handle background click to clear selection */
export function handleBackgroundClick(
    selectionManager: ISelectionManager,
): void {
    selectionManager.clear();
}

/** Apply selection styles to existing DOM nodes and links */
export function applySelectionStyles(
    svgRoot: SVGSVGElement,
    nodes: SankeyNode[],
    links: SankeyLink[],
    selectionManager: ISelectionManager,
    selectedNodeColor: string,
    selectedLinkColor: string,
    defaultNodeOpacity: number,
    defaultLinkOpacity: number,
): void {
    const hasSelection = (selectionManager as unknown as Record<string, unknown>)["hasSelection"]
        ? (selectionManager as unknown as { hasSelection: () => boolean }).hasSelection()
        : false;

    const svg = select(svgRoot);

    if (!hasSelection) {
        /* Fast path: no selection active, reset everything */
        svg.selectAll<SVGRectElement, SankeyNode>(`.${CSS_PREFIX}node`)
            .attr("fill-opacity", defaultNodeOpacity)
            .attr("stroke", "none")
            .attr("stroke-width", 0);

        svg.selectAll<SVGPathElement, SankeyLink>(`.${CSS_PREFIX}link`)
            .attr("stroke-opacity", defaultLinkOpacity);
        return;
    }

    /* Build a set of selected IDs once for O(1) lookup */
    const activeIds = selectionManager.getSelectionIds() as ISelectionId[];
    const selectedNodeIds = new Set<string>();

    /* Pre-compute which nodes are selected */
    for (const node of nodes) {
        if (isNodeInSelection(node, activeIds)) {
            selectedNodeIds.add(node.id);
        }
    }

    /* ── Nodes ── */
    svg.selectAll<SVGRectElement, SankeyNode>(`.${CSS_PREFIX}node`)
        .attr("fill-opacity", (d) => selectedNodeIds.has(d.id) ? defaultNodeOpacity : DIM_OPACITY)
        .attr("stroke", (d) => selectedNodeIds.has(d.id) ? selectedNodeColor : "none")
        .attr("stroke-width", (d) => selectedNodeIds.has(d.id) ? SELECTED_STROKE_WIDTH : 0);

    /* ── Links ── */
    svg.selectAll<SVGPathElement, SankeyLink>(`.${CSS_PREFIX}link`)
        .attr("stroke-opacity", (d) => {
            if (isLinkInSelection(d, activeIds) || selectedNodeIds.has(d.source.id) || selectedNodeIds.has(d.target.id)) {
                return defaultLinkOpacity;
            }
            return DIM_OPACITY;
        });
}

/** Highlight all links connected to a hovered node, dim others */
export function applyHoverHighlight(
    svgRoot: SVGSVGElement,
    hoveredNode: SankeyNode | null,
    hoveredLink: SankeyLink | null,
    defaultNodeOpacity: number,
    defaultLinkOpacity: number,
    hoverLinkOpacity: number,
): void {
    const svg = select(svgRoot);

    if (!hoveredNode && !hoveredLink) {
        /* Reset to defaults */
        svg.selectAll(`.${CSS_PREFIX}node`).attr("fill-opacity", defaultNodeOpacity);
        svg.selectAll(`.${CSS_PREFIX}link`).attr("stroke-opacity", defaultLinkOpacity);
        svg.selectAll(`.${CSS_PREFIX}label`).attr("opacity", 1);
        svg.selectAll(`.${CSS_PREFIX}value-label`).attr("opacity", 0.7);
        return;
    }

    if (hoveredNode) {
        const connectedNodeIds = new Set<string>();
        connectedNodeIds.add(hoveredNode.id);
        for (const l of hoveredNode.sourceLinks) connectedNodeIds.add(l.target.id);
        for (const l of hoveredNode.targetLinks) connectedNodeIds.add(l.source.id);

        svg.selectAll<SVGRectElement, SankeyNode>(`.${CSS_PREFIX}node`)
            .attr("fill-opacity", (d) =>
                connectedNodeIds.has(d.id) ? defaultNodeOpacity : DIM_OPACITY,
            );

        svg.selectAll<SVGPathElement, SankeyLink>(`.${CSS_PREFIX}link`)
            .attr("stroke-opacity", (d) =>
                d.source.id === hoveredNode.id || d.target.id === hoveredNode.id
                    ? hoverLinkOpacity
                    : DIM_OPACITY,
            );
    }

    if (hoveredLink) {
        svg.selectAll<SVGPathElement, SankeyLink>(`.${CSS_PREFIX}link`)
            .attr("stroke-opacity", (d) =>
                d === hoveredLink ? hoverLinkOpacity : DIM_OPACITY,
            );

        svg.selectAll<SVGRectElement, SankeyNode>(`.${CSS_PREFIX}node`)
            .attr("fill-opacity", (d) =>
                d.id === hoveredLink.source.id || d.id === hoveredLink.target.id
                    ? defaultNodeOpacity
                    : DIM_OPACITY,
            );
    }
}

/* ═══════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════ */

function isNodeInSelection(node: SankeyNode, activeIds: ISelectionId[]): boolean {
    for (const sid of node.selectionIds) {
        for (const active of activeIds) {
            if (sid.equals(active)) return true;
        }
    }
    return false;
}

function isLinkInSelection(link: SankeyLink, activeIds: ISelectionId[]): boolean {
    for (const active of activeIds) {
        if (link.selectionId.equals(active)) return true;
    }
    return false;
}
