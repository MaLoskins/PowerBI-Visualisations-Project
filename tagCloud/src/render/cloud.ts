/* ═══════════════════════════════════════════════
   Tag Cloud – SVG Word Rendering
   ═══════════════════════════════════════════════ */

"use strict";

import { select } from "d3-selection";
import { PlacedWord, RenderConfig, CloudCallbacks } from "../types";

/**
 * Render placed words into the SVG element.
 * Clears existing content and draws fresh.
 */
export function renderCloud(
    svg: SVGSVGElement,
    words: PlacedWord[],
    cfg: RenderConfig,
    callbacks: CloudCallbacks,
): void {
    const d3svg = select(svg);

    /* Clear previous render */
    d3svg.selectAll("*").remove();

    /* Create word groups */
    const groups = d3svg
        .selectAll<SVGTextElement, PlacedWord>("text")
        .data(words)
        .enter()
        .append("text")
        .attr("class", "tcloud-word")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotation})`)
        .attr("font-size", d => `${d.fontSize}px`)
        .attr("font-family", cfg.word.fontFamily)
        .attr("font-weight", cfg.word.fontWeight)
        .attr("fill", d => d.color)
        .attr("data-word", d => d.text)
        .text(d => d.text);

    /* Interaction handlers */
    groups
        .on("click", (e: MouseEvent, d: PlacedWord) => {
            callbacks.onClick(d, e);
        })
        .on("mouseover", (e: MouseEvent, d: PlacedWord) => {
            const rect = svg.getBoundingClientRect();
            callbacks.onMouseOver(d, e.clientX - rect.left, e.clientY - rect.top, e);
        })
        .on("mousemove", (e: MouseEvent, d: PlacedWord) => {
            const rect = svg.getBoundingClientRect();
            callbacks.onMouseMove(d, e.clientX - rect.left, e.clientY - rect.top, e);
        })
        .on("mouseout", () => {
            callbacks.onMouseOut();
        });
}

/**
 * Apply selection dimming styles to word elements.
 * If selectedIds is empty, all words are shown at full opacity.
 */
export function applySelectionStyles(
    svg: SVGSVGElement,
    selectedIds: Set<string>,
    cfg: RenderConfig,
): void {
    const d3svg = select(svg);
    const hasSelection = selectedIds.size > 0;

    d3svg.selectAll<SVGTextElement, PlacedWord>(".tcloud-word")
        .classed("tcloud-word-dimmed", d => hasSelection && !selectedIds.has(JSON.stringify(d.selectionId)))
        .attr("fill", d => {
            if (hasSelection && selectedIds.has(JSON.stringify(d.selectionId))) {
                return cfg.color.selectedColor;
            }
            return d.color;
        });
}
