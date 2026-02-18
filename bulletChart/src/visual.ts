/*
 *  Bullet Chart – Power BI Custom Visual
 *  src/visual.ts
 *
 *  Entry point / orchestrator. Builds DOM once, delegates to render modules.
 */
"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ITooltipService = powerbi.extensibility.ITooltipService;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

import { VisualFormattingSettingsModel, buildRenderConfig } from "./settings";
import { RenderConfig, BulletItem, BulletCallbacks, ParseResult } from "./types";
import { resolveColumns } from "./model/columns";
import { parseRows } from "./model/parser";
import { renderBulletsHorizontal, renderBulletsVertical } from "./render/bullet";
import { renderHorizontalAxis, renderVerticalAxis, renderVerticalCategoryLabels } from "./render/axis";
import { renderLabelsHorizontal, renderLabelsVertical } from "./render/labels";
import { applySelectionStyles, handleClick } from "./interactions/selection";
import { el, clearChildren, SVG_NS } from "./utils/dom";
import { formatValue, formatPercent } from "./utils/format";
import { AXIS_AREA_SIZE } from "./constants";

/* ═══════════════════════════════════════════════
   Visual Class
   ═══════════════════════════════════════════════ */

export class Visual implements IVisual {
    /* ── Power BI host references ── */
    private host: IVisualHost;
    private selectionManager: ISelectionManager;
    private tooltipService: ITooltipService;
    private formattingSettingsService: FormattingSettingsService;
    private formattingSettings!: VisualFormattingSettingsModel;

    /* ── DOM skeleton (created once in constructor) ── */
    private container: HTMLDivElement;
    private labelColumn: HTMLDivElement;
    private chartWrapper: HTMLDivElement;
    private svg: SVGSVGElement;
    private errorOverlay: HTMLDivElement;

    /* ── State ── */
    private items: BulletItem[] = [];
    private parseResult: ParseResult | null = null;
    private cfg: RenderConfig | null = null;
    private hasRenderedOnce = false;

    /* ═══════════════════════════════════════════════
       Constructor — build all DOM once
       ═══════════════════════════════════════════════ */

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.selectionManager = this.host.createSelectionManager();
        this.tooltipService = this.host.tooltipService;
        this.formattingSettingsService = new FormattingSettingsService();

        /* Root container */
        this.container = el("div", "bullet-container", options.element);

        /* Error overlay (hidden by default) */
        this.errorOverlay = el("div", "bullet-error", this.container);
        this.errorOverlay.style.display = "none";

        /* Category label column (horizontal mode) */
        this.labelColumn = el("div", "bullet-label-column", this.container);

        /* Chart wrapper with SVG */
        this.chartWrapper = el("div", "bullet-chart-wrapper", this.container);
        this.svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
        this.svg.setAttribute("class", "bullet-svg");
        this.chartWrapper.appendChild(this.svg);

        /* Clear selection on background click */
        this.container.addEventListener("click", (e: MouseEvent) => {
            if ((e.target as HTMLElement).classList.contains("bullet-container") ||
                (e.target as HTMLElement).classList.contains("bullet-chart-wrapper")) {
                this.selectionManager.clear();
                this.applySelection();
            }
        });

