/* ═══════════════════════════════════════════════
   Grid Renderer – rings and spokes
   ═══════════════════════════════════════════════ */

"use strict";

import { select, Selection } from "d3-selection";
import { RadarLayout, RenderConfig } from "../types";

type SVGSel = Selection<SVGGElement, unknown, null, undefined>;

/** Render concentric grid rings (polygon or circle) and spokes */
export function renderGrid(
    g: SVGSel,
    layout: RadarLayout,
    numAxes: number,
    cfg: RenderConfig,
): void {
    g.selectAll("*").remove();

    const { cx, cy, radius, spokeAngles } = layout;
    const { gridLevels, gridShape, gridColor, gridWidth, gridOpacity, spokeColor, spokeWidth } = cfg.grid;

    /* ── Grid rings ── */
    for (let level = 1; level <= gridLevels; level++) {
        const r = (radius / gridLevels) * level;

        if (gridShape === "circle") {
            g.append("circle")
                .attr("class", "radar-grid-ring")
                .attr("cx", cx)
                .attr("cy", cy)
                .attr("r", r)
                .attr("stroke", gridColor)
                .attr("stroke-width", gridWidth)
                .attr("opacity", gridOpacity);
        } else {
            const points = spokeAngles
                .map((angle) => {
                    const x = cx + r * Math.cos(angle);
                    const y = cy + r * Math.sin(angle);
                    return `${x},${y}`;
                })
                .join(" ");

            g.append("polygon")
                .attr("class", "radar-grid-ring")
                .attr("points", points)
                .attr("stroke", gridColor)
                .attr("stroke-width", gridWidth)
                .attr("opacity", gridOpacity);
        }
    }

    /* ── Spokes ── */
    for (const angle of spokeAngles) {
        const x2 = cx + radius * Math.cos(angle);
        const y2 = cy + radius * Math.sin(angle);

        g.append("line")
            .attr("class", "radar-spoke")
            .attr("x1", cx)
            .attr("y1", cy)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", spokeColor)
            .attr("stroke-width", spokeWidth)
            .attr("opacity", gridOpacity);
    }
}
