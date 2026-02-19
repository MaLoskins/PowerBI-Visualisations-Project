/* ═══════════════════════════════════════════════
   Linear Gauge – Gauge Renderer
   SVG rendering for track, bar, ranges, targets
   ═══════════════════════════════════════════════ */
"use strict";

import * as d3 from "d3-selection";
import { scaleLinear, ScaleLinear } from "d3-scale";
import { GaugeItem, RenderConfig, GaugeCallbacks } from "../types";
import { RESOURCE_COLORS, RANGE_BAND_OPACITY, UNSELECTED_OPACITY } from "../constants";
import { hexToRgba } from "../utils/color";

/**
 * Render all gauge rows into the provided SVG element.
 * Clears previous contents and redraws from scratch.
 */
export function renderGauges(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    items: GaugeItem[],
    cfg: RenderConfig,
    barAreaWidth: number,
    barAreaHeight: number,
    callbacks: GaugeCallbacks,
    selectedIds: Set<string>,
): void {
    svg.selectAll("*").remove();

    const isHorizontal = cfg.layout.orientation === "horizontal";
    const gaugeH = cfg.layout.gaugeHeight;
    const spacing = cfg.layout.gaugeSpacing;
    const radius = cfg.layout.gaugeCornerRadius;
    const hasSelection = selectedIds.size > 0;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        const yOffset = isHorizontal ? i * (gaugeH + spacing) : 0;
        const xOffset = isHorizontal ? 0 : i * (gaugeH + spacing);

        const gaugeDim = isHorizontal ? barAreaWidth : barAreaHeight;
        const scale = scaleLinear()
            .domain([item.minValue, item.maxValue])
            .range([0, gaugeDim])
            .clamp(true);

        /* ── Selection key ── */
        const idKey = getSelectionKey(item, i);
        const isSelected = hasSelection && selectedIds.has(idKey);
        const dimmed = hasSelection && !isSelected;
        const rowOpacity = dimmed ? UNSELECTED_OPACITY : 1;

        const group = svg.append("g")
            .attr("class", "lgauge-row")
            .attr("data-row", String(item.rowIndex))
            .attr("data-sel-key", idKey)
            .attr("transform", isHorizontal
                ? `translate(0,${yOffset})`
                : `translate(${xOffset},0)`)
            .attr("opacity", rowOpacity);

        /* ── Determine bar colour ── */
        let barColor = cfg.bar.barColor;
        if (cfg.color.colorByCategory) {
            barColor = RESOURCE_COLORS[i % RESOURCE_COLORS.length];
        }
        if (cfg.color.conditionalColoring && item.target != null) {
            barColor = item.value >= item.target
                ? cfg.color.aboveTargetColor
                : cfg.color.belowTargetColor;
        }
        if (isSelected) {
            barColor = cfg.color.selectedColor;
        }

        if (isHorizontal) {
            renderHorizontalGauge(group, item, cfg, scale, barColor, gaugeH, gaugeDim, radius, callbacks);
        } else {
            renderVerticalGauge(group, item, cfg, scale, barColor, gaugeH, gaugeDim, radius, callbacks);
        }
    }
}

/* ── Selection key extraction helper ── */

function getSelectionKey(item: GaugeItem, fallbackIndex: number): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sid = item.selectionId as any;
    if (sid && typeof sid.getKey === "function") {
        return sid.getKey();
    }
    if (sid && sid.key) {
        return sid.key;
    }
    return String(fallbackIndex);
}

/* ── Horizontal Gauge ── */

