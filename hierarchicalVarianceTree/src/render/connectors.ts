/* ═══════════════════════════════════════════════
   render/connectors.ts – Elbow-Style Connector Paths
   ═══════════════════════════════════════════════ */

"use strict";

import { Selection } from "d3-selection";
import { RenderConfig, Orientation } from "../types";
import { CSS_PREFIX } from "../constants";

type SVGGroup = Selection<SVGGElement, unknown, null, undefined>;

interface ConnectorEndpoints {
    parentX: number;
    parentY: number;
    childX: number;
    childY: number;
}

/**
 * Render an elbow connector between a parent node and child node.
 * Orthogonal line with a single bend at the midpoint between levels.
 */
export function renderConnector(
    parent: SVGGroup,
    endpoints: ConnectorEndpoints,
    cfg: RenderConfig,
): void {
    const { parentX, parentY, childX, childY } = endpoints;
    const orientation = cfg.layout.orientation;

    const path = buildElbowPath(parentX, parentY, childX, childY, orientation);

    parent.append("path")
        .attr("class", CSS_PREFIX + "connector")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", cfg.colors.connectorColor)
        .attr("stroke-width", cfg.colors.connectorWidth);
}

/**
 * Build an elbow path string (orthogonal with one bend). (C1)
 *
 * topDown:   parent bottom-center → vertical to mid → horizontal → vertical to child top-center
 * leftRight: parent right-center → horizontal to mid → vertical → horizontal to child left-center
 */
function buildElbowPath(
    px: number,
    py: number,
    cx: number,
    cy: number,
    orientation: Orientation,
): string {
    if (orientation === "topDown") {
        const midY = (py + cy) / 2;
        return `M ${px} ${py} L ${px} ${midY} L ${cx} ${midY} L ${cx} ${cy}`;
    } else {
        const midX = (px + cx) / 2;
        return `M ${px} ${py} L ${midX} ${py} L ${midX} ${cy} L ${cx} ${cy}`;
    }
}

/**
 * Compute connector endpoints from parent and child positions.
 * Positions are top-left corners of node rects.
 */
export function computeConnectorEndpoints(
    parentX: number,
    parentY: number,
    childX: number,
    childY: number,
    nodeWidth: number,
    nodeHeight: number,
    orientation: Orientation,
): ConnectorEndpoints {
    if (orientation === "topDown") {
        return {
            parentX: parentX + nodeWidth / 2,
            parentY: parentY + nodeHeight,
            childX: childX + nodeWidth / 2,
            childY: childY,
        };
    } else {
        return {
            parentX: parentX + nodeWidth,
            parentY: parentY + nodeHeight / 2,
            childX: childX,
            childY: childY + nodeHeight / 2,
        };
    }
}
