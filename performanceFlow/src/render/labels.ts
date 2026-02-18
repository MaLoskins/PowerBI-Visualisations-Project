/*
 *  Performance Flow — render/labels.ts
 *  Node label and value text rendering
 */
"use strict";

import { select } from "d3-selection";
import { SankeyNode, RenderConfig } from "../types";
import { CSS_PREFIX } from "../constants";
import { formatCompact } from "../utils/format";

/* ═══════════════════════════════════════════════
   Public API
   ═══════════════════════════════════════════════ */

/** Render node labels and optional value text */
export function renderLabels(
    container: SVGGElement,
    nodes: SankeyNode[],
    cfg: RenderConfig,
    chartWidth: number,
): void {
    const g = select(container);
    g.selectAll("*").remove();

    if (!cfg.label.showNodeLabels) return;

    const maxDepth = Math.max(...nodes.map((n) => n.depth), 0);

    for (const node of nodes) {
        const nodeHeight = node.y1 - node.y0;
        const nodeWidth = node.x1 - node.x0;
        const isLeftColumn = node.depth === 0;
        const isRightColumn = node.depth === maxDepth;

        let textX: number;
        let textAnchor: string;

        if (cfg.label.position === "inside" && nodeWidth > 30) {
            /* Inside the node */
            textX = node.x0 + nodeWidth / 2;
            textAnchor = "middle";
        } else if (isRightColumn) {
            /* Right column: label to the left */
            textX = node.x0 - 6;
            textAnchor = "end";
        } else {
            /* Left/middle columns: label to the right */
            textX = node.x1 + 6;
            textAnchor = "start";
        }

        const textY = node.y0 + nodeHeight / 2;

        /* Node name label */
        g.append("text")
            .attr("class", CSS_PREFIX + "label")
            .attr("x", textX)
            .attr("y", textY)
            .attr("dy", cfg.label.showValues ? "-0.15em" : "0.35em")
            .attr("text-anchor", textAnchor)
            .attr("font-size", cfg.label.fontSize + "px")
            .attr("fill", cfg.label.fontColor)
            .text(node.name);

        /* Value sub-label */
        if (cfg.label.showValues) {
            g.append("text")
                .attr("class", CSS_PREFIX + "value-label")
                .attr("x", textX)
                .attr("y", textY)
                .attr("dy", "1em")
                .attr("text-anchor", textAnchor)
                .attr("font-size", cfg.label.valueFontSize + "px")
                .attr("fill", cfg.label.fontColor)
                .attr("opacity", 0.7)
                .text(formatCompact(node.value));
        }
    }
}
