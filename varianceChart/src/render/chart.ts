/* ═══════════════════════════════════════════════
   render/chart.ts - Primary chart rendering (actual + budget bars)
   ═══════════════════════════════════════════════ */
"use strict";

import { select, Selection } from "d3-selection";
import { scaleBand, scaleLinear, ScaleBand, ScaleLinear } from "d3-scale";
import { VarianceItem, RenderConfig, ChartCallbacks } from "../types";
import { MARGIN, LEGEND_HEIGHT } from "../constants";
import { renderXAxis, renderYAxis, renderGridlines } from "./axes";
import { renderVarianceIndicators } from "./varianceIndicator";
import { renderVariancePanel } from "./variancePanel";
import { renderLabels } from "./labels";
import { renderLegend } from "./legend";

/** Main chart layout and render orchestration */
export function renderChart(
    svg: SVGSVGElement,
    items: VarianceItem[],
    cfg: RenderConfig,
    width: number,
    height: number,
    callbacks: ChartCallbacks,
): void {
    const d3svg = select(svg);
    d3svg.selectAll("*").remove();

    if (items.length === 0) return;

    const isVertical = cfg.chart.orientation === "vertical";

    /* ── Compute margins ── */
    const legendH = cfg.legend.showLegend ? LEGEND_HEIGHT : 0;
    const legendAtTop = cfg.legend.legendPosition === "top";
    const xRotation = parseInt(cfg.axis.xLabelRotation, 10);
    const xAxisExtra = cfg.axis.showXAxis ? (xRotation > 0 ? 40 : 24) : 0;
    const yAxisExtra = cfg.axis.showYAxis ? 50 : 10;

    const marginTop = MARGIN.top + (legendAtTop ? legendH : 0);
    const marginBottom = MARGIN.bottom + (!legendAtTop ? legendH : 0) + (isVertical ? xAxisExtra : 0);
    const marginLeft = MARGIN.left + (isVertical ? 0 : yAxisExtra);
    const marginRight = MARGIN.right;

    /* Panel allocation */
    const panelAlloc = cfg.variancePanel.showVariancePanel && isVertical
        ? Math.round(width * cfg.variancePanel.panelWidth)
        : 0;

    const innerWidth = Math.max(10, width - marginLeft - marginRight - panelAlloc);
    const innerHeight = Math.max(10, height - marginTop - marginBottom);

    /* ── Set SVG dimensions ── */
    d3svg.attr("width", width).attr("height", height);

    /* ── Root group ── */
    const root = d3svg.append("g")
        .attr("class", "variance-root")
        .attr("transform", `translate(${marginLeft},${marginTop})`);

    /* ── Scales ── */
    const categories = items.map((d) => d.category);
    const allValues = items.flatMap((d) => [d.actual, d.budget, 0]);
    const valueMin = Math.min(...allValues);
    const valueMax = Math.max(...allValues);
    const valuePad = (valueMax - valueMin) * 0.1 || 1;

    let bandScale: ScaleBand<string>;
    let valueScale: ScaleLinear<number, number>;

    if (isVertical) {
        bandScale = scaleBand<string>()
            .domain(categories)
            .range([0, innerWidth])
            .padding(0.15);

        valueScale = scaleLinear()
            .domain([valueMin - valuePad, valueMax + valuePad])
            .range([innerHeight, 0])
            .nice();
    } else {
        bandScale = scaleBand<string>()
            .domain(categories)
            .range([0, innerHeight])
            .padding(0.15);

        valueScale = scaleLinear()
            .domain([valueMin - valuePad, valueMax + valuePad])
            .range([0, innerWidth])
            .nice();
    }

    /* ── Gridlines ── */
    const gridG = root.append("g").attr("class", "variance-gridlines");
    renderGridlines(gridG, valueScale, cfg.axis, innerWidth, innerHeight, isVertical);

    /* ── Draw bars ── */
    const barsG = root.append("g").attr("class", "variance-bars");
    renderBars(barsG, items, bandScale, valueScale, cfg, isVertical, callbacks);

    /* ── Variance indicators ── */
    const indicatorG = root.append("g").attr("class", "variance-indicators");
    renderVarianceIndicators(indicatorG, items, bandScale, valueScale, cfg, isVertical);

    /* ── Data labels ── */
    const labelsG = root.append("g").attr("class", "variance-labels");
    renderLabels(labelsG, items, bandScale, valueScale, cfg, isVertical);

    /* ── Axes ── */
    if (cfg.axis.showXAxis) {
        const xAxisG = root.append("g")
            .attr("class", "variance-x-axis")
            .attr("transform", isVertical ? `translate(0,${innerHeight})` : `translate(0,${innerHeight})`);
        renderXAxis(xAxisG, isVertical ? bandScale : valueScale, cfg.axis, innerWidth, isVertical);
    }

    if (cfg.axis.showYAxis) {
        const yAxisG = root.append("g").attr("class", "variance-y-axis");
        renderYAxis(yAxisG, isVertical ? valueScale : bandScale, cfg.axis, innerHeight, !isVertical);
    }

    /* ── Variance panel ── */
    if (panelAlloc > 0) {
        const panelG = root.append("g")
            .attr("class", "variance-panel")
            .attr("transform", `translate(${innerWidth + 8},0)`);
        renderVariancePanel(
            panelG, items, bandScale,
            cfg, panelAlloc - 8, innerHeight, isVertical,
        );
    }

    /* ── Legend ── */
    const legendY = legendAtTop ? -legendH + 8 : innerHeight + xAxisExtra + 16;
    const legendG = root.append("g")
        .attr("class", "variance-legend")
        .attr("transform", `translate(0,${legendY})`);
    renderLegend(legendG, cfg, innerWidth);

    /* ── Background click to clear selection ── */
    d3svg.on("click", (e: MouseEvent) => {
        if (e.target === svg) {
            callbacks.onClick(null, e);
        }
    });
}

