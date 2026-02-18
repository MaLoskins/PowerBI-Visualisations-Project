/* ═══════════════════════════════════════════════
   Advanced Gauge – Visual Orchestrator
   V1: DOM scaffolding in constructor
   V2: Update-type gating
   V3: Render delegation to modules
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
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

import { VisualFormattingSettingsModel, buildRenderConfig } from "./settings";
import type { RenderConfig, GaugeData, GaugeLayout, GaugeCallbacks } from "./types";
import { ERROR_MISSING_VALUE, CSS_PREFIX } from "./constants";

import { resolveColumns } from "./model/columns";
import { parseGaugeData } from "./model/parser";
import type { ParseResult } from "./model/parser";
import { computeGaugeLayout, renderGauge } from "./render/gauge";
import { renderLabels } from "./render/labels";
import { applySelectionStyles, handleGaugeClick } from "./interactions/selection";
import { el, svgEl } from "./utils/dom";

/* ═══════════════════════════════════════════════
   Visual Class
   ═══════════════════════════════════════════════ */

export class Visual implements IVisual {
    /* ── Power BI services ── */
    private host: IVisualHost;
    private selectionManager: ISelectionManager;
    private formattingSettingsService: FormattingSettingsService;
    private formattingSettings: VisualFormattingSettingsModel;

    /* ── DOM elements (created once in constructor) ── */
    private container: HTMLDivElement;
    private svg: SVGSVGElement;
    private errorOverlay: HTMLDivElement;
    private errorMessage: HTMLParagraphElement;

    /* ── State ── */
    private gaugeData: GaugeData | null;
    private renderConfig: RenderConfig;
    private hasRenderedOnce: boolean;
    private locale: string;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.selectionManager = this.host.createSelectionManager();
        this.formattingSettingsService = new FormattingSettingsService();
        this.formattingSettings = new VisualFormattingSettingsModel();
        this.renderConfig = buildRenderConfig(this.formattingSettings);
        this.gaugeData = null;
        this.hasRenderedOnce = false;
        this.locale = (this.host as unknown as Record<string, unknown>).locale as string ?? "en-US";

        /* ── Build DOM skeleton (V1) ── */
        const target = options.element;

        this.container = el("div", "container", target);

        this.svg = svgEl("svg", this.container);
        this.svg.setAttribute("class", CSS_PREFIX + "svg");
        this.svg.style.width = "100%";
        this.svg.style.height = "100%";

        this.errorOverlay = el("div", "error", this.container);
        this.errorOverlay.style.display = "none";
        this.errorMessage = el("p", "error-msg", this.errorOverlay);

        /* ── Background click to deselect ── */
        this.container.addEventListener("click", (e: MouseEvent) => {
            if (e.target === this.container || e.target === this.svg) {
                this.selectionManager.clear();
                applySelectionStyles(this.svg, false, false);
            }
        });

