/*
 *  Performance Flow — render/nodes.ts
 *  SVG node rect rendering with optional drag support
 *
 *  FIX: Uses D3 join (enter/update/exit) instead of
 *       selectAll("*").remove() + re-append on every render.
 *       Drag only updates the single rect's y attribute.
 *  FIX: Drag is clamped to [0, chartHeight] so nodes can never
 *       be dragged outside the visible viewport.
 */
"use strict";

import { select } from "d3-selection";
import { drag } from "d3-drag";
import { SankeyNode, RenderConfig, NodeCallbacks } from "../types";
import { CSS_PREFIX } from "../constants";

/* ═══════════════════════════════════════════════
   Public API
   ═══════════════════════════════════════════════ */

/**
 * Render all Sankey nodes into the given SVG group.
 *
 * @param chartHeight  The usable chart height (viewport minus margins).
 *                     Used to clamp drag so nodes cannot leave the viewport.
 */
export function renderNodes(
    container: SVGGElement,
    nodes: SankeyNode[],
    cfg: RenderConfig,
    callbacks: NodeCallbacks,
    chartHeight: number,
): void {
    const g = select(container);
    const className = CSS_PREFIX + "node";

    /* D3 join pattern: enter + update + exit */
    const sel = g.selectAll<SVGRectElement, SankeyNode>(`.${className}`)
        .data(nodes, (d: SankeyNode) => d.id);

    /* Exit: remove nodes no longer in data */
    sel.exit().remove();

    /* Enter: create new rects */
    const enter = sel.enter()
        .append("rect")
        .attr("class", className)
        .style("cursor", "pointer");

    /* Merge enter + update and set all attributes */
    const merged = enter.merge(sel)
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0)
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => Math.max(1, d.y1 - d.y0))
        .attr("rx", cfg.node.cornerRadius)
        .attr("ry", cfg.node.cornerRadius)
        .attr("fill", (d) => d.color)
        .attr("fill-opacity", cfg.node.opacity)
        .attr("stroke", "none");

    /* Re-bind all event handlers (safe to re-bind on update) */
    merged
        .on("click", function (_ev: MouseEvent, d: SankeyNode) {
            callbacks.onClick(d, _ev);
        })
        .on("mouseover", function (_ev: MouseEvent, d: SankeyNode) {
            callbacks.onMouseOver(d, _ev);
        })
        .on("mousemove", function (_ev: MouseEvent, d: SankeyNode) {
            callbacks.onMouseMove(d, _ev);
        })
        .on("mouseout", function () {
            callbacks.onMouseOut();
        });

    /*
     * Drag behaviour for vertical repositioning.
     * FIX: Clamp y0/y1 to [0, chartHeight] so the node always stays
     * within the visible area.
     */
    const dragBehavior = drag<SVGRectElement, SankeyNode>()
        .on("drag", function (event, d) {
            const nodeHeight = d.y1 - d.y0;
            let newY0 = d.y0 + (event.dy as number);

            /* Clamp to viewport bounds */
            newY0 = Math.max(0, Math.min(chartHeight - nodeHeight, newY0));

            const dy = newY0 - d.y0;
            d.y0 = newY0;
            d.y1 = newY0 + nodeHeight;

            select(this).attr("y", d.y0);
            callbacks.onDrag(d, dy);
        });

    merged.call(dragBehavior);
}

/** Lightweight position-only update for drag (no full re-render) */
export function updateNodePositions(container: SVGGElement): void {
    select(container)
        .selectAll<SVGRectElement, SankeyNode>(`.${CSS_PREFIX}node`)
        .attr("y", (d) => d.y0);
}
