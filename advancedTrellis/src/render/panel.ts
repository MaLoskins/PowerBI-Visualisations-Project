/* ═══════════════════════════════════════════════
   Advanced Trellis – Panel Renderer
   Renders the title bar and delegates chart SVG
   ═══════════════════════════════════════════════ */

"use strict";

import type { TrellisPanel, RenderConfig, PanelCallbacks } from "../types";
import { TITLE_BAR_HEIGHT, TITLE_PADDING_H } from "../constants";
import { renderChart } from "./chart";

/**
 * Update a panel's DOM container: apply styles, render title bar, render chart.
 * The panelDiv and its child elements (titleDiv + SVG) are created once externally;
 * this function only mutates their content and attributes.
 */
export function updatePanel(
    panelDiv: HTMLDivElement,
    titleDiv: HTMLDivElement,
    svg: SVGSVGElement,
    panel: TrellisPanel | null,
    panelWidth: number,
    panelHeight: number,
    yMin: number,
    yMax: number,
    cfg: RenderConfig,
    callbacks: PanelCallbacks,
): void {
    /* ── Panel container styling ── */
    panelDiv.style.width = `${panelWidth}px`;
    panelDiv.style.height = `${panelHeight}px`;
    panelDiv.style.background = cfg.layout.panelBackground;
    panelDiv.style.borderRadius = `${cfg.layout.panelCornerRadius}px`;
    panelDiv.style.border = `${cfg.layout.panelBorderWidth}px solid ${cfg.layout.panelBorderColor}`;
    panelDiv.style.overflow = "hidden";

    if (!panel) {
        panelDiv.style.display = "none";
        return;
    }
    panelDiv.style.display = "block";

    /* ── Title bar ── */
    const showTitle = cfg.title.showPanelTitles;
    const titleHeight = showTitle ? TITLE_BAR_HEIGHT : 0;

    if (showTitle) {
        titleDiv.style.display = "block";
        titleDiv.style.height = `${titleHeight}px`;
        titleDiv.style.lineHeight = `${titleHeight}px`;
        titleDiv.style.padding = `0 ${TITLE_PADDING_H}px`;
        titleDiv.style.fontSize = `${cfg.title.titleFontSize}px`;
        titleDiv.style.color = cfg.title.titleFontColor;
        titleDiv.style.background = cfg.title.titleBackground;
        titleDiv.style.textAlign = cfg.title.titleAlignment;
        titleDiv.style.whiteSpace = "nowrap";
        titleDiv.style.overflow = "hidden";
        titleDiv.style.textOverflow = "ellipsis";
        titleDiv.textContent = panel.trellisValue;
    } else {
        titleDiv.style.display = "none";
        titleDiv.textContent = "";
    }

    /* ── Chart SVG ── */
    const chartHeight = panelHeight - titleHeight - cfg.layout.panelBorderWidth * 2;
    const chartWidth = panelWidth - cfg.layout.panelBorderWidth * 2;

    renderChart(
        svg,
        panel,
        Math.max(10, chartWidth),
        Math.max(10, chartHeight),
        yMin,
        yMax,
        cfg,
        callbacks,
    );
}