function renderHorizontalGauge(
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    item: GaugeItem,
    cfg: RenderConfig,
    scale: ScaleLinear<number, number>,
    barColor: string,
    gaugeH: number,
    gaugeDim: number,
    radius: number,
    callbacks: GaugeCallbacks,
): void {
    /* ── Clip path for track shape ── */
    const clipId = `lgauge-clip-h-${item.rowIndex}`;
    const defs = group.append("defs");
    defs.append("clipPath")
        .attr("id", clipId)
        .append("rect")
        .attr("x", 0).attr("y", 0)
        .attr("width", gaugeDim).attr("height", gaugeH)
        .attr("rx", radius).attr("ry", radius);

    /* ── Track ── */
    group.append("rect")
        .attr("class", "lgauge-track")
        .attr("x", 0).attr("y", 0)
        .attr("width", gaugeDim).attr("height", gaugeH)
        .attr("rx", radius).attr("ry", radius)
        .attr("fill", cfg.bar.trackColor)
        .attr("stroke", cfg.bar.trackBorderColor)
        .attr("stroke-width", cfg.bar.trackBorderWidth);

    /* ── Range bands (clipped to track shape) ── */
    if (cfg.range.showRanges) {
        renderHorizontalRangesClipped(group, item, cfg, scale, gaugeH, gaugeDim, clipId);
    }

    /* ── Bar fill ── */
    const barW = Math.max(0, scale(item.value));
    group.append("rect")
        .attr("class", "lgauge-bar")
        .attr("x", 0).attr("y", 0)
        .attr("width", barW).attr("height", gaugeH)
        .attr("fill", barColor)
        .attr("opacity", cfg.bar.barOpacity)
        .attr("clip-path", `url(#${clipId})`);

    /* ── Target line(s) ── */
    if (cfg.target.showTarget && item.target != null) {
        renderTargetLine(group, scale(item.target), gaugeH, cfg.target.targetColor,
            cfg.target.targetWidth, cfg.target.targetHeight, "solid");
    }
    if (cfg.target.showTarget && item.target2 != null) {
        renderTargetLine(group, scale(item.target2), gaugeH, cfg.target.target2Color,
            cfg.target.target2Width, cfg.target.targetHeight, cfg.target.target2Style);
    }

    /* ── Interaction overlay ── */
    group.append("rect")
        .attr("class", "lgauge-hit")
        .attr("x", 0).attr("y", 0)
        .attr("width", gaugeDim).attr("height", gaugeH)
        .attr("fill", "transparent")
        .attr("cursor", "pointer")
        .on("click", (e: MouseEvent) => callbacks.onClick(item, e))
        .on("mouseover", (e: MouseEvent) => callbacks.onMouseOver(item, e.pageX, e.pageY))
        .on("mousemove", (e: MouseEvent) => callbacks.onMouseMove(item, e.pageX, e.pageY))
        .on("mouseout", () => callbacks.onMouseOut());
}

/* ── Vertical Gauge ── */

function renderVerticalGauge(
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    item: GaugeItem,
    cfg: RenderConfig,
    _scale: ScaleLinear<number, number>,
    barColor: string,
    gaugeW: number,
    gaugeDim: number,
    radius: number,
    callbacks: GaugeCallbacks,
): void {
    const vScale = scaleLinear()
        .domain([item.minValue, item.maxValue])
        .range([0, gaugeDim])
        .clamp(true);

    /* ── Clip path ── */
    const clipId = `lgauge-clip-v-${item.rowIndex}`;
    const defs = group.append("defs");
    defs.append("clipPath")
        .attr("id", clipId)
        .append("rect")
        .attr("x", 0).attr("y", 0)
        .attr("width", gaugeW).attr("height", gaugeDim)
        .attr("rx", radius).attr("ry", radius);

    /* ── Track ── */
    group.append("rect")
        .attr("class", "lgauge-track")
        .attr("x", 0).attr("y", 0)
        .attr("width", gaugeW).attr("height", gaugeDim)
        .attr("rx", radius).attr("ry", radius)
        .attr("fill", cfg.bar.trackColor)
        .attr("stroke", cfg.bar.trackBorderColor)
        .attr("stroke-width", cfg.bar.trackBorderWidth);

    /* ── Range bands (clipped) ── */
    if (cfg.range.showRanges) {
        renderVerticalRangesClipped(group, item, cfg, vScale, gaugeW, gaugeDim, clipId);
    }

    /* ── Bar fill (from bottom) ── */
    const barH = Math.max(0, vScale(item.value));
    group.append("rect")
        .attr("class", "lgauge-bar")
        .attr("x", 0)
        .attr("y", gaugeDim - barH)
        .attr("width", gaugeW).attr("height", barH)
        .attr("fill", barColor)
        .attr("opacity", cfg.bar.barOpacity)
        .attr("clip-path", `url(#${clipId})`);

    /* ── Vertical target lines ── */
    if (cfg.target.showTarget && item.target != null) {
        const ty = gaugeDim - vScale(item.target);
        renderVerticalTargetLine(group, ty, gaugeW, cfg.target.targetColor,
            cfg.target.targetWidth, cfg.target.targetHeight, "solid");
    }
    if (cfg.target.showTarget && item.target2 != null) {
        const ty = gaugeDim - vScale(item.target2);
        renderVerticalTargetLine(group, ty, gaugeW, cfg.target.target2Color,
            cfg.target.target2Width, cfg.target.targetHeight, cfg.target.target2Style);
    }

    /* ── Interaction overlay ── */
    group.append("rect")
        .attr("class", "lgauge-hit")
        .attr("x", 0).attr("y", 0)
        .attr("width", gaugeW).attr("height", gaugeDim)
        .attr("fill", "transparent")
        .attr("cursor", "pointer")
        .on("click", (e: MouseEvent) => callbacks.onClick(item, e))
        .on("mouseover", (e: MouseEvent) => callbacks.onMouseOver(item, e.pageX, e.pageY))
        .on("mousemove", (e: MouseEvent) => callbacks.onMouseMove(item, e.pageX, e.pageY))
        .on("mouseout", () => callbacks.onMouseOut());
}

