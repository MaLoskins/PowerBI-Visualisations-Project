/* ═══════════════════════════════════════════════
   Layout — compute chart margins and dimensions
   ═══════════════════════════════════════════════ */
"use strict";

import type { RenderConfig, ChartLayout, SeriesConfig } from "../types";
import {
    MARGIN_TOP, MARGIN_BOTTOM, MARGIN_LEFT, MARGIN_RIGHT,
    Y_AXIS_WIDTH, X_AXIS_BASE_HEIGHT, LEGEND_HEIGHT, AXIS_LABEL_PAD,
    MIN_CHART_SIZE,
} from "../constants";

/** Determine which axes are active (have at least one non-"none" series assigned). */
export function resolveActiveAxes(
    seriesConfigs: SeriesConfig[],
    measureCount: number,
): { hasLeftPrimary: boolean; hasLeftSecondary: boolean; hasRight: boolean } {
    let hasLeftPrimary = false;
    let hasLeftSecondary = false;
    let hasRight = false;

    for (let i = 0; i < measureCount; i++) {
        const s = seriesConfigs[i];
        if (s.chartType === "none") continue;
        if (s.axis === "leftPrimary") hasLeftPrimary = true;
        if (s.axis === "leftSecondary") hasLeftSecondary = true;
        if (s.axis === "right") hasRight = true;
    }

    return { hasLeftPrimary, hasLeftSecondary, hasRight };
}

/** Compute the chart layout rectangle given the viewport and config. */
export function computeLayout(
    viewportWidth: number,
    viewportHeight: number,
    cfg: RenderConfig,
    measureCount: number,
): ChartLayout {
    const axes = resolveActiveAxes(cfg.series, measureCount);

    /* ── Legend ── */
    const legendHeight = cfg.legend.showLegend ? LEGEND_HEIGHT : 0;
    const legendIsTop = cfg.legend.legendPosition === "top";

    /* ── Y-axis widths ── */
    const leftPrimaryWidth = axes.hasLeftPrimary && cfg.yAxisLeft.showAxis ? Y_AXIS_WIDTH : 0;
    const leftSecondaryWidth = axes.hasLeftSecondary && cfg.yAxisLeftSecondary.showAxis ? Y_AXIS_WIDTH : 0;
    const rightWidth = axes.hasRight && cfg.yAxisRight.showAxis ? Y_AXIS_WIDTH : 0;

    /* ── Axis label padding ── */
    const leftPrimaryLabelPad = leftPrimaryWidth > 0 && cfg.yAxisLeft.axisLabel ? AXIS_LABEL_PAD : 0;
    const leftSecondaryLabelPad = leftSecondaryWidth > 0 && cfg.yAxisLeftSecondary.axisLabel ? AXIS_LABEL_PAD : 0;
    const rightLabelPad = rightWidth > 0 && cfg.yAxisRight.axisLabel ? AXIS_LABEL_PAD : 0;

    /* ── X-axis height ── */
    let xAxisHeight = 0;
    if (cfg.xAxis.showXAxis) {
        xAxisHeight = X_AXIS_BASE_HEIGHT;
        if (cfg.xAxis.xLabelRotation === "45") xAxisHeight += 10;
        if (cfg.xAxis.xLabelRotation === "90") xAxisHeight += 20;
    }

    /* ── Chart area ── */
    const chartLeft = MARGIN_LEFT + leftSecondaryWidth + leftSecondaryLabelPad + leftPrimaryWidth + leftPrimaryLabelPad;
    const chartTop = MARGIN_TOP + (legendIsTop ? legendHeight : 0);
    const chartWidth = Math.max(MIN_CHART_SIZE,
        viewportWidth - chartLeft - MARGIN_RIGHT - rightWidth - rightLabelPad);
    const chartHeight = Math.max(MIN_CHART_SIZE,
        viewportHeight - chartTop - MARGIN_BOTTOM - xAxisHeight - (!legendIsTop ? legendHeight : 0));

    return {
        chartLeft,
        chartTop,
        chartWidth,
        chartHeight,
        leftPrimaryAxisWidth: leftPrimaryWidth + leftPrimaryLabelPad,
        leftSecondaryAxisWidth: leftSecondaryWidth + leftSecondaryLabelPad,
        rightAxisWidth: rightWidth + rightLabelPad,
        legendHeight,
        xAxisHeight,
        totalWidth: viewportWidth,
        totalHeight: viewportHeight,
        hasLeftPrimary: axes.hasLeftPrimary,
        hasLeftSecondary: axes.hasLeftSecondary,
        hasRight: axes.hasRight,
    };
}
