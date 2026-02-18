/* ═══════════════════════════════════════════════
   Linear Gauge – Visual Orchestrator
   Entry point: DOM scaffold, data pipeline, render
   ═══════════════════════════════════════════════ */
"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import * as d3 from "d3-selection";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ITooltipService = powerbi.extensibility.ITooltipService;

import { VisualFormattingSettingsModel, buildRenderConfig } from "./settings";
import { GaugeItem, RenderConfig, GaugeCallbacks, ParseResult } from "./types";
import { ERROR_NO_VALUE } from "./constants";

/* ── Model ── */
import { resolveColumns, hasRequiredColumns } from "./model/columns";
import { parseRows } from "./model/parser";

/* ── Render ── */
import { renderGauges } from "./render/gauge";
import {
    renderValueLabels,
    renderVerticalValueLabels,
    renderTargetLabels,
    renderMinMaxLabels,
    renderCategoryLabelsHTML,
    renderVerticalCategoryLabels,
} from "./render/labels";
import {
    computeRightLabelWidth,
    computeLeftLabelWidth,
    computeMinMaxLabelHeight,
    computeTopLabelHeight,
    computeVerticalCategoryHeight,
} from "./render/axis";

/* ── Interactions ── */
import { handleGaugeClick, handleBackgroundClick, buildSelectedIdSet } from "./interactions/selection";

/* ── Utils ── */
import { el, clearChildren } from "./utils/dom";

export class Visual implements IVisual {
    private host: IVisualHost;
    private selectionManager: ISelectionManager;
    private tooltipService: ITooltipService;
    private formattingSettingsService: FormattingSettingsService;
    private formattingSettings!: VisualFormattingSettingsModel;

    /* ── DOM skeleton (created once in constructor) ── */
    private container: HTMLDivElement;
    private errorOverlay: HTMLDivElement;
    private categoryContainer: HTMLDivElement;
    private svgContainer: HTMLDivElement;
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;

    /* ── State ── */
    private items: GaugeItem[] = [];
    private renderConfig: RenderConfig | null = null;
    private hasRenderedOnce = false;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.selectionManager = this.host.createSelectionManager();
        this.tooltipService = this.host.tooltipService;
        this.formattingSettingsService = new FormattingSettingsService();

        /* ── Build DOM skeleton ── */
        const target = options.element;

        this.container = el("div", "lgauge-container");
        target.appendChild(this.container);

        /* ── Error overlay ── */
        this.errorOverlay = el("div", "lgauge-error");
        this.errorOverlay.style.display = "none";
        this.container.appendChild(this.errorOverlay);

        /* ── Category labels column (horizontal mode) ── */
        this.categoryContainer = el("div", "lgauge-categories");
        this.container.appendChild(this.categoryContainer);

        /* ── SVG container ── */
        this.svgContainer = el("div", "lgauge-svg-wrap");
        this.container.appendChild(this.svgContainer);

        const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgEl.setAttribute("class", "lgauge-svg");
        this.svgContainer.appendChild(svgEl);
        this.svg = d3.select(svgEl);

