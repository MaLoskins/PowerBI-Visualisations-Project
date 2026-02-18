/* ═══════════════════════════════════════════════
   visual.ts – Hierarchical Variance Tree Orchestrator
   Entry point for the Power BI custom visual.
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { select, Selection } from "d3-selection";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ITooltipService = powerbi.extensibility.ITooltipService;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

import { VisualFormattingSettingsModel, buildRenderConfig } from "./settings";
import { RenderConfig, VarianceNode, TreeCallbacks } from "./types";
import { resolveColumns } from "./model/columns";
import { parseLeafRows } from "./model/parser";
import { buildHierarchy } from "./model/hierarchy";
import { renderTree } from "./render/tree";
import { applyNodeSelectionStyles } from "./render/node";
import {
    handleNodeClick,
    clearSelection,
    getSelectedNodeIds,
    hasActiveSelection,
} from "./interactions/selection";
import { el, prefixCls } from "./utils/dom";
import { formatFull, formatPercent } from "./utils/format";

type SVGSel = Selection<SVGSVGElement, unknown, null, undefined>;

/* ═══════════════════════════════════════════════
   Visual Class
   ═══════════════════════════════════════════════ */

export class Visual implements IVisual {
    /* ── Power BI services ── */
    private host: IVisualHost;
    private selectionManager: ISelectionManager;
    private tooltipService: ITooltipService;
    private formattingSettingsService: FormattingSettingsService;
    private formattingSettings: VisualFormattingSettingsModel;

    /* ── DOM skeleton (created once in constructor) ── */
    private container: HTMLDivElement;
    private svgHost: HTMLDivElement;
    private svgElement: SVGSVGElement;
    private svgSel: SVGSel;
    private errorOverlay: HTMLDivElement;

    /* ── State ── */
    private root: VarianceNode | null = null;
    private cfg: RenderConfig | null = null;
    private hasRenderedOnce = false;
    private previousStartExpanded: string = "rootOnly";
    private categoryDisplayNames: string[] = [];

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.selectionManager = this.host.createSelectionManager();
        this.tooltipService = this.host.tooltipService;
        this.formattingSettingsService = new FormattingSettingsService();

        /* ── Build DOM skeleton ── */
        this.container = el("div", prefixCls("container"));
        options.element.appendChild(this.container);

        /* Scrollable SVG host */
        this.svgHost = el("div", prefixCls("svg-host"));
        this.container.appendChild(this.svgHost);

        /* SVG element */
        this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svgElement.classList.add(prefixCls("svg"));
        this.svgHost.appendChild(this.svgElement);
        this.svgSel = select(this.svgElement);

        /* Error overlay (hidden by default) */
        this.errorOverlay = el("div", prefixCls("error"));
        this.errorOverlay.style.display = "none";
        this.container.appendChild(this.errorOverlay);

