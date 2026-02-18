/* ═══════════════════════════════════════════════
   Advanced Trellis – Grid Layout Calculation
   ═══════════════════════════════════════════════ */

"use strict";

import type { GridLayout, RenderConfig } from "../types";
import { clamp } from "../utils/dom";

/**
 * Compute the trellis grid layout: number of columns/rows, panel dimensions.
 */
export function computeGridLayout(
    viewportWidth: number,
    viewportHeight: number,
    panelCount: number,
    cfg: RenderConfig["layout"],
): GridLayout {
    /* Auto-column calculation when columns = 0 */
    let cols: number;
    if (cfg.columns > 0) {
        cols = cfg.columns;
    } else {
        cols = Math.floor(viewportWidth / cfg.panelMinWidth);
        cols = clamp(cols, 1, panelCount);
    }

    const rows = Math.ceil(panelCount / cols);

    /* Panel width: fill available space minus padding */
    const totalHPadding = cfg.panelPadding * (cols + 1);
    const panelWidth = Math.max(
        cfg.panelMinWidth,
        Math.floor((viewportWidth - totalHPadding) / cols),
    );

    /* Panel height: try to fill viewport, but respect minimum */
    const totalVPadding = cfg.panelPadding * (rows + 1);
    const idealHeight = Math.floor((viewportHeight - totalVPadding) / rows);
    const panelHeight = Math.max(cfg.panelMinHeight, idealHeight);

    /* Total scrollable height */
    const totalHeight = rows * panelHeight + (rows + 1) * cfg.panelPadding;

    return {
        columns: cols,
        rows,
        panelWidth,
        panelHeight,
        totalHeight,
    };
}
