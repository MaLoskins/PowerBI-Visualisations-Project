/* ═══════════════════════════════════════════════
   Packed Bubble Chart – Label Renderer
   ═══════════════════════════════════════════════ */

"use strict";

import { Selection } from "d3-selection";
import { BubbleNode, RenderConfig, LabelContent } from "../types";
import { SimNode, SimulationContext } from "../layout/simulation";
import { CSS_PREFIX, FONT_STACK } from "../constants";
import { formatCompact } from "../utils/format";

type SVGSel = Selection<SVGSVGElement, unknown, null, undefined>;

/* ── Bubble Labels ── */

/** Build the label text for a bubble */
function labelText(node: BubbleNode, content: LabelContent): string {
    switch (content) {
        case "value": return formatCompact(node.value);
        case "nameAndValue": return `${node.category}\n${formatCompact(node.value)}`;
        default: return node.category;
    }
}

/** Word-wrap a string to fit inside a circle of given radius.
 *  Returns an array of lines. */
function wrapText(text: string, radius: number, fontSize: number): string[] {
    const maxWidth = radius * 1.6;
    const charWidth = fontSize * 0.55;
    const maxChars = Math.max(1, Math.floor(maxWidth / charWidth));

    const rawLines = text.split("\n");
    const lines: string[] = [];

    for (const raw of rawLines) {
        const words = raw.split(/\s+/);
        let current = "";
        for (const word of words) {
            const test = current ? `${current} ${word}` : word;
            if (test.length > maxChars && current) {
                lines.push(current);
                current = word;
            } else {
                current = test;
            }
        }
        if (current) lines.push(current);
    }

    /* Limit lines to fit vertically */
    const lineHeight = fontSize * 1.2;
    const maxLines = Math.max(1, Math.floor((radius * 1.6) / lineHeight));
    if (lines.length > maxLines) {
        const truncated = lines.slice(0, maxLines);
        truncated[maxLines - 1] = truncated[maxLines - 1].slice(0, -1) + "…";
        return truncated;
    }
    return lines;
}

/** Render or update bubble labels on the label layer.
 *  Called after simulation tick. */
export function renderBubbleLabels(
    svg: SVGSel,
    nodes: SimNode[],
    cfg: RenderConfig,
): void {
    const layer = svg.select<SVGGElement>(`.${CSS_PREFIX}-labels`);

    if (!cfg.label.showLabels) {
        layer.selectAll("*").remove();
        return;
    }

    const minR = cfg.label.minRadiusForLabel;
    const visible = nodes.filter((n) => n.radius >= minR);

    const groups = layer
        .selectAll<SVGGElement, SimNode>(`.${CSS_PREFIX}-label`)
        .data(visible, (d) => String(d.id));

    groups.exit().remove();

    const entered = groups.enter()
        .append("g")
        .attr("class", `${CSS_PREFIX}-label`);

    const merged = entered.merge(groups);

    merged.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);

    /* Rebuild text on every tick (positional) */
    merged.each(function (d) {
        const g = this as SVGGElement;
        while (g.firstChild) g.removeChild(g.firstChild);

        const raw = labelText(d, cfg.label.labelContent);
        const lines = cfg.label.wrapLabels
            ? wrapText(raw, d.radius, cfg.label.fontSize)
            : [raw];

        const lineHeight = cfg.label.fontSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        const startY = -totalHeight / 2 + lineHeight * 0.75;

        const ns = "http://www.w3.org/2000/svg";
        for (let i = 0; i < lines.length; i++) {
            const tspan = document.createElementNS(ns, "text");
            tspan.setAttribute("text-anchor", "middle");
            tspan.setAttribute("x", "0");
            tspan.setAttribute("y", String(startY + i * lineHeight));
            tspan.setAttribute("fill", cfg.label.fontColor);
            tspan.setAttribute("font-size", `${cfg.label.fontSize}px`);
            tspan.setAttribute("font-family", FONT_STACK);
            tspan.setAttribute("pointer-events", "none");
            tspan.textContent = lines[i];
            g.appendChild(tspan);
        }
    });
}

/* ── Group Labels ── */

/** Render group labels centred above each cluster.
 *  Only shown when splitGroups is on and groups exist. */
export function renderGroupLabels(
    svg: SVGSel,
    ctx: SimulationContext | null,
    groups: string[],
    cfg: RenderConfig,
): void {
    const layer = svg.select<SVGGElement>(`.${CSS_PREFIX}-group-labels`);

    if (!cfg.groupLabel.showGroupLabels || !ctx || !cfg.force.splitGroups || groups.length <= 1) {
        layer.selectAll("*").remove();
        return;
    }

    const data = groups.map((g) => ({
        name: g,
        x: ctx.groupCentres.get(g)?.x ?? 0,
        y: ctx.groupCentres.get(g)?.y ?? 0,
    }));

    /* Find the topmost bubble in each group to position label above */
    const groupMinY = new Map<string, number>();
    for (const node of ctx.nodes) {
        if (node.group == null) continue;
        const top = (node.y ?? 0) - node.radius;
        const current = groupMinY.get(node.group);
        if (current === undefined || top < current) {
            groupMinY.set(node.group, top);
        }
    }

    const labels = layer
        .selectAll<SVGTextElement, { name: string }>(`.${CSS_PREFIX}-group-label`)
        .data(data, (d) => d.name);

    labels.exit().remove();

    const entered = labels.enter()
        .append("text")
        .attr("class", `${CSS_PREFIX}-group-label`);

    entered.merge(labels)
        .attr("x", (d) => d.x)
        .attr("y", (d) => {
            const minY = groupMinY.get(d.name);
            return (minY ?? d.y) - cfg.groupLabel.fontSize - 4;
        })
        .attr("text-anchor", "middle")
        .attr("fill", cfg.groupLabel.fontColor)
        .attr("font-size", `${cfg.groupLabel.fontSize}px`)
        .attr("font-family", FONT_STACK)
        .attr("font-weight", "600")
        .text((d) => d.name);
}
