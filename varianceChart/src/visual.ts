/* ═══════════════════════════════════════════════
   visual.ts - Variance Chart entry point / orchestrator
   DOM scaffolding in constructor, data pipeline + render in update()
   ═══════════════════════════════════════════════ */
"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import DataViewTable = powerbi.DataViewTable;
import ITooltipService = powerbi.extensibility.ITooltipService;

import { VisualFormattingSettingsModel, buildRenderConfig } from "./settings";
import { RenderConfig, VarianceItem, ChartCallbacks, ParseResult } from "./types";
import { resolveColumns } from "./model/columns";
import { parseRows } from "./model/parser";
import { renderChart } from "./render/chart";
import { applySelectionStyles, handleClick } from "./interactions/selection";
import { el, clearChildren } from "./utils/dom";
import { formatCompact, formatVariance, formatPercent } from "./utils/format";
import { ERROR_MISSING_FIELDS } from "./constants";

export class Visual implements IVisual {
    /* ── Power BI SDK references ── */
    private host!: IVisualHost;
    private selectionManager!: ISelectionManager;
    private tooltipService!: ITooltipService;
    private formattingSettingsService!: FormattingSettingsService;
    private formattingSettings!: VisualFormattingSettingsModel;

    /* ── DOM elements (created once in constructor) ── */
    private container!: HTMLDivElement;
    private svg!: SVGSVGElement;
    private errorOverlay!: HTMLDivElement;

    /* ── State ── */
    private items: VarianceItem[] = [];
    private renderConfig!: RenderConfig;
    private hasRenderedOnce = false;

    /* ═══════════════════════════════════════════════
       Constructor - Build all DOM once
       ═══════════════════════════════════════════════ */

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.selectionManager = this.host.createSelectionManager();
        this.tooltipService = this.host.tooltipService;
        this.formattingSettingsService = new FormattingSettingsService();

        /* Root container */
        const target = options.element;
        this.container = el("div", "container", target);
        this.container.style.width = "100%";
        this.container.style.height = "100%";
        this.container.style.position = "relative";
        this.container.style.overflow = "hidden";

        /* SVG canvas */
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("class", "variance-svg");
        this.svg.style.width = "100%";
        this.svg.style.height = "100%";
        this.container.appendChild(this.svg);

        /* Error overlay (hidden by default) */
        this.errorOverlay = el("div", "error", this.container);
        this.errorOverlay.style.display = "none";

        /* Clear selection on background click */
        this.selectionManager.registerOnSelectCallback(() => {
            this.applySelection();
        });
    }

    /* ═══════════════════════════════════════════════
       Update - Data pipeline + render orchestration
       ═══════════════════════════════════════════════ */

    public update(options: VisualUpdateOptions): void {
        try {
            /* ── Update type gating ── */
            const updateType = options.type ?? 0;
            const hasData = (updateType & 2) !== 0;
            const isResizeOnly = !hasData && (updateType & (4 | 16)) !== 0;

            /* ── Formatting settings (always rebuild on any update) ── */
            const dataView = options.dataViews?.[0];
            if (dataView) {
                this.formattingSettings = this.formattingSettingsService
                    .populateFormattingSettingsModel(VisualFormattingSettingsModel, dataView);
                this.renderConfig = buildRenderConfig(this.formattingSettings);
            }

            /* ── Data parse (skip on resize-only) ── */
            if (hasData || !this.hasRenderedOnce) {
                this.parseData(dataView);
            }

            /* ── Render ── */
            this.layoutAndRender(options.viewport.width, options.viewport.height);
            this.hasRenderedOnce = true;
        } catch (_err) {
            /* Never throw from update() (Section 13) */
            this.showError("An unexpected error occurred.");
        }
    }

    /* ── Data parsing ── */

    private parseData(dataView: powerbi.DataView | undefined): void {
        if (!dataView?.table) {
            this.items = [];
            this.showError(ERROR_MISSING_FIELDS);
            return;
        }

        const table: DataViewTable = dataView.table;
        const cols = resolveColumns(table.columns);

        if (!cols) {
            this.items = [];
            this.showError(ERROR_MISSING_FIELDS);
            return;
        }

        const result: ParseResult = parseRows(table, cols, this.host);

        if (!result.hasData) {
            this.items = [];
            this.showError(ERROR_MISSING_FIELDS);
            return;
        }

        this.items = result.items;
        this.hideError();
    }

    /* ── Layout and render ── */

    private layoutAndRender(width: number, height: number): void {
        if (this.items.length === 0 || !this.renderConfig) return;

        const callbacks: ChartCallbacks = {
            onClick: (item, e) => this.onBarClick(item, e),
            onMouseOver: (item, e) => this.onTooltipShow(item, e),
            onMouseMove: (item, e) => this.onTooltipMove(item, e),
            onMouseOut: () => this.onTooltipHide(),
        };

        renderChart(this.svg, this.items, this.renderConfig, width, height, callbacks);
        this.applySelection();
    }

    /* ── Selection ── */

    private onBarClick(item: VarianceItem | null, e: MouseEvent): void {
        handleClick(item, e, this.selectionManager);
        this.applySelection();
    }

    private applySelection(): void {
        if (!this.renderConfig) return;
        applySelectionStyles(
            this.svg,
            this.selectionManager,
            this.items,
            this.renderConfig.colors.selectedColor,
        );
    }

    /* ── Tooltips ── */

    private onTooltipShow(item: VarianceItem, e: MouseEvent): void {
        const tooltipItems: powerbi.extensibility.VisualTooltipDataItem[] = [
            { displayName: "Category", value: item.category },
            { displayName: "Actual", value: formatCompact(item.actual) },
            { displayName: "Budget", value: formatCompact(item.budget) },
            { displayName: "Variance", value: formatVariance(item.variance) },
            { displayName: "Variance %", value: formatPercent(item.variancePercent) },
        ];

        /* Append user-defined tooltip extras */
        for (const extra of item.tooltipExtras) {
            tooltipItems.push({ displayName: extra.displayName, value: extra.value });
        }

        this.tooltipService.show({
            dataItems: tooltipItems,
            identities: [item.selectionId],
            coordinates: [e.clientX, e.clientY],
            isTouchEvent: false,
        });
    }

    private onTooltipMove(item: VarianceItem, e: MouseEvent): void {
        this.tooltipService.move({
            dataItems: [],
            identities: [item.selectionId],
            coordinates: [e.clientX, e.clientY],
            isTouchEvent: false,
        });
    }

    private onTooltipHide(): void {
        this.tooltipService.hide({
            immediately: true,
            isTouchEvent: false,
        });
    }

    /* ── Error overlay ── */

    private showError(msg: string): void {
        this.errorOverlay.style.display = "flex";
        this.errorOverlay.textContent = msg;
        this.svg.style.display = "none";
    }

    private hideError(): void {
        this.errorOverlay.style.display = "none";
        this.svg.style.display = "";
    }

    /* ═══════════════════════════════════════════════
       Formatting Model
       ═══════════════════════════════════════════════ */

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}
