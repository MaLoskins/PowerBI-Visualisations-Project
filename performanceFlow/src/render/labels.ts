/*
 *  Performance Flow — render/labels.ts
 *  Node label and value text rendering
 *
 *  FIX: Uses D3 join instead of remove-all + re-append.
 *       Provides updateLabelPositions() for drag.
 */
"use strict";

import { select } from "d3-selection";
import { SankeyNode, RenderConfig } from "../types";
import { CSS_PREFIX } from "../constants";
import { formatCompact } from "../utils/format";

/* ═══════════════════════════════════════════════
   Internal helpers
   ═══════════════════════════════════════════════ */

function computeLabelAttrs(
    node: SankeyNode,
    cfg: RenderConfig,
    maxDepth: number,
): { textX: number; textAnchor: string; textY: number } {
    const nodeHeight = node.y1 - node.y0;
    const nodeWidth = node.x1 - node.x0;
    const isRightColumn = node.depth === maxDepth;

    let textX: number;
    let textAnchor: string;

    if (cfg.label.position === "inside" && nodeWidth > 30) {
        textX = node.x0 + nodeWidth / 2;
        textAnchor = "middle";
    } else if (isRightColumn) {
        textX = node.x0 - 6;
        textAnchor = "end";
    } else {
        textX = node.x1 + 6;
        textAnchor = "start";
    }

    const textY = node.y0 + nodeHeight / 2;
    return { textX, textAnchor, textY };
}

/* ═══════════════════════════════════════════════
   Public API
   ═══════════════════════════════════════════════ */

/** Render node labels and optional value text */
export function renderLabels(
    container: SVGGElement,
    nodes: SankeyNode[],
    cfg: RenderConfig,
    _chartWidth: number,
): void {
    const g = select(container);

    if (!cfg.label.showNodeLabels) {
        g.selectAll("*").remove();
        return;
    }

    const maxDepth = Math.max(...nodes.map((n) => n.depth), 0);
    const nameClass = CSS_PREFIX + "label";
    const valClass = CSS_PREFIX + "value-label";

    /* ── Name labels (join) ── */
    const nameSel = g.selectAll<SVGTextElement, SankeyNode>(`.${nameClass}`)
        .data(nodes, (d: SankeyNode) => d.id);

    nameSel.exit().remove();

    const nameEnter = nameSel.enter()
        .append("text")
        .attr("class", nameClass);

    nameEnter.merge(nameSel).each(function (d) {
        const { textX, textAnchor, textY } = computeLabelAttrs(d, cfg, maxDepth);
        const el = select(this);
        el.attr("x", textX)
            .attr("y", textY)
            .attr("dy", cfg.label.showValues ? "-0.15em" : "0.35em")
            .attr("text-anchor", textAnchor)
            .attr("font-size", cfg.label.fontSize + "px")
            .attr("fill", cfg.label.fontColor)
            .text(d.name);
    });

    /* ── Value sub-labels (join) ── */
    if (cfg.label.showValues) {
        const valSel = g.selectAll<SVGTextElement, SankeyNode>(`.${valClass}`)
            .data(nodes, (d: SankeyNode) => d.id);

        valSel.exit().remove();

        const valEnter = valSel.enter()
            .append("text")
            .attr("class", valClass);

        valEnter.merge(valSel).each(function (d) {
            const { textX, textAnchor, textY } = computeLabelAttrs(d, cfg, maxDepth);
            const el = select(this);
            el.attr("x", textX)
                .attr("y", textY)
                .attr("dy", "1em")
                .attr("text-anchor", textAnchor)
                .attr("font-size", cfg.label.valueFontSize + "px")
                .attr("fill", cfg.label.fontColor)
                .attr("opacity", 0.7)
                .text(formatCompact(d.value));
        });
    } else {
        g.selectAll(`.${valClass}`).remove();
    }
}

/** Lightweight position-only update for drag */
export function updateLabelPositions(
    container: SVGGElement,
    nodes: SankeyNode[],
    cfg: RenderConfig,
): void {
    if (!cfg.label.showNodeLabels) return;

    const maxDepth = Math.max(...nodes.map((n) => n.depth), 0);

    select(container)
        .selectAll<SVGTextElement, SankeyNode>(`.${CSS_PREFIX}label`)
        .each(function (d) {
            const { textX, textY } = computeLabelAttrs(d, cfg, maxDepth);
            select(this).attr("x", textX).attr("y", textY);
        });

    if (cfg.label.showValues) {
        select(container)
            .selectAll<SVGTextElement, SankeyNode>(`.${CSS_PREFIX}value-label`)
            .each(function (d) {
                const { textX, textY } = computeLabelAttrs(d, cfg, maxDepth);
                select(this).attr("x", textX).attr("y", textY);
            });
    }
}
