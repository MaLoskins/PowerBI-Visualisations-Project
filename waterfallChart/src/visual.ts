/* ═══════════════════════════════════════════════
   WaterfallChart - Visual Orchestrator
   DOM scaffolding, data pipeline, render dispatch
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { select } from "d3-selection";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

import { VisualFormattingSettingsModel, buildRenderConfig } from "./settings";
import { RenderConfig, WaterfallBar, WaterfallRawItem, ChartCallbacks } from "./types";
import { resolveColumns, hasRequiredColumns } from "./model/columns";
import { parseRows } from "./model/parser";
import { computeWaterfallBars, computeValueDomain } from "./model/waterfall";
import { buildScales, renderXAxis, renderYAxis, renderGridlines, renderBaseline } from "./render/axes";
import { renderBars } from "./render/chart";
import { renderConnectors } from "./render/connectors";
import { renderValueLabels, renderRunningTotalLabels } from "./render/labels";
import { renderLegend } from "./render/legend";
import { applySelectionStyles, buildSelectedKeySet } from "./interactions/selection";
import { CSS_PREFIX, CHART_MARGINS, LEGEND_HEIGHT } from "./constants";
import { el } from "./utils/dom";
import { formatValue, formatPercent } from "./utils/format";

/* ═══════════════════════════════════════════════
   Visual Class
   ═══════════════════════════════════════════════ */

export class Visual implements IVisual {
    /* ── Power BI services ── */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Power BI SDK host typing workaround
    private host: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Power BI SDK selection manager
    private selectionManager: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Power BI SDK tooltip service
    private tooltipService: any;
    private formattingSettingsService!: FormattingSettingsService;
    private formattingSettings!: VisualFormattingSettingsModel;

    /* ── DOM skeleton (created once in constructor) ── */
    private container!: HTMLDivElement;
    private legendTopEl!: HTMLDivElement;
    private legendBottomEl!: HTMLDivElement;
    private svgRoot!: SVGSVGElement;
    private plotArea!: SVGGElement;
    private gridlineGroup!: SVGGElement;
    private baselineGroup!: SVGGElement;
    private connectorGroup!: SVGGElement;
    private barGroup!: SVGGElement;
    private valueLabelGroup!: SVGGElement;
    private runningLabelGroup!: SVGGElement;
    private xAxisGroup!: SVGGElement;
    private yAxisGroup!: SVGGElement;
    private errorOverlay!: HTMLDivElement;

    /* ── State ── */
    private bars: WaterfallBar[] = [];
    private cfg!: RenderConfig;
    private hasRenderedOnce = false;

    constructor(options: VisualConstructorOptions | undefined) {
        if (!options) return;
        this.host = options.host;
        this.selectionManager = this.host.createSelectionManager();
        this.tooltipService = this.host.tooltipService;
        this.formattingSettingsService = new FormattingSettingsService();

        /* ── Build entire DOM skeleton once ── */
        const target = options.element;
        this.container = el("div", "container", target);

        /* Legend top */
        this.legendTopEl = el("div", "legend-top", this.container);

        /* SVG */
        this.svgRoot = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svgRoot.setAttribute("class", `${CSS_PREFIX}svg`);
        this.container.appendChild(this.svgRoot);

        const svg = select(this.svgRoot);
        this.plotArea = svg.append("g").attr("class", `${CSS_PREFIX}plot`).node()!;

        const plot = select(this.plotArea);
        this.gridlineGroup = plot.append("g").attr("class", `${CSS_PREFIX}gridlines`).node()!;
        this.baselineGroup = plot.append("g").attr("class", `${CSS_PREFIX}baselines`).node()!;
        this.connectorGroup = plot.append("g").attr("class", `${CSS_PREFIX}connectors`).node()!;
        this.barGroup = plot.append("g").attr("class", `${CSS_PREFIX}bars`).node()!;
        this.valueLabelGroup = plot.append("g").attr("class", `${CSS_PREFIX}value-labels`).node()!;
        this.runningLabelGroup = plot.append("g").attr("class", `${CSS_PREFIX}running-labels`).node()!;
        this.xAxisGroup = plot.append("g").attr("class", `${CSS_PREFIX}x-axis`).node()!;
        this.yAxisGroup = plot.append("g").attr("class", `${CSS_PREFIX}y-axis`).node()!;

        /* Legend bottom */
        this.legendBottomEl = el("div", "legend-bottom", this.container);

        /* Error overlay */
        this.errorOverlay = el("div", "error", this.container);
        this.errorOverlay.style.display = "none";

        /* Background click clears selection */
        this.svgRoot.addEventListener("click", () => {
            this.selectionManager.clear();
            this.applySelection();
        });
    }

