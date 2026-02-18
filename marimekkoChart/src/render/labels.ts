/*
 *  Marimekko Chart – Power BI Custom Visual
 *  render/labels.ts — Segment data labels
 */
"use strict";

import * as d3 from "d3-selection";

import { MekkoColumn, RenderConfig } from "../types";
import { MIN_LABEL_HEIGHT_FACTOR, LABEL_PADDING_PX } from "../constants";
import { buildSegmentLabelText } from "../utils/format";
import { truncateText } from "../utils/dom";

const FONT_FAMILY = '"Segoe UI", "wf_segoe-ui_normal", "Helvetica Neue", Helvetica, Arial, sans-serif';

/* ═══════════════════════════════════════════════
   Segment Labels
   ═══════════════════════════════════════════════ */

/** Render labels inside segment rects where they fit */
export function renderSegmentLabels(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    columns: MekkoColumn[],
    cfg: RenderConfig,
): void {
    svg.selectAll(".marimekko-segment-labels").remove();

    if (!cfg.label.showSegmentLabels) return;

    const g = svg.append("g").attr("class", "marimekko-segment-labels");
    const fontSize = cfg.label.segmentLabelFontSize;
    const minHeight = fontSize * MIN_LABEL_HEIGHT_FACTOR;
    const thresholdFraction = cfg.chart.percentThreshold / 100;

    for (const col of columns) {
        for (const seg of col.segments) {
            /* Skip if segment too small */
            if (seg.fractionOfColumn < thresholdFraction) continue;
            if (seg.height < minHeight) continue;

            const maxTextWidth = col.width - LABEL_PADDING_PX * 2;
            if (maxTextWidth <= 0) continue;

            const rawText = buildSegmentLabelText(
                cfg.label.segmentLabelContent,
                seg.segmentCategory,
                seg.fractionOfColumn,
                seg.value,
            );

            const labelText = truncateText(rawText, maxTextWidth, fontSize, FONT_FAMILY);
            if (!labelText || labelText === "…") continue;

            const cx = col.x + col.width / 2;
            const cy = seg.y + seg.height / 2;

            g.append("text")
                .attr("class", "marimekko-segment-label")
                .attr("x", cx)
                .attr("y", cy)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .attr("fill", cfg.label.segmentLabelFontColor)
                .attr("font-size", fontSize + "px")
                .attr("font-family", FONT_FAMILY)
                .attr("pointer-events", "none")
                .text(labelText);
        }
    }
}
