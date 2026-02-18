/* ═══════════════════════════════════════════════
   Hierarchy Filter Slicer – Visual (Orchestrator)
   Entry point. Builds DOM once, delegates to
   model/, render/, interactions/ modules.
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataViewCategorical = powerbi.DataViewCategorical;

/* ── Settings & Config ── */

import { VisualFormattingSettingsModel, buildRenderConfig } from "./settings";
import { RenderConfig, HierarchyNode } from "./types";

/* ── Model ── */

import { resolveColumns } from "./model/columns";
import { parseRows } from "./model/parser";
import {
    buildHierarchy,
    toggleCheck,
    toggleSelectAll,
    setExpandAll,
    flattenVisible,
    collectCheckedLeafKeys,
    collectExpandedKeys,
    collectCheckedLeafValues,
    countLeaves,
    computeParentState,
} from "./model/hierarchy";

/* ── Render ── */

import { renderTree } from "./render/tree";
import {
    createHeader,
    updateHeaderStyle,
    updateSelectAllState,
    HeaderElements,
} from "./render/header";
import {
    createSearchBox,
    updateSearchBoxStyle,
    getSearchTerm,
    SearchBoxElements,
} from "./render/searchBox";

/* ── Interactions ── */

import { getLeafFilterTarget, applyFilter } from "./interactions/filter";

/* ── Utils ── */

import { el, setCssVars } from "./utils/dom";

/* ═══════════════════════════════════════════════
   Visual Class
   ═══════════════════════════════════════════════ */

export class Visual implements IVisual {
    /* ── Power BI services ── */
    private host: IVisualHost;
    private formattingSettingsService: FormattingSettingsService;
    private formattingSettings: VisualFormattingSettingsModel;

    /* ── DOM skeleton (created once in constructor) ── */
    private container: HTMLDivElement;
    private errorOverlay: HTMLDivElement;
    private headerElements: HeaderElements;
    private searchElements: SearchBoxElements;
    private treeBody: HTMLDivElement;

    /* ── Domain state ── */
    private roots: HierarchyNode[] = [];
    private checkedKeys: Set<string> = new Set();
    private expandedKeys: Set<string> = new Set();
    private isFirstLoad: boolean = true;
    private totalLeafCount: number = 0;
    private leafCategoryIndex: number = -1;
    private lastCategorical: DataViewCategorical | null = null;
    private renderConfig: RenderConfig | null = null;
    private hasRenderedOnce: boolean = false;

    /* ═══════════════════════════════════════════════
       Constructor — build entire DOM skeleton once
       ═══════════════════════════════════════════════ */

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.formattingSettingsService = new FormattingSettingsService();

        const target = options.element;

        /* ── Container ── */
        this.container = el("div", "container");
        target.appendChild(this.container);

        /* ── Error overlay ── */
        this.errorOverlay = el("div", "error");
        this.container.appendChild(this.errorOverlay);

        /* ── Build a default RenderConfig for initial DOM construction ── */
        const defaultModel = new VisualFormattingSettingsModel();
        this.formattingSettings = defaultModel;
        const defaultCfg = buildRenderConfig(defaultModel);
        this.renderConfig = defaultCfg;

        /* ── Header ── */
        this.headerElements = createHeader(
            this.container,
            defaultCfg,
            {
                onSelectAll: () => this.handleSelectAll(),
                onExpandAll: () => this.handleExpandAll(),
                onCollapseAll: () => this.handleCollapseAll(),
            },
        );

        /* ── Search box ── */
        this.searchElements = createSearchBox(
            this.container,
            defaultCfg,
            {
                onSearchChange: (_term: string) => this.handleSearchChange(),
            },
        );

