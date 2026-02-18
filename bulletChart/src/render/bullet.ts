/*
 *  Bullet Chart – Power BI Custom Visual
 *  src/render/bullet.ts
 *
 *  Renders bullet chart items (ranges, actual bar, target marker) into SVG.
 */
"use strict";

import { BulletItem, RenderConfig, BulletCallbacks } from "../types";
import { resolveActualBarColor } from "../utils/color";
import { SVG_NS } from "../utils/dom";

/* ═══════════════════════════════════════════════
   Horizontal Rendering
   ═══════════════════════════════════════════════ */

/** Render all bullet rows in horizontal orientation. */
export function renderBulletsHorizontal(
    svg: SVGSVGElement,
    items: BulletItem[],
    globalMax: number,
    chartWidth: number,
    cfg: RenderConfig,
    callbacks: BulletCallbacks,
): void {
    const { bulletHeight, bulletSpacing } = cfg.layout;
    const barHeightFrac = cfg.bar.actualBarHeightFrac;
    const targetHeightFrac = cfg.target.targetHeightFrac;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const yOffset = i * (bulletHeight + bulletSpacing);
        const scaleMax = globalMax > 0 ? globalMax : 1;
        const scale = (v: number) => (v / scaleMax) * chartWidth;

        const group = document.createElementNS(SVG_NS, "g");
        group.setAttribute("class", "bullet-row");
        group.setAttribute("data-row", String(i));
        group.setAttribute("transform", `translate(0, ${yOffset})`);

        /* ── Qualitative ranges: drawn back-to-front (widest first) ── */
        const rangePairs: [number | null, string][] = [
            [item.range3, cfg.range.range3Color],
            [item.range2, cfg.range.range2Color],
            [item.range1, cfg.range.range1Color],
        ];
        for (const [val, fill] of rangePairs) {
            if (val !== null && val > 0) {
                const rect = document.createElementNS(SVG_NS, "rect");
                rect.setAttribute("class", "bullet-range");
                rect.setAttribute("x", "0");
                rect.setAttribute("y", "0");
                rect.setAttribute("width", String(Math.max(0, scale(val))));
                rect.setAttribute("height", String(bulletHeight));
                rect.setAttribute("rx", String(cfg.range.rangeCornerRadius));
                rect.setAttribute("fill", fill);
                group.appendChild(rect);
            }
        }

        /* ── Actual bar ── */
        const barH = bulletHeight * barHeightFrac;
        const barY = (bulletHeight - barH) / 2;
        const barColor = resolveActualBarColor(
            item.actual,
            item.target,
            cfg.color.conditionalColoring,
            cfg.color.aboveTargetColor,
            cfg.color.belowTargetColor,
            cfg.bar.actualBarColor,
        );

        const barRect = document.createElementNS(SVG_NS, "rect");
        barRect.setAttribute("class", "bullet-actual");
        barRect.setAttribute("x", "0");
        barRect.setAttribute("y", String(barY));
        barRect.setAttribute("width", String(Math.max(0, scale(item.actual))));
        barRect.setAttribute("height", String(barH));
        barRect.setAttribute("rx", String(cfg.bar.actualBarCornerRadius));
        barRect.setAttribute("fill", barColor);
        group.appendChild(barRect);

        /* ── Target marker ── */
        if (cfg.target.showTarget && item.target !== null) {
            const tx = scale(item.target);
            const lineH = bulletHeight * targetHeightFrac;
            const lineY = (bulletHeight - lineH) / 2;
            const line = document.createElementNS(SVG_NS, "line");
            line.setAttribute("class", "bullet-target");
            line.setAttribute("x1", String(tx));
            line.setAttribute("x2", String(tx));
            line.setAttribute("y1", String(lineY));
            line.setAttribute("y2", String(lineY + lineH));
            line.setAttribute("stroke", cfg.target.targetColor);
            line.setAttribute("stroke-width", String(cfg.target.targetWidth));
            group.appendChild(line);
        }

        /* ── Interaction hit area ── */
        const hitArea = document.createElementNS(SVG_NS, "rect");
        hitArea.setAttribute("class", "bullet-hit");
        hitArea.setAttribute("x", "0");
        hitArea.setAttribute("y", "0");
        hitArea.setAttribute("width", String(chartWidth));
        hitArea.setAttribute("height", String(bulletHeight));
        hitArea.setAttribute("fill", "transparent");
        hitArea.style.cursor = "pointer";
        hitArea.addEventListener("click", (e: MouseEvent) => callbacks.onClick(item, e));
        hitArea.addEventListener("mouseover", (e: MouseEvent) => {
            const rect = (e.target as SVGElement).getBoundingClientRect();
            callbacks.onMouseOver(item, e.clientX, rect.top);
        });
        hitArea.addEventListener("mousemove", (e: MouseEvent) => {
            callbacks.onMouseMove(item, e.clientX, e.clientY);
        });
        hitArea.addEventListener("mouseout", () => callbacks.onMouseOut());
        group.appendChild(hitArea);

        svg.appendChild(group);
    }
}

