/* ═══════════════════════════════════════════════
   Label Renderer – grid labels & axis labels
   ═══════════════════════════════════════════════ */

"use strict";

import { Selection } from "d3-selection";
import { RadarLayout, RenderConfig } from "../types";
import { formatValue } from "../utils/format";

type SVGSel = Selection<SVGGElement, unknown, null, undefined>;

/** Render value labels along the first spoke at each grid level */
export function renderGridLabels(
    g: SVGSel,
    layout: RadarLayout,
    cfg: RenderConfig,
): void {
    g.selectAll("*").remove();

    if (!cfg.grid.showGridLabels) return;

    const { cx, cy, radius, spokeAngles, scaleMin, scaleMax } = layout;
    const { gridLevels, gridLabelFontSize, gridLabelFontColor } = cfg.grid;
    const isPercentage = cfg.scale.scaleType === "percentage";

    /* Use the first spoke direction for label placement */
    const angle = spokeAngles[0] ?? (-Math.PI / 2);

    for (let level = 1; level <= gridLevels; level++) {
        const r = (radius / gridLevels) * level;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);

        /* Value at this grid level */
        const fraction = level / gridLevels;
        const value = isPercentage ? fraction : scaleMin + fraction * (scaleMax - scaleMin);

        g.append("text")
            .attr("class", "radar-grid-label")
            .attr("x", x + 4)
            .attr("y", y - 4)
            .attr("font-size", gridLabelFontSize + "px")
            .attr("fill", gridLabelFontColor)
            .attr("text-anchor", "start")
            .attr("dominant-baseline", "auto")
            .text(formatValue(value, isPercentage));
    }
}

/** Render axis category labels just outside the outermost grid */
export function renderAxisLabels(
    g: SVGSel,
    axes: string[],
    layout: RadarLayout,
    cfg: RenderConfig,
): void {
    g.selectAll("*").remove();

    if (!cfg.axisLabel.showAxisLabels) return;

    const { cx, cy, radius, spokeAngles } = layout;
    const { axisFontSize, axisFontColor, labelPadding } = cfg.axisLabel;

    for (let i = 0; i < axes.length; i++) {
        const angle = spokeAngles[i];
        const labelR = radius + labelPadding;
        const x = cx + labelR * Math.cos(angle);
        const y = cy + labelR * Math.sin(angle);

        /* Determine text-anchor based on position around circle */
        const angleDeg = ((angle * 180) / Math.PI + 360) % 360;
        let anchor: string;
        if (angleDeg > 100 && angleDeg < 260) {
            anchor = "end";
        } else if (angleDeg > 80 && angleDeg <= 100 || angleDeg >= 260 && angleDeg < 280) {
            anchor = "middle";
        } else {
            anchor = "start";
        }

        /* Vertical adjustment */
        let dy = "0.35em";
        if (angleDeg > 190 && angleDeg < 350) {
            dy = "0em";
        } else if (angleDeg > 10 && angleDeg < 170) {
            dy = "0.71em";
        }

        g.append("text")
            .attr("class", "radar-axis-label")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", dy)
            .attr("font-size", axisFontSize + "px")
            .attr("fill", axisFontColor)
            .attr("text-anchor", anchor)
            .text(axes[i]);
    }
}