    /* ═══════════════════════════════════════════════
       update() - main entry point
       ═══════════════════════════════════════════════ */

    public update(options: VisualUpdateOptions): void {
        try {
            /* ── Gate on update type (W11) ── */
            const updateType = options.type ?? 0;
            const hasData = (updateType & 2) !== 0;
            const isResizeOnly = !hasData && (updateType & (4 | 16)) !== 0;

            /* ── Always rebuild RenderConfig (cheap) ── */
            const dv = options.dataViews?.[0];
            if (dv) {
                this.formattingSettings = this.formattingSettingsService
                    .populateFormattingSettingsModel(VisualFormattingSettingsModel, dv);
            }
            this.cfg = this.formattingSettings
                ? buildRenderConfig(this.formattingSettings)
                : this.cfg;

            if (!this.cfg) return;

            /* ── Data pipeline (skip on resize-only) ── */
            if (!isResizeOnly || !this.hasRenderedOnce) {
                const table = dv?.table;
                if (!table) {
                    this.bars = [];
                    this.showError("No data.\nAdd Category and Value fields.");
                    return;
                }

                const colIndex = resolveColumns(table);
                if (!hasRequiredColumns(colIndex)) {
                    this.bars = [];
                    this.showError("Required fields missing.\nAdd at least a Category and a Value field.");
                    return;
                }

                this.hideError();
                const rawItems: WaterfallRawItem[] = parseRows(table, colIndex, this.host);
                this.bars = computeWaterfallBars(rawItems, this.cfg.summary);
            }

            if (this.bars.length === 0 && this.hasRenderedOnce) {
                this.showError("No data to display.");
                return;
            }

            this.hideError();
            this.layoutAndRender(options.viewport);
            this.hasRenderedOnce = true;
        } catch (err) {
            console.error("WaterfallChart update error:", err);
            this.showError("An unexpected error occurred.");
        }
    }

    /* ═══════════════════════════════════════════════
       Layout & Render
       ═══════════════════════════════════════════════ */

    private layoutAndRender(viewport: powerbi.IViewport): void {
        const cfg = this.cfg;
        const width = viewport.width;
        const height = viewport.height;

        /* ── Container sizing ── */
        this.container.style.width = width + "px";
        this.container.style.height = height + "px";

        /* ── Legend space ── */
        const legendHeight = cfg.legend.showLegend ? LEGEND_HEIGHT : 0;
        const isLegendTop = cfg.legend.legendPosition === "top";

        const topLegendH = isLegendTop ? legendHeight : 0;
        const bottomLegendH = isLegendTop ? 0 : legendHeight;

        renderLegend(
            isLegendTop ? this.legendTopEl : this.legendBottomEl,
            this.bars,
            cfg,
        );
        /* Hide the unused legend container */
        (isLegendTop ? this.legendBottomEl : this.legendTopEl).style.display = "none";

        /* ── SVG sizing ── */
        const svgWidth = width;
        const svgHeight = height - topLegendH - bottomLegendH;
        this.svgRoot.setAttribute("width", String(svgWidth));
        this.svgRoot.setAttribute("height", String(Math.max(0, svgHeight)));

        /* ── Margins ── */
        const isVertical = cfg.chart.orientation === "vertical";
        const xAxisSpace = cfg.axis.showXAxis ? computeXAxisHeight(cfg) : 0;
        const yAxisSpace = cfg.axis.showYAxis ? 50 : 0;

        const marginTop = CHART_MARGINS.top;
        const marginRight = CHART_MARGINS.right;
        const marginBottom = CHART_MARGINS.bottom + xAxisSpace;
        const marginLeft = CHART_MARGINS.left + yAxisSpace;

        const mTop = isVertical ? marginTop : marginTop;
        const mRight = isVertical ? marginRight : marginRight + xAxisSpace;
        const mBottom = isVertical ? marginBottom : CHART_MARGINS.bottom;
        const mLeft = isVertical ? marginLeft : marginLeft;

        const plotWidth = Math.max(0, svgWidth - mLeft - mRight);
        const plotHeight = Math.max(0, svgHeight - mTop - mBottom);

        select(this.plotArea).attr("transform", `translate(${mLeft},${mTop})`);

        /* ── Scales ── */
        const valueDomain = computeValueDomain(this.bars);
        const scales = buildScales(this.bars, valueDomain, plotWidth, plotHeight, cfg);

        /* ── Render layers ── */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- d3 Selection generics workaround
        const gGrid = select(this.gridlineGroup) as any;
        const gBase = select(this.baselineGroup) as any;
        const gConn = select(this.connectorGroup) as any;
        const gBars = select(this.barGroup) as any;
        const gVLabels = select(this.valueLabelGroup) as any;
        const gRLabels = select(this.runningLabelGroup) as any;
        const gXAxis = select(this.xAxisGroup) as any;
        const gYAxis = select(this.yAxisGroup) as any;

        renderGridlines(gGrid, scales, plotWidth, plotHeight, cfg);
        renderBaseline(gBase, scales, plotWidth, plotHeight, cfg);
        renderConnectors(gConn, this.bars, scales, cfg);
        renderBars(gBars, this.bars, scales, cfg, this.buildCallbacks());
        renderValueLabels(gVLabels, this.bars, scales, cfg);
        renderRunningTotalLabels(gRLabels, this.bars, scales, cfg);
        renderXAxis(gXAxis, scales, plotHeight, cfg);
        renderYAxis(gYAxis, scales, cfg);

        /* ── Re-apply selection styles ── */
        this.applySelection();
    }