        /* ── Register selection changed callback ── */
        this.selectionManager.registerOnSelectCallback(() => {
            const hasSelection = this.selectionManager.hasSelection();
            const isSelected = hasSelection; // For a single-value gauge, if there's a selection it's this one
            applySelectionStyles(this.svg, hasSelection, isSelected);
        });
    }

    /* ═══════════════════════════════════════════════
       Update (V2: gated on VisualUpdateType)
       ═══════════════════════════════════════════════ */

    public update(options: VisualUpdateOptions): void {
        try {
            /* ── Update-type gating ── */
            const updateType = options.type ?? 0;
            const hasData = (updateType & 2) !== 0;       // VisualUpdateType.Data = 2
            const isResize = (updateType & (4 | 16)) !== 0; // Resize = 4, ResizeEnd = 16
            const isStyleOnly = !hasData && !isResize && (updateType & 32) !== 0; // Style = 32

            /* ── Always rebuild RenderConfig (cheap operation) ── */
            const dv = options.dataViews?.[0];
            if (dv) {
                this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
                    VisualFormattingSettingsModel,
                    dv,
                );
            }
            this.renderConfig = buildRenderConfig(this.formattingSettings);

            /* ── Data parse (only on data change) ── */
            if (hasData || !this.hasRenderedOnce) {
                this.parseData(dv?.table);
            }

            /* ── Check for required field ── */
            if (!this.gaugeData) {
                this.showError(ERROR_MISSING_VALUE);
                return;
            }
            this.hideError();

            /* ── Render ── */
            this.layoutAndRender();
            this.hasRenderedOnce = true;

        } catch (err) {
            console.error("AdvancedGauge update error:", err);
            this.showError("An unexpected error occurred.");
        }
    }

    /* ═══════════════════════════════════════════════
       Data Pipeline
       ═══════════════════════════════════════════════ */

    private parseData(table: DataViewTable | undefined): void {
        if (!table || !table.columns || !table.rows) {
            this.gaugeData = null;
            return;
        }

        const cols = resolveColumns(table.columns);
        const result: ParseResult = parseGaugeData(
            table.rows as unknown[][],
            table.columns as { displayName?: string; format?: string }[],
            cols,
            (rowIndex: number) => {
                return this.host.createSelectionIdBuilder()
                    .withTable(table, rowIndex)
                    .createSelectionId();
            },
        );

        this.gaugeData = result.data;
    }

    /* ═══════════════════════════════════════════════
       Layout & Render (V3)
       ═══════════════════════════════════════════════ */

    private layoutAndRender(): void {
        if (!this.gaugeData) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        if (width <= 0 || height <= 0) return;

        this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        this.svg.setAttribute("width", String(width));
        this.svg.setAttribute("height", String(height));

        const layout: GaugeLayout = computeGaugeLayout(width, height, this.renderConfig);

        const isFirstRender = !this.hasRenderedOnce;
        const data = this.gaugeData;
        const cfg = this.renderConfig;

        /* ── Callbacks object for render functions (V3) ── */
        const callbacks: GaugeCallbacks = {
            onClick: (e: MouseEvent) => {
                handleGaugeClick(
                    data,
                    e,
                    (id, multi) => this.selectionManager.select(id as powerbi.visuals.ISelectionId, multi),
                    () => this.selectionManager.clear(),
                );
            },
            onMouseOver: (_e: MouseEvent, x: number, y: number) => {
                this.showTooltip(data, x, y);
            },
            onMouseMove: (_e: MouseEvent, x: number, y: number) => {
                this.showTooltip(data, x, y);
            },
            onMouseOut: () => {
                this.host.tooltipService.hide({ immediately: true, isTouchEvent: false });
            },
        };

        /* ── Delegate to render modules ── */
        renderGauge(this.svg, data, layout, cfg, callbacks, isFirstRender);
        renderLabels(this.svg, data, layout, cfg, this.locale);

        /* ── Reapply selection state ── */
        const hasSelection = this.selectionManager.hasSelection();
        applySelectionStyles(this.svg, hasSelection, hasSelection);
    }

    /* ═══════════════════════════════════════════════
       Tooltips
       ═══════════════════════════════════════════════ */

    private showTooltip(data: GaugeData, x: number, y: number): void {
        const items: VisualTooltipDataItem[] = [];

        items.push({
            displayName: "Value",
            value: String(data.value),
        });

        if (data.target !== null) {
            items.push({
                displayName: "Target",
                value: String(data.target),
            });
        }

        items.push({
            displayName: "Min",
            value: String(data.minValue),
        });

        items.push({
            displayName: "Max",
            value: String(data.maxValue),
        });

        /* ── Append tooltip extras ── */
        for (const tf of data.tooltipItems) {
            items.push({
                displayName: tf.displayName,
                value: tf.value,
            });
        }

        this.host.tooltipService.show({
            dataItems: items,
            identities: [],
            coordinates: [x, y],
            isTouchEvent: false,
        });
    }

    /* ═══════════════════════════════════════════════
       Error Overlay
       ═══════════════════════════════════════════════ */

    private showError(msg: string): void {
        this.svg.style.display = "none";
        this.errorOverlay.style.display = "flex";
        this.errorMessage.textContent = msg;
    }

    private hideError(): void {
        this.svg.style.display = "";
        this.errorOverlay.style.display = "none";
    }

    /* ═══════════════════════════════════════════════
       Formatting Pane
       ═══════════════════════════════════════════════ */

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}
