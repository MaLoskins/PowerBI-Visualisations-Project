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
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import DataViewTable = powerbi.DataViewTable;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

import { VisualFormattingSettingsModel, buildRenderConfig } from "./settings";
import type { RenderConfig, GaugeData, GaugeLayout, GaugeCallbacks } from "./types";
import { CSS_PREFIX } from "./constants";

import { resolveColumns } from "./model/columns";
import { parseGaugeData } from "./model/parser";
import type { ParseResult } from "./model/parser";
import { computeGaugeLayout, renderGauge } from "./render/gauge";
import { renderLabels } from "./render/labels";
import { applySelectionStyles, handleGaugeClick } from "./interactions/selection";
import { el, svgEl } from "./utils/dom";
import { formatValue, formatMinMax } from "./utils/format";

/* ═══════════════════════════════════════════════
   Visual Class
   ═══════════════════════════════════════════════ */

export class Visual implements IVisual {
    /* ── Power BI services ── */
    private host: IVisualHost;
    private selectionManager: ISelectionManager;
    private events: IVisualEventService;
    private formattingSettingsService: FormattingSettingsService;
    private formattingSettings: VisualFormattingSettingsModel;

    /* ── DOM elements (created once in constructor) ── */
    private container: HTMLDivElement;
    private svg: SVGSVGElement;
    private errorOverlay: HTMLDivElement;
    private errorMessage: HTMLParagraphElement;
    private landingPage: HTMLDivElement;

    /* ── State ── */
    private gaugeData: GaugeData | null;
    private renderConfig: RenderConfig;
    private hasRenderedOnce: boolean;
    private locale: string;
    private isHighContrast: boolean;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.selectionManager = this.host.createSelectionManager();
        this.events = this.host.eventService;
        this.formattingSettingsService = new FormattingSettingsService();
        this.formattingSettings = new VisualFormattingSettingsModel();
        this.renderConfig = buildRenderConfig(this.formattingSettings);
        this.gaugeData = null;
        this.hasRenderedOnce = false;
        this.isHighContrast = false;
        this.locale = (this.host as unknown as Record<string, unknown>).locale as string ?? "en-US";

        /* ── Build DOM skeleton (V1) ── */
        const target = options.element;

        this.container = el("div", "container", target);

        this.svg = svgEl("svg", this.container);
        this.svg.setAttribute("class", CSS_PREFIX + "svg");
        this.svg.setAttribute("role", "img");
        this.svg.setAttribute("aria-label", "Gauge visualization");
        this.svg.style.width = "100%";
        this.svg.style.height = "100%";

        this.errorOverlay = el("div", "error", this.container);
        this.errorOverlay.style.display = "none";
        this.errorMessage = el("p", "error-msg", this.errorOverlay);

        /* ── Landing page (shown when no data) ── */
        this.landingPage = el("div", "landing", this.container);
        this.landingPage.style.display = "none";
        const landingIcon = this.buildLandingIcon();
        this.landingPage.appendChild(landingIcon);
        const landingText = el("p", "landing-text", this.landingPage);
        landingText.textContent = "Add a Value measure to display the gauge";

        /* ── Background click to deselect ── */
        this.container.addEventListener("click", (e: MouseEvent) => {
            if (e.target === this.container || e.target === this.svg) {
                this.selectionManager.clear();
                applySelectionStyles(this.svg, false, false);
            }
        });

        /* ── Context menu (right-click) ── */
        this.container.addEventListener("contextmenu", (e: MouseEvent) => {
            const dataPoint = this.gaugeData?.selectionId ?? null;
            this.selectionManager.showContextMenu(
                dataPoint as powerbi.visuals.ISelectionId,
                { x: e.clientX, y: e.clientY },
            );
            e.preventDefault();
        });