        /* ── Background click clears selection ── */
        this.container.addEventListener("click", (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target === this.container || target === this.svgContainer || target.tagName === "svg") {
                handleBackgroundClick(this.selectionManager, () => this.applySelection());
            }
        });
    }

    /* ═══════════════════════════════════════════════
       update() — main pipeline entry
       ═══════════════════════════════════════════════ */

    public update(options: VisualUpdateOptions): void {
        try {
            /* ── Gate on update type (G1) ── */
            const updateType = options.type ?? 0;
            const hasData = (updateType & 2) !== 0;
            const isResizeOnly = !hasData && (updateType & (4 | 16)) !== 0;

            /* ── Populate formatting model ── */
            const dv = options.dataViews?.[0];
            if (dv) {
                this.formattingSettings = this.formattingSettingsService
                    .populateFormattingSettingsModel(VisualFormattingSettingsModel, dv);
                this.renderConfig = buildRenderConfig(this.formattingSettings);
            }

            if (!this.renderConfig) return;

            /* ── Data pipeline (skip on resize-only) ── */
            if (hasData || !this.hasRenderedOnce) {
                if (!dv?.table) {
                    this.showError(ERROR_NO_VALUE);
                    return;
                }

                const table = dv.table;
                const cols = resolveColumns(table.columns);

                if (!hasRequiredColumns(cols)) {
                    this.showError(ERROR_NO_VALUE);
                    return;
                }

                this.hideError();
                const result: ParseResult = parseRows(table, cols, this.host);
                this.items = result.items;
            }

            if (isResizeOnly && this.hasRenderedOnce) {
                // Just re-layout
                this.layoutAndRender(options.viewport);
                return;
            }

            this.layoutAndRender(options.viewport);
            this.hasRenderedOnce = true;

        } catch (err) {
            // Never throw from update (E1)
            console.error("linearGauge update error:", err);
        }
    }

    /* ═══════════════════════════════════════════════
       Layout & Render
       ═══════════════════════════════════════════════ */

    private layoutAndRender(viewport: powerbi.IViewport): void {
        if (!this.renderConfig || this.items.length === 0) return;

        const cfg = this.renderConfig;
        const isHorizontal = cfg.layout.orientation === "horizontal";
        const vw = viewport.width;
        const vh = viewport.height;

        this.container.style.width = vw + "px";
        this.container.style.height = vh + "px";

        if (isHorizontal) {
            this.renderHorizontalLayout(vw, vh, cfg);
        } else {
            this.renderVerticalLayout(vw, vh, cfg);
        }

        this.applySelection();
    }

    /* ── Horizontal Layout ── */

    private renderHorizontalLayout(vw: number, vh: number, cfg: RenderConfig): void {
        const items = this.items;

        /* ── Category column ── */
        const catW = cfg.layout.showCategoryLabels ? cfg.layout.categoryWidth : 0;
        renderCategoryLabelsHTML(this.categoryContainer, items, cfg);

        /* ── Compute label margins ── */
        const leftLabelW = computeLeftLabelWidth(items, cfg);
        const rightLabelW = computeRightLabelWidth(items, cfg);
        const topLabelH = computeTopLabelHeight(cfg);
        const bottomLabelH = computeMinMaxLabelHeight(cfg);

        /* ── Bar area dimensions ── */
        const barAreaWidth = Math.max(20, vw - catW - leftLabelW - rightLabelW - 4);
        const totalGaugeHeight = items.length * (cfg.layout.gaugeHeight + cfg.layout.gaugeSpacing) - cfg.layout.gaugeSpacing;
        const svgW = barAreaWidth + leftLabelW + rightLabelW;
        const svgH = Math.max(totalGaugeHeight + topLabelH + bottomLabelH, 20);

        /* ── Position containers ── */
        this.categoryContainer.style.display = cfg.layout.showCategoryLabels ? "block" : "none";
        this.svgContainer.style.display = "block";
        this.svgContainer.style.overflow = "auto";
        this.svgContainer.style.height = vh + "px";

        this.container.style.flexDirection = "row";

        /* ── Size SVG ── */
        this.svg.attr("width", svgW).attr("height", svgH);

        /* ── Clear & re-render ── */
        this.svg.selectAll("*").remove();

        const offsetG = this.svg.append("g")
            .attr("transform", `translate(${leftLabelW},${topLabelH})`);

        const barSvg = offsetG.append("svg")
            .attr("width", barAreaWidth)
            .attr("height", totalGaugeHeight)
            .attr("overflow", "visible") as unknown as d3.Selection<SVGSVGElement, unknown, null, undefined>;

        renderGauges(barSvg, items, cfg, barAreaWidth, 0, this.buildCallbacks(), this.getSelectedIds());

        /* ── Labels ── */
        const labelG = this.svg.append("g")
            .attr("transform", `translate(${leftLabelW},${topLabelH})`);

        const labelSvg = labelG.append("svg")
            .attr("width", svgW)
            .attr("height", svgH)
            .attr("overflow", "visible") as unknown as d3.Selection<SVGSVGElement, unknown, null, undefined>;

        renderValueLabels(labelSvg, items, cfg, barAreaWidth);
        renderTargetLabels(labelSvg, items, cfg, barAreaWidth);
        renderMinMaxLabels(labelSvg, items, cfg, barAreaWidth);
    }

    /* ── Vertical Layout ── */

    private renderVerticalLayout(vw: number, vh: number, cfg: RenderConfig): void {
        const items = this.items;

        this.categoryContainer.style.display = "none";
        this.svgContainer.style.display = "block";
        this.svgContainer.style.overflow = "auto";
        this.svgContainer.style.height = vh + "px";
        this.container.style.flexDirection = "column";

        const catH = computeVerticalCategoryHeight(cfg);
        const topLabelH = computeTopLabelHeight(cfg);
        const barAreaHeight = Math.max(20, vh - catH - topLabelH - 8);
        const totalGaugeWidth = items.length * (cfg.layout.gaugeHeight + cfg.layout.gaugeSpacing) - cfg.layout.gaugeSpacing;
        const svgW = Math.max(totalGaugeWidth, 20);
        const svgH = barAreaHeight + catH + topLabelH;

        this.svg.attr("width", svgW).attr("height", svgH);
        this.svg.selectAll("*").remove();

        const offsetG = this.svg.append("g")
            .attr("transform", `translate(0,${topLabelH})`);

        const barSvg = offsetG.append("svg")
            .attr("width", totalGaugeWidth)
            .attr("height", barAreaHeight)
            .attr("overflow", "visible") as unknown as d3.Selection<SVGSVGElement, unknown, null, undefined>;

        renderGauges(barSvg, items, cfg, 0, barAreaHeight, this.buildCallbacks(), this.getSelectedIds());
        renderVerticalValueLabels(barSvg, items, cfg, barAreaHeight);
        renderVerticalCategoryLabels(barSvg, items, cfg, barAreaHeight);
    }

    /* ═══════════════════════════════════════════════
       Callbacks & Interactions
       ═══════════════════════════════════════════════ */

    private buildCallbacks(): GaugeCallbacks {
        return {
            onClick: (item: GaugeItem, e: MouseEvent) => {
                e.stopPropagation();
                handleGaugeClick(item, e, this.selectionManager, () => this.applySelection());
            },
            onMouseOver: (item: GaugeItem, x: number, y: number) => {
                this.showTooltip(item, x, y);
            },
            onMouseMove: (item: GaugeItem, x: number, y: number) => {
                this.moveTooltip(item, x, y);
            },
            onMouseOut: () => {
                this.tooltipService.hide({ immediately: true, isTouchEvent: false });
            },
        };
    }

    private getSelectedIds(): Set<string> {
        return buildSelectedIdSet(this.selectionManager);
    }

    private applySelection(): void {
        if (!this.renderConfig) return;
        // Re-render gauges with updated selection state
        this.layoutAndRenderFromCache();
    }

    /** Re-render from cached items without re-parsing data */
    private layoutAndRenderFromCache(): void {
        if (!this.renderConfig || this.items.length === 0) return;
        const container = this.container;
        const vw = parseFloat(container.style.width) || 0;
        const vh = parseFloat(container.style.height) || 0;
        if (vw > 0 && vh > 0) {
            this.layoutAndRender({ width: vw, height: vh });
        }
    }

    /* ═══════════════════════════════════════════════
       Tooltips
       ═══════════════════════════════════════════════ */

    private showTooltip(item: GaugeItem, x: number, y: number): void {
        const cfg = this.renderConfig;
        if (!cfg) return;

        const tooltipItems: powerbi.extensibility.VisualTooltipDataItem[] = [];

        tooltipItems.push({ displayName: "Category", value: item.category });
        tooltipItems.push({ displayName: "Value", value: String(item.value) });

        if (item.target != null) {
            tooltipItems.push({ displayName: "Target", value: String(item.target) });
            const pctOfTarget = item.target !== 0 ? ((item.value / item.target) * 100).toFixed(1) + "%" : "N/A";
            tooltipItems.push({ displayName: "% of Target", value: pctOfTarget });
        }

        if (item.target2 != null) {
            tooltipItems.push({ displayName: "Target 2", value: String(item.target2) });
        }

        tooltipItems.push({ displayName: "Min", value: String(item.minValue) });
        tooltipItems.push({ displayName: "Max", value: String(item.maxValue) });

        for (const extra of item.tooltipExtras) {
            tooltipItems.push({ displayName: extra.displayName, value: extra.value });
        }

        this.tooltipService.show({
            dataItems: tooltipItems,
            identities: [item.selectionId],
            coordinates: [x, y],
            isTouchEvent: false,
        });
    }

    private moveTooltip(item: GaugeItem, x: number, y: number): void {
        this.tooltipService.move({
            dataItems: [],
            identities: [item.selectionId],
            coordinates: [x, y],
            isTouchEvent: false,
        });
    }

    /* ═══════════════════════════════════════════════
       Error Overlay
       ═══════════════════════════════════════════════ */

    private showError(msg: string): void {
        this.errorOverlay.textContent = msg;
        this.errorOverlay.style.display = "flex";
        this.svgContainer.style.display = "none";
        this.categoryContainer.style.display = "none";
    }

    private hideError(): void {
        this.errorOverlay.style.display = "none";
    }

    /* ═══════════════════════════════════════════════
       Formatting Model
       ═══════════════════════════════════════════════ */

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}