        /* ── Register selection callback for cross-visual filtering ── */
        this.selectionManager.registerOnSelectCallback(() => {
            this.applySelection();
        });
    }

    /* ═══════════════════════════════════════════════
       Update — main entry point called by Power BI
       ═══════════════════════════════════════════════ */

    public update(options: VisualUpdateOptions): void {
        try {
            /* ── Populate formatting settings ── */
            this.formattingSettings = this.formattingSettingsService
                .populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews?.[0]);

            this.cfg = buildRenderConfig(this.formattingSettings);

            /* ── Update-type gating (V1) ── */
            const updateType = options.type ?? 0;
            const hasData = (updateType & 2) !== 0;
            const isResizeOnly = !hasData && (updateType & (4 | 16)) !== 0;

            if (isResizeOnly && this.hasRenderedOnce && this.root) {
                this.renderAll();
                return;
            }

            /* ── Validate data view ── */
            const dataView = options.dataViews?.[0];
            const table = dataView?.table;

            if (!table || !table.rows || table.rows.length === 0) {
                this.showError("Required fields missing.\nAdd Category, Actual, and Budget fields.");
                return;
            }

            /* ── Resolve columns ── */
            const cols = resolveColumns(table.columns);
            if (!cols) {
                this.showError(
                    "Required fields missing.\nAdd at least one Category field, plus Actual and Budget measures.",
                );
                return;
            }

            this.hideError();

            /* ── Store category display names for tooltips ── */
            this.categoryDisplayNames = cols.categoryIndices.map(
                (i) => table.columns[i]?.displayName ?? "Category",
            );

            /* ── Parse leaf rows ── */
            const leaves = parseLeafRows(table, cols, this.host);

            if (leaves.length === 0) {
                this.showError("No valid data rows found.\nEnsure Actual and Budget contain numeric values.");
                return;
            }

            /* ── Build hierarchy ── */
            const startExpanded = this.cfg.interaction.startExpanded;
            const shouldResetExpansion =
                !this.hasRenderedOnce || startExpanded !== this.previousStartExpanded;
            this.previousStartExpanded = startExpanded;

            if (shouldResetExpansion || !this.root) {
                this.root = buildHierarchy(leaves, this.categoryDisplayNames, startExpanded);
            } else {
                /* Preserve expansion state: rebuild tree, copy expansion from old */
                const oldRoot = this.root;
                this.root = buildHierarchy(leaves, this.categoryDisplayNames, startExpanded);
                if (this.root && oldRoot) {
                    copyExpansionState(oldRoot, this.root);
                }
            }

            /* ── Render ── */
            this.renderAll();
            this.hasRenderedOnce = true;
        } catch (e) {
            /* Never throw from update() (E1) */
            console.error("HVTree update error:", e);
            this.showError("An unexpected error occurred.");
        }
    }

    /* ═══════════════════════════════════════════════
       Render Orchestration
       ═══════════════════════════════════════════════ */

    private renderAll(): void {
        if (!this.root || !this.cfg) return;

        const callbacks = this.buildCallbacks();
        renderTree(this.svgSel, this.root, this.cfg, callbacks);
        this.applySelection();
    }

    private applySelection(): void {
        if (!this.root || !this.cfg) return;
        const selectedIds = getSelectedNodeIds(this.root, this.selectionManager);
        const hasSel = hasActiveSelection(this.selectionManager);
        applyNodeSelectionStyles(this.svgSel, selectedIds, hasSel, this.cfg);
    }

    private buildCallbacks(): TreeCallbacks {
        return {
            onNodeClick: (node: VarianceNode, e: MouseEvent) => {
                handleNodeClick(node, e, this.selectionManager);
                this.applySelection();
            },
            onNodeToggle: (node: VarianceNode) => {
                node.isExpanded = !node.isExpanded;
                this.renderAll();
            },
            onBackgroundClick: () => {
                clearSelection(this.selectionManager);
                this.applySelection();
            },
            onNodeMouseOver: (node: VarianceNode, e: MouseEvent) => {
                this.showTooltip(node, e);
            },
            onNodeMouseMove: (node: VarianceNode, e: MouseEvent) => {
                this.moveTooltip(node, e);
            },
            onNodeMouseOut: () => {
                this.tooltipService.hide({ immediately: true, isTouchEvent: false });
            },
        };
    }

    /* ═══════════════════════════════════════════════
       Tooltips
       ═══════════════════════════════════════════════ */

    private buildTooltipItems(node: VarianceNode): VisualTooltipDataItem[] {
        const items: VisualTooltipDataItem[] = [];

        /* Category path */
        for (let i = 0; i < node.categoryPath.length; i++) {
            items.push({
                displayName: this.categoryDisplayNames[i] ?? "Level " + (i + 1),
                value: node.categoryPath[i],
            });
        }

        /* Root node label */
        if (node.categoryPath.length === 0) {
            items.push({ displayName: "Node", value: "Total" });
        }

        items.push({ displayName: "Actual", value: formatFull(node.actual).replace("\u2212", "-") });
        items.push({ displayName: "Budget", value: formatFull(node.budget).replace("\u2212", "-") });
        items.push({ displayName: "Variance", value: formatFull(node.variance) });

        if (isFinite(node.variancePct)) {
            items.push({ displayName: "Variance %", value: formatPercent(node.variancePct) });
        }

        /* Tooltip extras (leaf only) */
        for (const extra of node.tooltipExtras) {
            items.push({ displayName: extra.displayName, value: extra.value });
        }

        return items;
    }

    private showTooltip(node: VarianceNode, e: MouseEvent): void {
        this.tooltipService.show({
            dataItems: this.buildTooltipItems(node),
            identities: node.selectionId ? [node.selectionId] : [],
            coordinates: [e.clientX, e.clientY],
            isTouchEvent: false,
        });
    }

    private moveTooltip(node: VarianceNode, e: MouseEvent): void {
        this.tooltipService.move({
            dataItems: this.buildTooltipItems(node),
            identities: node.selectionId ? [node.selectionId] : [],
            coordinates: [e.clientX, e.clientY],
            isTouchEvent: false,
        });
    }

    /* ═══════════════════════════════════════════════
       Error Overlay
       ═══════════════════════════════════════════════ */

    private showError(msg: string): void {
        this.svgHost.style.display = "none";
        this.errorOverlay.style.display = "flex";
        this.errorOverlay.textContent = msg;
    }

    private hideError(): void {
        this.svgHost.style.display = "";
        this.errorOverlay.style.display = "none";
    }

    /* ═══════════════════════════════════════════════
       Formatting Model
       ═══════════════════════════════════════════════ */

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}

/* ═══════════════════════════════════════════════
   Module-Level Helpers
   ═══════════════════════════════════════════════ */

/** Copy expansion state from old tree to new tree by matching node IDs. */
function copyExpansionState(oldNode: VarianceNode, newNode: VarianceNode): void {
    if (oldNode.id === newNode.id) {
        newNode.isExpanded = oldNode.isExpanded;
    }
    for (const newChild of newNode.children) {
        const oldChild = oldNode.children.find((c) => c.id === newChild.id);
        if (oldChild) {
            copyExpansionState(oldChild, newChild);
        }
    }
}