        /* ── Keyboard support ── */
        this.container.setAttribute("tabindex", "0");
        this.container.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
                if (this.gaugeData?.selectionId) {
                    this.selectionManager.select(
                        this.gaugeData.selectionId as powerbi.visuals.ISelectionId,
                        false,
                    );
                }
                e.preventDefault();
            } else if (e.key === "Escape") {
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
        /* ── Signal render start ── */
        this.events.renderingStarted(options);

        try {
            /* ── High contrast detection ── */
            const colorPalette = this.host.colorPalette as unknown as Record<string, unknown>;
            this.isHighContrast = !!(colorPalette && colorPalette["isHighContrast"]);

            /* ── Update-type gating ── */
            const updateType = options.type ?? 0;
            const hasData = (updateType & 2) !== 0;       // VisualUpdateType.Data = 2
            const isResize = (updateType & (4 | 16)) !== 0; // Resize = 4, ResizeEnd = 16

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
                this.showLandingPage();
                this.events.renderingFinished(options);
                return;
            }
            this.hideLandingPage();
            this.hideError();

            /* ── Render ── */
            this.layoutAndRender();
            this.hasRenderedOnce = true;

            /* ── Signal render complete ── */
            this.events.renderingFinished(options);

        } catch (err) {
            console.error("AdvancedGauge update error:", err);
            this.showError("An unexpected error occurred.");
            this.events.renderingFailed(options);
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

        /* ── Update accessibility label ── */
        const ariaLabel = `Gauge: ${data.value}` +
            (data.target !== null ? `, Target: ${data.target}` : "") +
            `, Range: ${data.minValue} to ${data.maxValue}`;
        this.svg.setAttribute("aria-label", ariaLabel);

        /* ── Callbacks object for render functions (V3) ── */
        const allowInteractions = (this.host as unknown as Record<string, unknown>).allowInteractions !== false;
        const callbacks: GaugeCallbacks = {
            onClick: (e: MouseEvent) => {
                if (!allowInteractions) return;
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
        const cfg = this.renderConfig;

        const formattedValue = formatValue(
            data.value,
            cfg.labels.valueFormat,
            data.minValue,
            data.maxValue,
            data.valueFormatString,
            this.locale,
        );

        items.push({
            displayName: "Value",
            value: formattedValue,
        });

        if (data.target !== null) {
            items.push({
                displayName: "Target",
                value: formatMinMax(data.target, this.locale),
            });
        }

        items.push({
            displayName: "Min",
            value: formatMinMax(data.minValue, this.locale),
        });

        items.push({
            displayName: "Max",
            value: formatMinMax(data.maxValue, this.locale),
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
        this.landingPage.style.display = "none";
        this.errorOverlay.style.display = "flex";
        this.errorMessage.textContent = msg;
    }

    private hideError(): void {
        this.errorOverlay.style.display = "none";
    }

    /* ═══════════════════════════════════════════════
       Landing Page
       ═══════════════════════════════════════════════ */

    private showLandingPage(): void {
        this.svg.style.display = "none";
        this.errorOverlay.style.display = "none";
        this.landingPage.style.display = "flex";
    }

    private hideLandingPage(): void {
        this.landingPage.style.display = "none";
        this.svg.style.display = "";
    }

    /* ═══════════════════════════════════════════════
       Landing Page Icon (built via DOM API)
       ═══════════════════════════════════════════════ */

    private buildLandingIcon(): SVGSVGElement {
        const NS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(NS, "svg");
        svg.setAttribute("width", "48");
        svg.setAttribute("height", "48");
        svg.setAttribute("viewBox", "0 0 48 48");
        svg.setAttribute("fill", "none");

        const ring = document.createElementNS(NS, "circle");
        ring.setAttribute("cx", "24");
        ring.setAttribute("cy", "24");
        ring.setAttribute("r", "20");
        ring.setAttribute("stroke", "#CBD5E1");
        ring.setAttribute("stroke-width", "2.5");
        ring.setAttribute("fill", "none");
        svg.appendChild(ring);

        const needle = document.createElementNS(NS, "path");
        needle.setAttribute("d", "M14 34 L24 8 L34 34");
        needle.setAttribute("stroke", "#94A3B8");
        needle.setAttribute("stroke-width", "2");
        needle.setAttribute("fill", "none");
        needle.setAttribute("stroke-linecap", "round");
        needle.setAttribute("stroke-linejoin", "round");
        svg.appendChild(needle);

        const pivot = document.createElementNS(NS, "circle");
        pivot.setAttribute("cx", "24");
        pivot.setAttribute("cy", "24");
        pivot.setAttribute("r", "3");
        pivot.setAttribute("fill", "#94A3B8");
        svg.appendChild(pivot);

        return svg;
    }

    /* ═══════════════════════════════════════════════
       Formatting Pane
       ═══════════════════════════════════════════════ */

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}