        /* Register selection change callback */
        this.selectionManager.registerOnSelectCallback(() => {
            this.applySelection();
        });
    }

    /* ═══════════════════════════════════════════════
       Update
       ═══════════════════════════════════════════════ */

    public update(options: VisualUpdateOptions): void {
        try {
            const dv = options.dataViews?.[0];
            if (!dv?.table) {
                this.showError("Required fields missing.\nAdd at least a Category and Actual measure.");
                return;
            }

            /* ── Update type gating (B2) ── */
            const updateType = (options.type as number) ?? 0;
            const hasData = (updateType & 2) !== 0 || !this.hasRenderedOnce;
            const isResizeOnly = !hasData && (updateType & (4 | 16)) !== 0;

            /* ── Populate formatting model ── */
            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
                VisualFormattingSettingsModel,
                dv,
            );
            this.cfg = buildRenderConfig(this.formattingSettings);

            /* ── Parse data (only on data change) ── */
            if (hasData) {
                const table = dv.table;
                const cols = resolveColumns(table);

                if (cols.category < 0 || cols.actual < 0) {
                    this.showError("Required fields missing.\nAdd at least a Category and Actual measure.");
                    return;
                }

                this.parseResult = parseRows(table, cols, this.host);
                this.items = this.parseResult.items;
            }

            if (this.items.length === 0) {
                this.showError("No data to display.\nEnsure your data has values in the Actual field.");
                return;
            }

            this.hideError();
            this.layoutAndRender(options.viewport);
            this.hasRenderedOnce = true;

        } catch (_err) {
            this.showError("An unexpected error occurred.");
        }
    }

    /* ═══════════════════════════════════════════════
       Layout & Render
       ═══════════════════════════════════════════════ */

    private layoutAndRender(viewport: powerbi.IViewport): void {
        if (!this.cfg) return;
        const cfg = this.cfg;
        const items = this.items;

        /* ── Compute global max across all items ── */
        const globalMax = Math.max(...items.map((it) => it.resolvedMax), 0);

        /* ── Clear SVG and label column ── */
        clearChildren(this.svg);
        clearChildren(this.labelColumn);

        if (cfg.layout.orientation === "horizontal") {
            this.renderHorizontal(viewport, items, globalMax, cfg);
        } else {
            this.renderVertical(viewport, items, globalMax, cfg);
        }

        /* ── Apply existing selection state ── */
        this.applySelection();
    }

    /* ── Horizontal layout ── */
    private renderHorizontal(
        viewport: powerbi.IViewport,
        items: BulletItem[],
        globalMax: number,
        cfg: RenderConfig,
    ): void {
        const { bulletHeight, bulletSpacing, categoryWidth, showCategoryLabels } = cfg.layout;
        const axisH = cfg.axis.showAxis ? AXIS_AREA_SIZE : 0;
        const labelW = showCategoryLabels ? categoryWidth : 0;

        const totalBulletH = items.length * bulletHeight + (items.length - 1) * bulletSpacing;
        const totalH = totalBulletH + axisH;
        const chartW = Math.max(0, viewport.width - labelW - 8);

        /* Container layout */
        this.container.style.flexDirection = "row";
        this.labelColumn.style.display = showCategoryLabels ? "flex" : "none";
        this.labelColumn.style.width = labelW + "px";
        this.labelColumn.style.flexDirection = "column";
        this.chartWrapper.style.overflow = totalH > viewport.height ? "auto" : "hidden";

        /* SVG size */
        this.svg.setAttribute("width", String(chartW));
        this.svg.setAttribute("height", String(totalH));

        /* ── Category labels (HTML column) ── */
        if (showCategoryLabels) {
            for (let i = 0; i < items.length; i++) {
                const label = el("div", "bullet-cat-label", this.labelColumn);
                label.textContent = items[i].category;
                label.style.height = bulletHeight + "px";
                label.style.lineHeight = bulletHeight + "px";
                label.style.fontSize = cfg.layout.categoryFontSize + "px";
                label.style.color = cfg.layout.categoryFontColor;
                if (i < items.length - 1) {
                    label.style.marginBottom = bulletSpacing + "px";
                }
            }
        }

        /* ── Axis & gridlines ── */
        renderHorizontalAxis(this.svg, globalMax, chartW, totalBulletH, cfg);

        /* ── Bullets ── */
        renderBulletsHorizontal(this.svg, items, globalMax, chartW, cfg, this.buildCallbacks());

        /* ── Value labels ── */
        renderLabelsHorizontal(this.svg, items, globalMax, chartW, cfg);
    }

    /* ── Vertical layout ── */
    private renderVertical(
        viewport: powerbi.IViewport,
        items: BulletItem[],
        globalMax: number,
        cfg: RenderConfig,
    ): void {
        const { bulletHeight: bulletWidth, bulletSpacing, showCategoryLabels, categoryFontSize } = cfg.layout;
        const axisW = cfg.axis.showAxis ? 40 : 0;
        const catLabelH = showCategoryLabels ? categoryFontSize + 20 : 0;

        const totalBulletW = items.length * bulletWidth + (items.length - 1) * bulletSpacing;
        const chartH = Math.max(0, viewport.height - catLabelH - 8);
        const totalW = totalBulletW + axisW;

        /* Container layout */
        this.container.style.flexDirection = "column";
        this.labelColumn.style.display = "none";
        this.chartWrapper.style.overflow = totalW > viewport.width ? "auto" : "hidden";

        /* SVG size */
        this.svg.setAttribute("width", String(totalW));
        this.svg.setAttribute("height", String(viewport.height));

        /* ── Axis ── */
        renderVerticalAxis(this.svg, globalMax, chartH, totalBulletW, axisW, cfg);

        /* ── Create offset group for bullet content area ── */
        const contentGroup = document.createElementNS(SVG_NS, "g");
        contentGroup.setAttribute("transform", `translate(${axisW}, 0)`);
        this.svg.appendChild(contentGroup);

        /* We need a nested SVG for the bullets to stay inside the group */
        const innerSvg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
        innerSvg.setAttribute("x", String(axisW));
        innerSvg.setAttribute("y", "0");
        innerSvg.setAttribute("width", String(totalBulletW));
        innerSvg.setAttribute("height", String(chartH));
        this.svg.appendChild(innerSvg);

        /* ── Bullets ── */
        renderBulletsVertical(innerSvg, items, globalMax, chartH, cfg, this.buildCallbacks());

        /* ── Value labels ── */
        const labelSvg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
        labelSvg.setAttribute("x", String(axisW));
        labelSvg.setAttribute("y", "0");
        labelSvg.setAttribute("width", String(totalBulletW + 60));
        labelSvg.setAttribute("height", String(viewport.height));
        labelSvg.setAttribute("overflow", "visible");
        this.svg.appendChild(labelSvg);

        renderLabelsVertical(labelSvg, items, globalMax, chartH, cfg);

        /* ── Category labels below ── */
        const catSvg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
        catSvg.setAttribute("x", String(axisW));
        catSvg.setAttribute("y", "0");
        catSvg.setAttribute("width", String(totalBulletW + 20));
        catSvg.setAttribute("height", String(viewport.height));
        catSvg.setAttribute("overflow", "visible");
        this.svg.appendChild(catSvg);
        renderVerticalCategoryLabels(catSvg, items, chartH, cfg);
    }

    /* ═══════════════════════════════════════════════
       Interaction Callbacks
       ═══════════════════════════════════════════════ */

    private buildCallbacks(): BulletCallbacks {
        return {
            onClick: (item: BulletItem, e: MouseEvent) => {
                handleClick(item, e, this.selectionManager);
                this.applySelection();
            },
            onMouseOver: (item: BulletItem, x: number, y: number) => {
                this.showTooltip(item, x, y);
            },
            onMouseMove: (item: BulletItem, x: number, y: number) => {
                this.moveTooltip(item, x, y);
            },
            onMouseOut: () => {
                this.tooltipService.hide({ immediately: true, isTouchEvent: false });
            },
        };
    }

    private applySelection(): void {
        if (!this.cfg) return;
        const selectedIds = (this.selectionManager as unknown as { getSelectionIds(): powerbi.visuals.ISelectionId[] }).getSelectionIds();
        applySelectionStyles(this.svg, this.items, selectedIds ?? [], this.cfg.color.selectedBarColor);
    }

    /* ═══════════════════════════════════════════════
       Tooltips
       ═══════════════════════════════════════════════ */

    private buildTooltipItems(item: BulletItem): VisualTooltipDataItem[] {
        const tips: VisualTooltipDataItem[] = [
            { displayName: "Category", value: item.category },
            { displayName: "Actual", value: formatValue(item.actual) },
        ];
        if (item.target !== null) {
            tips.push({ displayName: "Target", value: formatValue(item.target) });
            tips.push({ displayName: "% of Target", value: formatPercent(item.actual / item.target) });
        }
        if (item.range1 !== null) tips.push({ displayName: "Range 1 (Bad)", value: formatValue(item.range1) });
        if (item.range2 !== null) tips.push({ displayName: "Range 2 (Satisfactory)", value: formatValue(item.range2) });
        if (item.range3 !== null) tips.push({ displayName: "Range 3 (Good)", value: formatValue(item.range3) });
        for (const extra of item.tooltipExtras) {
            tips.push({ displayName: extra.displayName, value: extra.value });
        }
        return tips;
    }

    private showTooltip(item: BulletItem, x: number, y: number): void {
        this.tooltipService.show({
            dataItems: this.buildTooltipItems(item),
            identities: [item.selectionId],
            coordinates: [x, y],
            isTouchEvent: false,
        });
    }

    private moveTooltip(item: BulletItem, x: number, y: number): void {
        this.tooltipService.move({
            dataItems: this.buildTooltipItems(item),
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
        this.labelColumn.style.display = "none";
        this.chartWrapper.style.display = "none";
    }

    private hideError(): void {
        this.errorOverlay.style.display = "none";
        this.chartWrapper.style.display = "flex";
    }

    /* ═══════════════════════════════════════════════
       Formatting Model
       ═══════════════════════════════════════════════ */

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}
