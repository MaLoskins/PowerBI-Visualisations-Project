/* ═══════════════════════════════════════════════
   Zoom Handler
   d3-zoom with axis rescaling on zoom/pan
   ═══════════════════════════════════════════════ */

"use strict";

import { zoom, ZoomBehavior, zoomIdentity, ZoomTransform } from "d3-zoom";
import { select } from "d3-selection";

import { RenderConfig, ChartDimensions } from "../types";
import { ZOOM_SCALE_MIN, ZOOM_SCALE_MAX } from "../constants";
import { NumericScale } from "../render/axes";

export interface ZoomState {
    transform: ZoomTransform;
    behavior: ZoomBehavior<SVGSVGElement, unknown> | null;
}

export interface ZoomCallbacks {
    onZoom: (transform: ZoomTransform) => void;
}

/**
 * Initialise d3-zoom on the SVG element.
 * Zoom rescales the axes rather than transforming content directly.
 */
export function initZoom(
    svgEl: SVGSVGElement,
    cfg: RenderConfig["zoom"],
    dims: ChartDimensions,
    callbacks: ZoomCallbacks,
): ZoomState {
    const state: ZoomState = {
        transform: zoomIdentity,
        behavior: null,
    };

    if (!cfg.enableZoom && !cfg.enablePan) return state;

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
        .scaleExtent([ZOOM_SCALE_MIN, ZOOM_SCALE_MAX])
        .extent([[0, 0], [dims.plotWidth, dims.plotHeight]])
        .translateExtent([
            [-dims.plotWidth * 2, -dims.plotHeight * 2],
            [dims.plotWidth * 3, dims.plotHeight * 3],
        ])
        .filter((event: Event) => {
            // Disable zoom on scroll if zoom disabled, disable drag if pan disabled
            if (event.type === "wheel" && !cfg.enableZoom) return false;
            if ((event.type === "mousedown" || event.type === "touchstart") && !cfg.enablePan) return false;
            // Don't zoom on double-click (reserved for reset)
            if (event.type === "dblclick") return false;
            return true;
        })
        .on("zoom", (event) => {
            state.transform = event.transform;
            callbacks.onZoom(event.transform);
        });

    select<SVGSVGElement, unknown>(svgEl).call(zoomBehavior);
    state.behavior = zoomBehavior;

    return state;
}

/**
 * Apply a zoom transform to rescale axes.
 * Returns new x/y scales reflecting the zoomed domain.
 */
export function applyZoomToScales(
    transform: ZoomTransform,
    xScale: NumericScale,
    yScale: NumericScale,
): { xScaleZoomed: NumericScale; yScaleZoomed: NumericScale } {
    // d3-zoom rescaleX/Y expect continuous scales with invert — cast accordingly
    const xScaleZoomed = transform.rescaleX(
        xScale as Parameters<ZoomTransform["rescaleX"]>[0],
    ) as unknown as NumericScale;
    const yScaleZoomed = transform.rescaleY(
        yScale as Parameters<ZoomTransform["rescaleY"]>[0],
    ) as unknown as NumericScale;
    return { xScaleZoomed, yScaleZoomed };
}

/**
 * Reset zoom to identity transform (immediate, no transition).
 */
export function resetZoom(
    svgEl: SVGSVGElement,
    zoomState: ZoomState,
): void {
    if (!zoomState.behavior) return;
    select<SVGSVGElement, unknown>(svgEl).call(
        zoomState.behavior.transform,
        zoomIdentity,
    );
}
