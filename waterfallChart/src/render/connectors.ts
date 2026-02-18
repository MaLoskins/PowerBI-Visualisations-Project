/* ═══════════════════════════════════════════════
   WaterfallChart - Connector Lines
   Thin lines connecting bar tops/bottoms to show
   running total continuity
   ═══════════════════════════════════════════════ */

"use strict";

import { Selection } from "d3-selection";
import { WaterfallBar, RenderConfig } from "../types";
import { AxisScales } from "./axes";
import { CSS_PREFIX } from "../constants";

type SVGSel = Selection<SVGGElement, unknown, null, undefined>;

/** Data for a single connector line between two adjacent bars. */
interface ConnectorDatum {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

/** Render connector lines between adjacent bars. */
export function renderConnectors(
    g: SVGSel,
    bars: WaterfallBar[],
    scales: AxisScales,
    cfg: RenderConfig,
): void {
    g.selectAll("*").remove();
    if (!cfg.chart.showConnectorLines || bars.length < 2) return;

    const isVertical = cfg.chart.orientation === "vertical";
    const bandwidth = scales.categoryScale.bandwidth();
    const connectors: ConnectorDatum[] = [];

    for (let i = 0; i < bars.length - 1; i++) {
        const curr = bars[i];
        const next = bars[i + 1];

        /* The connector goes from the current bar's running-total level
           to the start of the next bar at the same level. */
        const connectValue = curr.runningTotal;

        const currCat = scales.categoryScale(curr.category) ?? 0;
        const nextCat = scales.categoryScale(next.category) ?? 0;

        if (isVertical) {
            const yPos = scales.valueScale(connectValue);
            connectors.push({
                x1: currCat + bandwidth,
                y1: yPos,
                x2: nextCat,
                y2: yPos,
            });
        } else {
            const xPos = scales.valueScale(connectValue);
            connectors.push({
                x1: xPos,
                y1: currCat + bandwidth,
                x2: xPos,
                y2: nextCat,
            });
        }
    }

    g.selectAll<SVGLineElement, ConnectorDatum>(`.${CSS_PREFIX}connector`)
        .data(connectors)
        .join("line")
        .attr("class", `${CSS_PREFIX}connector`)
        .attr("x1", (d) => d.x1)
        .attr("y1", (d) => d.y1)
        .attr("x2", (d) => d.x2)
        .attr("y2", (d) => d.y2)
        .attr("stroke", cfg.chart.connectorLineColor)
        .attr("stroke-width", cfg.chart.connectorLineWidth)
        .attr("stroke-dasharray", cfg.chart.connectorLineStyle === "dashed" ? "4,3" : "none");
}
