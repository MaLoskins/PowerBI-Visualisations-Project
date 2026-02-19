/*
 *  Performance Flow — render/links.ts
 *  SVG link path rendering with gradient support
 *
 *  FIX: Uses D3 join (enter/update/exit) instead of destroy-all.
 *       Provides updateLinkPaths() for lightweight drag updates.
 */
"use strict";

import { select, Selection } from "d3-selection";
import { SankeyLink, SankeyNode, RenderConfig, LinkCallbacks, ColorMode } from "../types";
import { CSS_PREFIX } from "../constants";

/* ═══════════════════════════════════════════════
   Public API
   ═══════════════════════════════════════════════ */

/** Render all Sankey links into the given SVG group */
export function renderLinks(
    container: SVGGElement,
    defsEl: SVGDefsElement,
    links: SankeyLink[],
    cfg: RenderConfig,
    callbacks: LinkCallbacks,
): void {
    const g = select(container);
    const defs = select(defsEl);
    const className = CSS_PREFIX + "link";

    /* Rebuild gradients (these depend on node positions and link indices) */
    defs.selectAll(`.${CSS_PREFIX}link-gradient`).remove();
    if (cfg.link.colorMode === "gradient") {
        buildGradients(defs, links);
    }

    /* D3 join */
    const sel = g.selectAll<SVGPathElement, SankeyLink>(`.${className}`)
        .data(links);

    sel.exit().remove();

    const enter = sel.enter()
        .append("path")
        .attr("class", className)
        .attr("fill", "none")
        .style("cursor", "pointer");

    const merged = enter.merge(sel)
        .attr("d", (d) => linkPath(d, cfg.link.curvature))
        .attr("stroke-width", (d) => Math.max(1, d.width))
        .attr("stroke", (d) => resolveLinkColor(d, cfg))
        .attr("stroke-opacity", cfg.link.opacity);

    /* Interaction handlers */
    merged
        .on("click", function (_ev: MouseEvent, d: SankeyLink) {
            callbacks.onClick(d, _ev);
        })
        .on("mouseover", function (_ev: MouseEvent, d: SankeyLink) {
            select(this).attr("stroke-opacity", cfg.link.hoverOpacity);
            callbacks.onMouseOver(d, _ev);
        })
        .on("mousemove", function (_ev: MouseEvent, d: SankeyLink) {
            callbacks.onMouseMove(d, _ev);
        })
        .on("mouseout", function () {
            select(this).attr("stroke-opacity", cfg.link.opacity);
            callbacks.onMouseOut();
        });
}

/** Lightweight path-only update for drag (no gradient rebuild, no event re-binding) */
export function updateLinkPaths(
    container: SVGGElement,
    curvature: number,
): void {
    select(container)
        .selectAll<SVGPathElement, SankeyLink>(`.${CSS_PREFIX}link`)
        .attr("d", (d) => linkPath(d, curvature));
}

/* ═══════════════════════════════════════════════
   Link Path Generator (cubic Bezier)
   ═══════════════════════════════════════════════ */

function linkPath(link: SankeyLink, curvature: number): string {
    const sx = link.source.x1;
    const sy = link.y0;
    const tx = link.target.x0;
    const ty = link.y1;

    const dx = tx - sx;
    const cpx = dx * curvature;

    return `M${sx},${sy} C${sx + cpx},${sy} ${tx - cpx},${ty} ${tx},${ty}`;
}

/* ═══════════════════════════════════════════════
   Gradient Defs
   ═══════════════════════════════════════════════ */

function buildGradients(
    defs: Selection<SVGDefsElement, unknown, null, undefined>,
    links: SankeyLink[],
): void {
    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const id = `${CSS_PREFIX}grad-${i}`;
        link.color = `url(#${id})`;

        const grad = defs.append("linearGradient")
            .attr("id", id)
            .attr("class", CSS_PREFIX + "link-gradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", link.source.x1)
            .attr("y1", link.y0)
            .attr("x2", link.target.x0)
            .attr("y2", link.y1);

        grad.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", link.source.color);

        grad.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", link.target.color);
    }
}

/* ═══════════════════════════════════════════════
   Link Color Resolution
   ═══════════════════════════════════════════════ */

function resolveLinkColor(link: SankeyLink, cfg: RenderConfig): string {
    /* Explicit override from data */
    if (link.colorOverride) return link.colorOverride;

    switch (cfg.link.colorMode) {
        case "sourceColor":
            return link.source.color;
        case "destColor":
            return link.target.color;
        case "gradient":
            return link.color || link.source.color;
        case "fixed":
            return cfg.link.fixedColor;
        default:
            return link.source.color;
    }
}
