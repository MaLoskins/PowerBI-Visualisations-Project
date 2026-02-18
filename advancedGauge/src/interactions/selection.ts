/* ═══════════════════════════════════════════════
   Advanced Gauge – Selection
   applySelectionStyles(), handleClick()
   ═══════════════════════════════════════════════ */
"use strict";

import type { GaugeData } from "../types";

/**
 * Apply selection visual feedback to the gauge SVG.
 * For a single-value gauge, selection is binary: either the gauge is selected or not.
 * If there's an active selection that doesn't include this gauge, dim it.
 */
export function applySelectionStyles(
    svg: SVGSVGElement,
    hasSelection: boolean,
    isSelected: boolean,
): void {
    if (hasSelection && !isSelected) {
        svg.style.opacity = "0.35";
    } else {
        svg.style.opacity = "1";
    }
}

/**
 * Handle a click on the gauge.
 * If data is present, selects the data point. If already selected, deselects.
 */
export function handleGaugeClick(
    data: GaugeData | null,
    event: MouseEvent,
    select: (id: unknown, multiSelect: boolean) => void,
    clearSelection: () => void,
): void {
    if (!data || !data.selectionId) {
        clearSelection();
        return;
    }

    const multiSelect = event.ctrlKey || event.metaKey;
    select(data.selectionId, multiSelect);
}
