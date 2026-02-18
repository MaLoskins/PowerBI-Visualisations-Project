/* ═══════════════════════════════════════════════
   Linear Gauge – Label Renderer
   Value labels, category labels, min/max, targets
   ═══════════════════════════════════════════════ */
"use strict";

import * as d3 from "d3-selection";
import { scaleLinear } from "d3-scale";
import { GaugeItem, RenderConfig } from "../types";
import { formatValue } from "../utils/format";
import { LABEL_PADDING_H, MIN_MAX_LABEL_PADDING } from "../constants";

/**
 * Render value labels onto the gauge SVG for horizontal layout.
 * Called after gauge bars are drawn.
 */
export function renderValueLabels(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    items: GaugeItem[],
    cfg: RenderConfig,
    barAreaWidth: number,
): void {
    if (!cfg.label.showValueLabel) return;

    const gaugeH = cfg.layout.gaugeHeight;
    const spacing = cfg.layout.gaugeSpacing;
    const fmt = cfg.label.valueFormat;

    items.forEach((item, i) => {
        const yOffset = i * (gaugeH + spacing);
        const scale = scaleLinear()
            .domain([item.minValue, item.maxValue])
            .range([0, barAreaWidth])
            .clamp(true);

        const barW = Math.max(0, scale(item.value));
        const text = formatValue(item.value, fmt);
        const pos = cfg.label.valueLabelPosition;

        let x = 0;
        let y = yOffset + gaugeH / 2;
        let anchor = "start";

        switch (pos) {
            case "right":
                x = barW + LABEL_PADDING_H;
                anchor = "start";
                break;
            case "left":
                x = -LABEL_PADDING_H;
                anchor = "end";
                break;
            case "inside":
                x = barW - LABEL_PADDING_H;
                anchor = "end";
                if (x < LABEL_PADDING_H * 3) {
                    // Bar too short, push outside
                    x = barW + LABEL_PADDING_H;
                    anchor = "start";
                }
                break;
            case "above":
                x = barW / 2;
                y = yOffset - 3;
                anchor = "middle";
                break;
        }

        svg.append("text")
            .attr("class", "lgauge-value-label")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", pos === "above" ? "0" : "0.35em")
            .attr("text-anchor", anchor)
            .attr("font-size", cfg.label.valueFontSize + "px")
            .attr("fill", cfg.label.valueFontColor)
            .text(text);
    });
}

/**
 * Render value labels for vertical layout.
 */
export function renderVerticalValueLabels(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    items: GaugeItem[],
    cfg: RenderConfig,
    barAreaHeight: number,
): void {
    if (!cfg.label.showValueLabel) return;

    const gaugeW = cfg.layout.gaugeHeight;
    const spacing = cfg.layout.gaugeSpacing;
    const fmt = cfg.label.valueFormat;

    items.forEach((item, i) => {
        const xOffset = i * (gaugeW + spacing);
        const scale = scaleLinear()
            .domain([item.minValue, item.maxValue])
            .range([0, barAreaHeight])
            .clamp(true);

        const barH = Math.max(0, scale(item.value));
        const text = formatValue(item.value, fmt);
        const barTopY = barAreaHeight - barH;

        let x = xOffset + gaugeW / 2;
        let y = barTopY - LABEL_PADDING_H;
        const anchor = "middle";

        if (cfg.label.valueLabelPosition === "inside") {
            y = barTopY + LABEL_PADDING_H + cfg.label.valueFontSize;
            if (barH < cfg.label.valueFontSize * 2) {
                y = barTopY - LABEL_PADDING_H;
            }
        }

        svg.append("text")
            .attr("class", "lgauge-value-label")
            .attr("x", x)
            .attr("y", y)
            .attr("text-anchor", anchor)
            .attr("font-size", cfg.label.valueFontSize + "px")
            .attr("fill", cfg.label.valueFontColor)
            .text(text);
    });
}

/**
 * Render target labels adjacent to target lines (horizontal).
 */