/* ── Horizontal Range Band Helpers ── */

function renderHorizontalRangesClipped(
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    item: GaugeItem,
    cfg: RenderConfig,
    scale: ScaleLinear<number, number>,
    gaugeH: number,
    gaugeDim: number,
    clipId: string,
): void {
    const rangeGroup = group.append("g")
        .attr("class", "lgauge-ranges")
        .attr("clip-path", `url(#${clipId})`);

    const minX = 0;
    const r1End = item.range1Max != null ? scale(item.range1Max) : null;
    const r2End = item.range2Max != null ? scale(item.range2Max) : null;

    if (r1End != null) {
        rangeGroup.append("rect")
            .attr("x", minX).attr("y", 0)
            .attr("width", Math.max(0, r1End - minX))
            .attr("height", gaugeH)
            .attr("fill", hexToRgba(cfg.range.range1Color, RANGE_BAND_OPACITY));
    }

    if (r1End != null && r2End != null) {
        rangeGroup.append("rect")
            .attr("x", r1End).attr("y", 0)
            .attr("width", Math.max(0, r2End - r1End))
            .attr("height", gaugeH)
            .attr("fill", hexToRgba(cfg.range.range2Color, RANGE_BAND_OPACITY));
    }

    const beyondStart = r2End ?? r1End;
    if (beyondStart != null) {
        rangeGroup.append("rect")
            .attr("x", beyondStart).attr("y", 0)
            .attr("width", Math.max(0, gaugeDim - beyondStart))
            .attr("height", gaugeH)
            .attr("fill", hexToRgba(cfg.range.rangeBeyondColor, RANGE_BAND_OPACITY));
    }
}

/* ── Vertical Range Band Helpers ── */

function renderVerticalRangesClipped(
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    item: GaugeItem,
    cfg: RenderConfig,
    scale: ScaleLinear<number, number>,
    gaugeW: number,
    gaugeDim: number,
    clipId: string,
): void {
    const rangeGroup = group.append("g")
        .attr("class", "lgauge-ranges")
        .attr("clip-path", `url(#${clipId})`);

    const r1H = item.range1Max != null ? scale(item.range1Max) : null;
    const r2H = item.range2Max != null ? scale(item.range2Max) : null;

    if (r1H != null) {
        rangeGroup.append("rect")
            .attr("x", 0).attr("y", gaugeDim - r1H)
            .attr("width", gaugeW).attr("height", r1H)
            .attr("fill", hexToRgba(cfg.range.range1Color, RANGE_BAND_OPACITY));
    }

    if (r1H != null && r2H != null) {
        rangeGroup.append("rect")
            .attr("x", 0).attr("y", gaugeDim - r2H)
            .attr("width", gaugeW)
            .attr("height", Math.max(0, r2H - r1H))
            .attr("fill", hexToRgba(cfg.range.range2Color, RANGE_BAND_OPACITY));
    }

    const beyondH = r2H ?? r1H;
    if (beyondH != null) {
        rangeGroup.append("rect")
            .attr("x", 0).attr("y", 0)
            .attr("width", gaugeW)
            .attr("height", Math.max(0, gaugeDim - beyondH))
            .attr("fill", hexToRgba(cfg.range.rangeBeyondColor, RANGE_BAND_OPACITY));
    }
}

/* ── Target Line Helpers ── */

function renderTargetLine(
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    x: number,
    gaugeH: number,
    color: string,
    width: number,
    heightFraction: number,
    style: string,
): void {
    const lineH = gaugeH * heightFraction;
    const yStart = (gaugeH - lineH) / 2;

    const line = group.append("line")
        .attr("class", "lgauge-target")
        .attr("x1", x).attr("y1", yStart)
        .attr("x2", x).attr("y2", yStart + lineH)
        .attr("stroke", color)
        .attr("stroke-width", width);

    if (style === "dashed") {
        line.attr("stroke-dasharray", "4,3");
    }
}

function renderVerticalTargetLine(
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    y: number,
    gaugeW: number,
    color: string,
    width: number,
    heightFraction: number,
    style: string,
): void {
    const lineW = gaugeW * heightFraction;
    const xStart = (gaugeW - lineW) / 2;

    const line = group.append("line")
        .attr("class", "lgauge-target")
        .attr("x1", xStart).attr("y1", y)
        .attr("x2", xStart + lineW).attr("y2", y)
        .attr("stroke", color)
        .attr("stroke-width", width);

    if (style === "dashed") {
        line.attr("stroke-dasharray", "4,3");
    }
}
