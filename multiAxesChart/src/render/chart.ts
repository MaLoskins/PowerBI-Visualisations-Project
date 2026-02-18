/* ═══════════════════════════════════════════════
   Chart Rendering — scale computation and
   orchestration of bars, lines, axes, legend, labels
   ═══════════════════════════════════════════════ */
"use strict";

import { Selection } from "d3-selection";
import { scaleLinear, scaleBand, ScaleLinear, ScaleBand } from "d3-scale";
import type {
    RenderConfig, ChartLayout, ParsedData,
    AxisBinding, CategoryDataPoint, YAxisConfig,
} from "../types";
import { AXIS_BINDINGS, MAX_SERIES } from "../types";
import { BAR_PADDING_INNER, BAR_PADDING_OUTER } from "../constants";
import { renderBars, BarCallbacks } from "./bars";
import { renderLinesAndAreas, LineCallbacks } from "./lines";
import { renderYAxis, renderXAxis } from "./axes";
import { renderLegend } from "./legend";
import { renderDataLabels } from "./labels";

type SvgSel = Selection<SVGGElement, unknown, null, undefined>;

export interface ChartGroups {
    gBars: SvgSel;
    gLines: SvgSel;
    gXAxis: SvgSel;
    gYAxisLeft: SvgSel;
    gYAxisLeftSec: SvgSel;
    gYAxisRight: SvgSel;
    gLegend: SvgSel;
    gLabels: SvgSel;
}

export interface ChartCallbacks extends BarCallbacks, LineCallbacks {
    onBackgroundClick: (e: MouseEvent) => void;
}

/** Build the shared X band-scale across all categories. */
function buildXScale(data: ParsedData, layout: ChartLayout): ScaleBand<string> {
    const labels = data.categories.map(c => c.categoryLabel);
    return scaleBand<string>()
        .domain(labels)
        .range([layout.chartLeft, layout.chartLeft + layout.chartWidth])
        .paddingInner(BAR_PADDING_INNER)
        .paddingOuter(BAR_PADDING_OUTER);
}

/** Compute the y-domain for a given axis binding as the union of all assigned measures. */
function computeAxisDomain(
    data: ParsedData,
    cfg: RenderConfig,
    axis: AxisBinding,
    axisCfg: YAxisConfig,
): [number, number] | null {
    let minVal = Infinity;
    let maxVal = -Infinity;
    let hasValues = false;

    for (let m = 0; m < data.measureCount; m++) {
        const s = cfg.series[m];
        if (s.chartType === "none" || s.axis !== axis) continue;

        for (const cat of data.categories) {
            const v = cat.values[m];
            if (v == null) continue;
            hasValues = true;
            if (v < minVal) minVal = v;
            if (v > maxVal) maxVal = v;
        }
    }

    if (!hasValues) return null;

    // Apply user overrides
    if (axisCfg.axisMin != null) minVal = axisCfg.axisMin;
    if (axisCfg.axisMax != null) maxVal = axisCfg.axisMax;

    // Ensure domain includes 0 for bar charts
    let hasBar = false;
    for (let m = 0; m < data.measureCount; m++) {
        if (cfg.series[m].chartType === "bar" && cfg.series[m].axis === axis) {
            hasBar = true;
            break;
        }
    }
    if (hasBar) {
        if (minVal > 0) minVal = 0;
        if (maxVal < 0) maxVal = 0;
    }

    // Add 5% padding
    const range = maxVal - minVal || 1;
    const pad = range * 0.05;
    if (axisCfg.axisMin == null) minVal -= pad;
    if (axisCfg.axisMax == null) maxVal += pad;

    return [minVal, maxVal];
}

/** Build y-scales for all active axes. */
function buildYScales(
    data: ParsedData,
    cfg: RenderConfig,
    layout: ChartLayout,
): Map<AxisBinding, ScaleLinear<number, number>> {
    const map = new Map<AxisBinding, ScaleLinear<number, number>>();

    const axisCfgMap: Record<AxisBinding, YAxisConfig> = {
        leftPrimary: cfg.yAxisLeft,
        leftSecondary: cfg.yAxisLeftSecondary,
        right: cfg.yAxisRight,
    };

    for (const axis of AXIS_BINDINGS) {
        const domain = computeAxisDomain(data, cfg, axis, axisCfgMap[axis]);
        if (!domain) continue;

        const scale = scaleLinear()
            .domain([domain[0], domain[1]])
            .range([layout.chartTop + layout.chartHeight, layout.chartTop])
            .nice();

        map.set(axis, scale);
    }

    return map;
}

/** Main chart render function — orchestrates all sub-renderers. */
export function renderChart(
    groups: ChartGroups,
    data: ParsedData,
    cfg: RenderConfig,
    layout: ChartLayout,
    callbacks: ChartCallbacks,
): void {
    const xScale = buildXScale(data, layout);
    const yScales = buildYScales(data, cfg, layout);

    /* ── Axes ── */
    const leftScale = yScales.get("leftPrimary");
    if (leftScale && layout.hasLeftPrimary) {
        renderYAxis(groups.gYAxisLeft, leftScale, cfg.yAxisLeft, layout, "left");
    } else {
        groups.gYAxisLeft.selectAll("*").remove();
    }

    const leftSecScale = yScales.get("leftSecondary");
    if (leftSecScale && layout.hasLeftSecondary) {
        renderYAxis(groups.gYAxisLeftSec, leftSecScale, cfg.yAxisLeftSecondary, layout, "leftSecondary");
    } else {
        groups.gYAxisLeftSec.selectAll("*").remove();
    }

    const rightScale = yScales.get("right");
    if (rightScale && layout.hasRight) {
        renderYAxis(groups.gYAxisRight, rightScale, cfg.yAxisRight, layout, "right");
    } else {
        groups.gYAxisRight.selectAll("*").remove();
    }

    /* ── X axis ── */
    renderXAxis(groups.gXAxis, xScale, cfg.xAxis, layout);

    /* ── Bars (rendered first, behind lines) ── */
    renderBars(groups.gBars, data.categories, xScale, yScales, cfg, data.measureCount, layout, callbacks);

    /* ── Lines + Areas ── */
    renderLinesAndAreas(groups.gLines, data.categories, xScale, yScales, cfg, data.measureCount, layout, callbacks);

    /* ── Data Labels ── */
    renderDataLabels(groups.gLabels, data.categories, xScale, yScales, cfg, data.measureCount, layout);

    /* ── Legend ── */
    renderLegend(groups.gLegend, data.measureNames, data.measureCount, cfg, layout);
}