export function renderTargetLabels(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    items: GaugeItem[],
    cfg: RenderConfig,
    barAreaWidth: number,
): void {
    if (!cfg.label.showTargetLabel || !cfg.target.showTarget) return;

    const gaugeH = cfg.layout.gaugeHeight;
    const spacing = cfg.layout.gaugeSpacing;
    const fmt = cfg.label.valueFormat;

    items.forEach((item, i) => {
        const yOffset = i * (gaugeH + spacing);
        const scale = scaleLinear()
            .domain([item.minValue, item.maxValue])
            .range([0, barAreaWidth])
            .clamp(true);

        if (item.target != null) {
            const tx = scale(item.target);
            svg.append("text")
                .attr("class", "lgauge-target-label")
                .attr("x", tx)
                .attr("y", yOffset - 3)
                .attr("text-anchor", "middle")
                .attr("font-size", (cfg.label.valueFontSize - 1) + "px")
                .attr("fill", cfg.target.targetColor)
                .text(formatValue(item.target, fmt));
        }

        if (item.target2 != null) {
            const tx = scale(item.target2);
            svg.append("text")
                .attr("class", "lgauge-target-label")
                .attr("x", tx)
                .attr("y", yOffset - 3)
                .attr("text-anchor", "middle")
                .attr("font-size", (cfg.label.valueFontSize - 1) + "px")
                .attr("fill", cfg.target.target2Color)
                .text(formatValue(item.target2, fmt));
        }
    });
}

/**
 * Render min/max labels at the ends of each gauge (horizontal).
 */
export function renderMinMaxLabels(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    items: GaugeItem[],
    cfg: RenderConfig,
    barAreaWidth: number,
): void {
    if (!cfg.label.showMinMax) return;

    const gaugeH = cfg.layout.gaugeHeight;
    const spacing = cfg.layout.gaugeSpacing;
    const fmt = cfg.label.valueFormat;
    const fontSize = Math.max(cfg.label.valueFontSize - 2, 7);

    items.forEach((item, i) => {
        const yTop = i * (gaugeH + spacing) + gaugeH + fontSize + MIN_MAX_LABEL_PADDING;

        svg.append("text")
            .attr("class", "lgauge-minmax-label")
            .attr("x", 0)
            .attr("y", yTop)
            .attr("text-anchor", "start")
            .attr("font-size", fontSize + "px")
            .attr("fill", cfg.label.valueFontColor)
            .attr("opacity", 0.6)
            .text(formatValue(item.minValue, fmt));

        svg.append("text")
            .attr("class", "lgauge-minmax-label")
            .attr("x", barAreaWidth)
            .attr("y", yTop)
            .attr("text-anchor", "end")
            .attr("font-size", fontSize + "px")
            .attr("fill", cfg.label.valueFontColor)
            .attr("opacity", 0.6)
            .text(formatValue(item.maxValue, fmt));
    });
}

/**
 * Render category labels into the HTML label container (horizontal mode).
 */
export function renderCategoryLabelsHTML(
    container: HTMLDivElement,
    items: GaugeItem[],
    cfg: RenderConfig,
): void {
    while (container.firstChild) container.removeChild(container.firstChild);

    if (!cfg.layout.showCategoryLabels) {
        container.style.display = "none";
        return;
    }
    container.style.display = "block";
    container.style.width = cfg.layout.categoryWidth + "px";

    const gaugeH = cfg.layout.gaugeHeight;
    const spacing = cfg.layout.gaugeSpacing;

    items.forEach((item) => {
        const label = document.createElement("div");
        label.className = "lgauge-category-label";
        label.textContent = item.category;
        label.style.height = gaugeH + "px";
        label.style.lineHeight = gaugeH + "px";
        label.style.marginBottom = spacing + "px";
        label.style.fontSize = cfg.layout.categoryFontSize + "px";
        label.style.color = cfg.layout.categoryFontColor;
        container.appendChild(label);
    });
}

/**
 * Render category labels as SVG text below each vertical gauge.
 */
export function renderVerticalCategoryLabels(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    items: GaugeItem[],
    cfg: RenderConfig,
    barAreaHeight: number,
): void {
    if (!cfg.layout.showCategoryLabels) return;

    const gaugeW = cfg.layout.gaugeHeight;
    const spacing = cfg.layout.gaugeSpacing;

    items.forEach((item, i) => {
        const xOffset = i * (gaugeW + spacing) + gaugeW / 2;

        svg.append("text")
            .attr("class", "lgauge-category-label-v")
            .attr("x", xOffset)
            .attr("y", barAreaHeight + cfg.layout.categoryFontSize + 4)
            .attr("text-anchor", "middle")
            .attr("font-size", cfg.layout.categoryFontSize + "px")
            .attr("fill", cfg.layout.categoryFontColor)
            .text(item.category);
    });
}