/* ═══════════════════════════════════════════════
   Bar rendering (actual + budget)
   ═══════════════════════════════════════════════ */

function renderBars(
    g: Selection<SVGGElement, unknown, null, undefined>,
    items: VarianceItem[],
    bandScale: ScaleBand<string>,
    valueScale: ScaleLinear<number, number>,
    cfg: RenderConfig,
    isVertical: boolean,
    callbacks: ChartCallbacks,
): void {
    const barFraction = cfg.chart.barWidth;
    const budgetFraction = cfg.chart.budgetWidth;
    const gap = cfg.chart.barGap;
    const radius = cfg.chart.barCornerRadius;

    for (const item of items) {
        const bandPos = bandScale(item.category) ?? 0;
        const bandW = bandScale.bandwidth();

        const actualBarSize = bandW * barFraction;
        const budgetBarSize = bandW * budgetFraction;

        const group = g.append("g")
            .attr("class", "variance-bar-group")
            .attr("data-row", item.rowIndex)
            .style("cursor", "pointer");

        if (isVertical) {
            /* Budget bar (behind, centered) */
            const budgetX = bandPos + (bandW - budgetBarSize) / 2;
            const budgetTop = valueScale(Math.max(item.budget, 0));
            const budgetBottom = valueScale(Math.min(item.budget, 0));

            group.append("rect")
                .attr("class", "variance-budget-bar")
                .attr("x", budgetX)
                .attr("y", budgetTop)
                .attr("width", budgetBarSize)
                .attr("height", Math.max(1, budgetBottom - budgetTop))
                .attr("fill", cfg.colors.budgetColor)
                .attr("rx", radius);

            /* Actual bar (in front, centered but offset by gap) */
            const actualX = bandPos + (bandW - actualBarSize) / 2 - gap;
            const actualTop = valueScale(Math.max(item.actual, 0));
            const actualBottom = valueScale(Math.min(item.actual, 0));

            group.append("rect")
                .attr("class", "variance-actual-bar")
                .attr("x", actualX)
                .attr("y", actualTop)
                .attr("width", actualBarSize)
                .attr("height", Math.max(1, actualBottom - actualTop))
                .attr("fill", cfg.colors.actualColor)
                .attr("rx", radius);
        } else {
            /* Horizontal bars */
            const zeroX = valueScale(0);

            /* Budget bar */
            const budgetY = bandPos + (bandW - budgetBarSize) / 2;
            const budgetLeft = valueScale(Math.min(item.budget, 0));
            const budgetRight = valueScale(Math.max(item.budget, 0));

            group.append("rect")
                .attr("class", "variance-budget-bar")
                .attr("x", budgetLeft)
                .attr("y", budgetY)
                .attr("width", Math.max(1, budgetRight - budgetLeft))
                .attr("height", budgetBarSize)
                .attr("fill", cfg.colors.budgetColor)
                .attr("rx", radius);

            /* Actual bar */
            const actualY = bandPos + (bandW - actualBarSize) / 2 - gap;
            const actualLeft = valueScale(Math.min(item.actual, 0));
            const actualRight = valueScale(Math.max(item.actual, 0));

            group.append("rect")
                .attr("class", "variance-actual-bar")
                .attr("x", actualLeft)
                .attr("y", actualY)
                .attr("width", Math.max(1, actualRight - actualLeft))
                .attr("height", actualBarSize)
                .attr("fill", cfg.colors.actualColor)
                .attr("rx", radius);
        }

        /* ── Interaction handlers ── */
        group
            .on("click", (e: MouseEvent) => {
                e.stopPropagation();
                callbacks.onClick(item, e);
            })
            .on("mouseover", (e: MouseEvent) => callbacks.onMouseOver(item, e))
            .on("mousemove", (e: MouseEvent) => callbacks.onMouseMove(item, e))
            .on("mouseout", () => callbacks.onMouseOut());
    }
}