    /* ═══════════════════════════════════════════════
       Interaction Callbacks
       ═══════════════════════════════════════════════ */

    private buildCallbacks(): ChartCallbacks {
        return {
            onBarClick: (bar, event) => {
                if (!bar.selectionId) return;
                const multiSelect = event.ctrlKey || event.metaKey;
                this.selectionManager.select(bar.selectionId, multiSelect);
                this.applySelection();
            },
            onBackgroundClick: () => {
                this.selectionManager.clear();
                this.applySelection();
            },
            onBarMouseOver: (bar, event) => {
                this.showTooltip(bar, event);
            },
            onBarMouseMove: (bar, event) => {
                this.showTooltip(bar, event);
            },
            onBarMouseOut: () => {
                this.tooltipService.hide({ immediately: true, isTouchEvent: false });
            },
        };
    }

    private applySelection(): void {
        const selectedKeys = buildSelectedKeySet(this.bars, this.selectionManager);
        applySelectionStyles(this.svgRoot, selectedKeys, this.bars, this.cfg.colors.selectedColor);
    }

    /* ── Tooltips ── */

    private showTooltip(bar: WaterfallBar, event: MouseEvent): void {
        const items: VisualTooltipDataItem[] = [
            { displayName: "Category", value: bar.category },
            {
                displayName: bar.barType === "total" || bar.barType === "start" ? "Total" : "Change",
                value: formatValue(bar.value, this.cfg.labels.valueFormat, this.cfg.labels.showPlusMinus && bar.barType !== "total" && bar.barType !== "start"),
            },
            { displayName: "Running Total", value: formatValue(bar.runningTotal, this.cfg.labels.valueFormat, false) },
        ];

        if (bar.pctChangeFromPrevious != null) {
            items.push({
                displayName: "% Change",
                value: formatPercent(bar.pctChangeFromPrevious),
            });
        }

        for (const extra of bar.tooltipExtras) {
            items.push({ displayName: extra.displayName, value: extra.value });
        }

        this.tooltipService.show({
            dataItems: items,
            identities: bar.selectionId ? [bar.selectionId] : [],
            coordinates: [event.clientX, event.clientY],
            isTouchEvent: false,
        });
    }

    /* ═══════════════════════════════════════════════
       Error Overlay
       ═══════════════════════════════════════════════ */

    private showError(msg: string): void {
        this.errorOverlay.style.display = "flex";
        this.errorOverlay.textContent = msg;
        this.svgRoot.style.display = "none";
        this.legendTopEl.style.display = "none";
        this.legendBottomEl.style.display = "none";
    }

    private hideError(): void {
        this.errorOverlay.style.display = "none";
        this.svgRoot.style.display = "";
    }

    /* ═══════════════════════════════════════════════
       Formatting Model
       ═══════════════════════════════════════════════ */

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}

/* ── Helpers ── */

function computeXAxisHeight(cfg: RenderConfig): number {
    const rotation = parseInt(cfg.axis.xLabelRotation, 10);
    if (rotation >= 90) return 60;
    if (rotation >= 45) return 40;
    return 20;
}