        /* ── Scrollable tree body ── */
        this.treeBody = el("div", "body");
        this.container.appendChild(this.treeBody);
    }

    /* ═══════════════════════════════════════════════
       update() — data pipeline + render orchestration
       ═══════════════════════════════════════════════ */

    public update(options: VisualUpdateOptions): void {
        try {
            /* ── VisualUpdateType gating ── */
            const updateType = options.type ?? 0;
            const hasData = (updateType & 2) !== 0;
            const isResizeOnly = !hasData && (updateType & (4 | 16)) !== 0;

            /* ── Validate dataViews ── */
            const dataViews = options.dataViews;
            if (!dataViews || dataViews.length === 0 || !dataViews[0]) {
                this.showError("Required fields missing.\nAdd at least one hierarchy field to the Category data role.");
                return;
            }

            const dv = dataViews[0];
            const categorical = dv.categorical;

            /* ── Populate formatting settings ── */
            this.formattingSettings = this.formattingSettingsService
                .populateFormattingSettingsModel(VisualFormattingSettingsModel, dv);
            this.renderConfig = buildRenderConfig(this.formattingSettings);

            /* ── Apply container styles ── */
            this.applyContainerStyles(this.renderConfig);

            /* ── On resize only, just re-render with existing data ── */
            if (isResizeOnly && this.hasRenderedOnce) {
                this.renderAll();
                return;
            }

            /* ── Resolve columns ── */
            if (!categorical) {
                this.showError("Required fields missing.\nAdd at least one hierarchy field to the Category data role.");
                return;
            }

            const cols = resolveColumns(categorical);
            if (!cols) {
                this.showError("Required fields missing.\nAdd at least one hierarchy field to the Category data role.");
                return;
            }

            this.lastCategorical = categorical;
            this.leafCategoryIndex = cols.categoryIndices[cols.levelCount - 1];

            /* ── Parse rows ── */
            const parsedRows = parseRows(categorical, cols);
            if (parsedRows.length === 0) {
                this.showError("No data available.\nCheck your data source or filters.");
                return;
            }

            /* ── Build hierarchy (preserving previous state) ── */
            this.roots = buildHierarchy(
                parsedRows,
                cols.levelCount,
                this.checkedKeys,
                this.expandedKeys,
                this.isFirstLoad,
            );

            this.isFirstLoad = false;
            this.totalLeafCount = countLeaves(this.roots);

            /* ── Persist current state ── */
            this.checkedKeys = collectCheckedLeafKeys(this.roots);
            this.expandedKeys = collectExpandedKeys(this.roots);

            /* ── Hide error and render ── */
            this.hideError();
            this.renderAll();
            this.hasRenderedOnce = true;

        } catch (_err) {
            this.showError("An unexpected error occurred.\nPlease check your data configuration.");
        }
    }

    /* ═══════════════════════════════════════════════
       Formatting Model
       ═══════════════════════════════════════════════ */

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    /* ═══════════════════════════════════════════════
       Render Orchestration
       ═══════════════════════════════════════════════ */

    private renderAll(): void {
        if (!this.renderConfig) return;
        const cfg = this.renderConfig;

        /* ── Update header ── */
        updateHeaderStyle(this.headerElements, cfg);
        const globalState = computeParentState(this.roots);
        updateSelectAllState(this.headerElements, globalState, cfg.checkbox);

        /* ── Update search box ── */
        updateSearchBoxStyle(this.searchElements, cfg);

        /* ── Flatten visible nodes ── */
        const searchTerm = getSearchTerm(this.searchElements);
        const visibleNodes = flattenVisible(this.roots, searchTerm);

        /* ── Render tree rows ── */
        renderTree(
            this.treeBody,
            visibleNodes,
            cfg,
            {
                onToggleExpand: (node: HierarchyNode) => this.handleToggleExpand(node),
                onToggleCheck: (node: HierarchyNode) => this.handleToggleCheck(node),
            },
            searchTerm,
        );
    }

    /* ═══════════════════════════════════════════════
       Container Styling
       ═══════════════════════════════════════════════ */

    private applyContainerStyles(cfg: RenderConfig): void {
        const c = this.container;
        c.style.backgroundColor = cfg.container.background;
        c.style.border = cfg.container.borderWidth > 0
            ? `${cfg.container.borderWidth}px solid ${cfg.container.borderColor}`
            : "none";
        c.style.borderRadius = cfg.container.borderRadius + "px";

        setCssVars(c, {
            "--sb-width": cfg.container.scrollbarWidth + "px",
            "--sb-thumb": cfg.container.scrollbarThumbColor,
            "--sb-track": cfg.container.scrollbarTrackColor,
        });
    }

    /* ═══════════════════════════════════════════════
       Interaction Handlers
       ═══════════════════════════════════════════════ */

    private handleToggleExpand(node: HierarchyNode): void {
        node.isExpanded = !node.isExpanded;
        this.expandedKeys = collectExpandedKeys(this.roots);
        this.renderAll();
    }

    private handleToggleCheck(node: HierarchyNode): void {
        toggleCheck(node);
        this.checkedKeys = collectCheckedLeafKeys(this.roots);
        this.renderAll();
        this.applyCurrentFilter();
    }

    private handleSelectAll(): void {
        toggleSelectAll(this.roots);
        this.checkedKeys = collectCheckedLeafKeys(this.roots);
        this.renderAll();
        this.applyCurrentFilter();
    }

    private handleExpandAll(): void {
        setExpandAll(this.roots, true);
        this.expandedKeys = collectExpandedKeys(this.roots);
        this.renderAll();
    }

    private handleCollapseAll(): void {
        setExpandAll(this.roots, false);
        this.expandedKeys = collectExpandedKeys(this.roots);
        this.renderAll();
    }

    private handleSearchChange(): void {
        this.renderAll();
    }

    /* ═══════════════════════════════════════════════
       Filter Application (F1)
       ═══════════════════════════════════════════════ */

    private applyCurrentFilter(): void {
        if (!this.lastCategorical || this.leafCategoryIndex < 0) return;

        const target = getLeafFilterTarget(this.lastCategorical, this.leafCategoryIndex);
        if (!target) return;

        const checkedValues = collectCheckedLeafValues(this.roots);
        applyFilter(this.host, target, checkedValues, this.totalLeafCount);
    }

    /* ═══════════════════════════════════════════════
       Error Overlay
       ═══════════════════════════════════════════════ */

    private showError(message: string): void {
        this.errorOverlay.textContent = message;
        this.errorOverlay.style.display = "flex";
        this.headerElements.container.style.display = "none";
        this.searchElements.container.style.display = "none";
        this.treeBody.style.display = "none";
    }

    private hideError(): void {
        this.errorOverlay.style.display = "none";
        this.headerElements.container.style.display = "";
        this.searchElements.container.style.display = "";
        this.treeBody.style.display = "";
    }
}