/* ═══════════════════════════════════════════════
   Vertical Rendering
   ═══════════════════════════════════════════════ */

/** Render all bullet columns in vertical orientation. */
export function renderBulletsVertical(
    svg: SVGSVGElement,
    items: BulletItem[],
    globalMax: number,
    chartHeight: number,
    cfg: RenderConfig,
    callbacks: BulletCallbacks,
): void {
    const { bulletHeight: bulletWidth, bulletSpacing } = cfg.layout;
    const barWidthFrac = cfg.bar.actualBarHeightFrac;
    const targetWidthFrac = cfg.target.targetHeightFrac;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const xOffset = i * (bulletWidth + bulletSpacing);
        const scaleMax = globalMax > 0 ? globalMax : 1;
        const scale = (v: number) => (v / scaleMax) * chartHeight;

        const group = document.createElementNS(SVG_NS, "g");
        group.setAttribute("class", "bullet-row");
        group.setAttribute("data-row", String(i));
        group.setAttribute("transform", `translate(${xOffset}, 0)`);

        /* ── Qualitative ranges (bars grow upward from bottom) ── */
        const rangePairs: [number | null, string][] = [
            [item.range3, cfg.range.range3Color],
            [item.range2, cfg.range.range2Color],
            [item.range1, cfg.range.range1Color],
        ];
        for (const [val, fill] of rangePairs) {
            if (val !== null && val > 0) {
                const h = Math.max(0, scale(val));
                const rect = document.createElementNS(SVG_NS, "rect");
                rect.setAttribute("class", "bullet-range");
                rect.setAttribute("x", "0");
                rect.setAttribute("y", String(chartHeight - h));
                rect.setAttribute("width", String(bulletWidth));
                rect.setAttribute("height", String(h));
                rect.setAttribute("rx", String(cfg.range.rangeCornerRadius));
                rect.setAttribute("fill", fill);
                group.appendChild(rect);
            }
        }

        /* ── Actual bar (vertical, grows upward) ── */
        const barW = bulletWidth * barWidthFrac;
        const barX = (bulletWidth - barW) / 2;
        const barH = Math.max(0, scale(item.actual));
        const barColor = resolveActualBarColor(
            item.actual,
            item.target,
            cfg.color.conditionalColoring,
            cfg.color.aboveTargetColor,
            cfg.color.belowTargetColor,
            cfg.bar.actualBarColor,
        );

        const barRect = document.createElementNS(SVG_NS, "rect");
        barRect.setAttribute("class", "bullet-actual");
        barRect.setAttribute("x", String(barX));
        barRect.setAttribute("y", String(chartHeight - barH));
        barRect.setAttribute("width", String(barW));
        barRect.setAttribute("height", String(barH));
        barRect.setAttribute("rx", String(cfg.bar.actualBarCornerRadius));
        barRect.setAttribute("fill", barColor);
        group.appendChild(barRect);

        /* ── Target marker (horizontal line in vertical mode) ── */
        if (cfg.target.showTarget && item.target !== null) {
            const ty = chartHeight - scale(item.target);
            const lineW = bulletWidth * targetWidthFrac;
            const lineX = (bulletWidth - lineW) / 2;
            const line = document.createElementNS(SVG_NS, "line");
            line.setAttribute("class", "bullet-target");
            line.setAttribute("x1", String(lineX));
            line.setAttribute("x2", String(lineX + lineW));
            line.setAttribute("y1", String(ty));
            line.setAttribute("y2", String(ty));
            line.setAttribute("stroke", cfg.target.targetColor);
            line.setAttribute("stroke-width", String(cfg.target.targetWidth));
            group.appendChild(line);
        }

        /* ── Interaction hit area ── */
        const hitArea = document.createElementNS(SVG_NS, "rect");
        hitArea.setAttribute("class", "bullet-hit");
        hitArea.setAttribute("x", "0");
        hitArea.setAttribute("y", "0");
        hitArea.setAttribute("width", String(bulletWidth));
        hitArea.setAttribute("height", String(chartHeight));
        hitArea.setAttribute("fill", "transparent");
        hitArea.style.cursor = "pointer";
        hitArea.addEventListener("click", (e: MouseEvent) => callbacks.onClick(item, e));
        hitArea.addEventListener("mouseover", (e: MouseEvent) => {
            const rect = (e.target as SVGElement).getBoundingClientRect();
            callbacks.onMouseOver(item, rect.left + bulletWidth / 2, e.clientY);
        });
        hitArea.addEventListener("mousemove", (e: MouseEvent) => {
            callbacks.onMouseMove(item, e.clientX, e.clientY);
        });
        hitArea.addEventListener("mouseout", () => callbacks.onMouseOut());
        group.appendChild(hitArea);

        svg.appendChild(group);
    }
}
