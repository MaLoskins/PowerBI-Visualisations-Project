/*
 *  Performance Flow — interactions/selection.ts
 *  Selection highlighting, dimming, and style application
 */
"use strict";

import { select, selectAll } from "d3-selection";
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
    /* Power BI SDK workaround: cast to access internal hasSelection (any) */
    const hasSelection = (selectionManager as unknown as Record<string, unknown>)["hasSelection"]
        ? (selectionManager as unknown as { hasSelection: () => boolean }).hasSelection()
        : false;

    const svg = select(svgRoot);

    /* ── Nodes ── */
    svg.selectAll<SVGRectElement, SankeyNode>(`.${CSS_PREFIX}node`)
        .attr("fill-opacity", (d: SankeyNode) => {
            if (!hasSelection) return defaultNodeOpacity;
            return isNodeSelected(d, selectionManager) ? defaultNodeOpacity : DIM_OPACITY;
        })
        .attr("stroke", (d: SankeyNode) => {
            if (!hasSelection) return "none";
            return isNodeSelected(d, selectionManager) ? selectedNodeColor : "none";
        })
        .attr("stroke-width", (d: SankeyNode) => {
            if (!hasSelection) return 0;
            return isNodeSelected(d, selectionManager) ? SELECTED_STROKE_WIDTH : 0;
        });

    /* ── Links ── */
    svg.selectAll<SVGPathElement, SankeyLink>(`.${CSS_PREFIX}link`)
        .attr("stroke-opacity", (d: SankeyLink) => {
            if (!hasSelection) return defaultLinkOpacity;
            return isLinkSelected(d, selectionManager) ? defaultLinkOpacity : DIM_OPACITY;
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
            .attr("fill-opacity", (d: SankeyNode) =>
                connectedNodeIds.has(d.id) ? defaultNodeOpacity : DIM_OPACITY,
            );

        svg.selectAll<SVGPathElement, SankeyLink>(`.${CSS_PREFIX}link`)
            .attr("stroke-opacity", (d: SankeyLink) =>
                d.source.id === hoveredNode.id || d.target.id === hoveredNode.id
                    ? hoverLinkOpacity
                    : DIM_OPACITY,
            );
    }

    if (hoveredLink) {
        svg.selectAll<SVGPathElement, SankeyLink>(`.${CSS_PREFIX}link`)
            .attr("stroke-opacity", (d: SankeyLink) =>
                d === hoveredLink ? hoverLinkOpacity : DIM_OPACITY,
            );

        svg.selectAll<SVGRectElement, SankeyNode>(`.${CSS_PREFIX}node`)
            .attr("fill-opacity", (d: SankeyNode) =>
                d.id === hoveredLink.source.id || d.id === hoveredLink.target.id
                    ? defaultNodeOpacity
                    : DIM_OPACITY,
            );
    }
}

/* ═══════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════ */

function isNodeSelected(node: SankeyNode, sm: ISelectionManager): boolean {
    /* Check if any of the node's selection IDs are in the active selection */
    const sel = sm.getSelectionIds() as ISelectionId[];
    if (!sel || sel.length === 0) return false;
    for (const sid of node.selectionIds) {
        for (const active of sel) {
            if (sid.equals(active)) return true;
        }
    }
    return false;
}

function isLinkSelected(link: SankeyLink, sm: ISelectionManager): boolean {
    const sel = sm.getSelectionIds() as ISelectionId[];
    if (!sel || sel.length === 0) return false;
    for (const active of sel) {
        if (link.selectionId.equals(active)) return true;
    }
    /* Also selected if source or target node is selected */
    return isNodeSelected(link.source, sm) || isNodeSelected(link.target, sm);
}
