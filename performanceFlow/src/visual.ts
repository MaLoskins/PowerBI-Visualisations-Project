/*
 *  Performance Flow (Sankey Diagram) — Power BI Custom Visual
 *  visual.ts — Entry point / orchestrator
 *
 *  FIX v2:
 *  - Calls preAggregateRows() before top-N grouping to collapse
 *    any linkColor-induced row splits.
 *  - Stores GroupingMeta; "Other" node tooltips list the bucketed
 *    category names so the viewer knows what was collapsed.
 *  - Drag uses RAF-batched lightweight updates (from v1 fix).
 *  - Callbacks built once in constructor.
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

import { VisualFormattingSettingsModel, buildRenderConfig } from "./settings";
import {
    RenderConfig,
    SankeyNode,
    SankeyLink,
    SankeyLayout,
    SankeyGraph,
    NodeCallbacks,
    LinkCallbacks,
} from "./types";
import {
    CHART_MARGIN,
    MIN_CHART_WIDTH,
    MIN_CHART_HEIGHT,
} from "./constants";

/* Model */
import { resolveColumns } from "./model/columns";
import { parseFlowRows } from "./model/parser";
import {
    buildGraph,
    applyTopNGrouping,
    preAggregateRows,
    isOtherNode,
    GroupingMeta,
} from "./model/graphBuilder";

/* Layout */
import { computeSankeyLayout, SankeyLayoutOptions } from "./layout/sankey";

/* Render */
import { renderNodes } from "./render/nodes";
import { renderLinks, updateLinkPaths } from "./render/links";
import { renderLabels, updateLabelPositions } from "./render/labels";

/* Interactions */
import {
    handleNodeClick,
    handleLinkClick,
    handleBackgroundClick,
    applySelectionStyles,
    applyHoverHighlight,
} from "./interactions/selection";

/* Utils */
import { el, pfx } from "./utils/dom";
import { formatNumber, formatPercent } from "./utils/format";

/* ═══════════════════════════════════════════════
   Visual Class
   ═══════════════════════════════════════════════ */

export class Visual implements IVisual {
    /* ── Power BI references ── */
    private host: IVisualHost;
    private selectionManager: ISelectionManager;
    private formattingSettings!: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    /* ── DOM skeleton ── */
    private container: HTMLDivElement;
    private errorOverlay: HTMLDivElement;
    private svgRoot: SVGSVGElement;
    private defs: SVGDefsElement;
    private linkGroup: SVGGElement;
    private nodeGroup: SVGGElement;
    private labelGroup: SVGGElement;

    /* ── State ── */
    private currentLayout: SankeyLayout | null = null;
    private currentGraph: SankeyGraph | null = null;
    private renderConfig: RenderConfig | null = null;
    private hasRenderedOnce: boolean = false;
    private groupingMeta: GroupingMeta = { groupedCategories: new Map() };

    /* ── Drag RAF debounce ── */
    private dragPending: boolean = false;

    /* ── Cached callbacks ── */
    private nodeCallbacks: NodeCallbacks;
    private linkCallbacks: LinkCallbacks;

    /* ═══════════════════════════════════════════════
       Constructor
       ═══════════════════════════════════════════════ */

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.selectionManager = this.host.createSelectionManager();
        this.formattingSettingsService = new FormattingSettingsService();

        /* Root container */
        this.container = el("div", pfx("container")) as HTMLDivElement;
        options.element.appendChild(this.container);

        /* Error overlay */
        this.errorOverlay = el("div", pfx("error")) as HTMLDivElement;
        this.errorOverlay.style.display = "none";
        this.container.appendChild(this.errorOverlay);

        /* SVG root */
        const svgNS = "http://www.w3.org/2000/svg";
        this.svgRoot = document.createElementNS(svgNS, "svg") as SVGSVGElement;
        this.svgRoot.setAttribute("class", pfx("svg"));
        this.container.appendChild(this.svgRoot);

        this.defs = document.createElementNS(svgNS, "defs") as SVGDefsElement;
        this.svgRoot.appendChild(this.defs);

        this.linkGroup = document.createElementNS(svgNS, "g") as SVGGElement;
        this.linkGroup.setAttribute("class", pfx("links"));
        this.svgRoot.appendChild(this.linkGroup);

        this.nodeGroup = document.createElementNS(svgNS, "g") as SVGGElement;
        this.nodeGroup.setAttribute("class", pfx("nodes"));
        this.svgRoot.appendChild(this.nodeGroup);

        this.labelGroup = document.createElementNS(svgNS, "g") as SVGGElement;
        this.labelGroup.setAttribute("class", pfx("labels"));
        this.svgRoot.appendChild(this.labelGroup);

        /* Build callbacks once */
        this.nodeCallbacks = this.buildNodeCallbacks();
        this.linkCallbacks = this.buildLinkCallbacks();

        /* Background click clears selection */
        this.svgRoot.addEventListener("click", (e: MouseEvent) => {
            if (e.target === this.svgRoot) {
                handleBackgroundClick(this.selectionManager);
                this.applySelection();
            }
        });

        this.selectionManager.registerOnSelectCallback(() => {
            this.applySelection();
        });
    }

    /* ═══════════════════════════════════════════════
       Update
       ═══════════════════════════════════════════════ */

    public update(options: VisualUpdateOptions): void {
        try {
            const updateType = options.type ?? 0;
            const hasData = (updateType & 2) !== 0;
            const isResizeOnly = !hasData && (updateType & (4 | 16)) !== 0;

            const dataView = options.dataViews?.[0];
            if (dataView) {
                this.formattingSettings = this.formattingSettingsService
                    .populateFormattingSettingsModel(VisualFormattingSettingsModel, dataView);
                this.renderConfig = buildRenderConfig(this.formattingSettings);
            }

            const vw = options.viewport.width;
            const vh = options.viewport.height;
            this.svgRoot.setAttribute("width", String(vw));
            this.svgRoot.setAttribute("height", String(vh));

            if (vw < MIN_CHART_WIDTH || vh < MIN_CHART_HEIGHT) {
                this.showError("Visual area too small.");
                return;
            }

            if (isResizeOnly && this.currentGraph && this.hasRenderedOnce) {
                this.layoutAndRender(vw, vh);
                return;
            }

            /* ── Data pipeline ── */
            if (!dataView?.table) {
                this.showError("Required fields missing.\nAdd Source, Destination, and Value fields.");
                return;
            }

            const table = dataView.table;
            const cols = resolveColumns(table.columns as { roles?: Record<string, boolean> }[]);
            if (!cols) {
                this.showError("Required fields missing.\nAdd Source, Destination, and Value fields.");
                return;
            }

            const parsed = parseFlowRows(table, cols, this.host);
            if (parsed.rows.length === 0) {
                this.showError("No valid flow data.\nEnsure Source, Destination, and Value fields have data.");
                return;
            }

            const cfg = this.renderConfig;
            if (!cfg) return;

            /*
             * Step 1: Pre-aggregate by (source, destination).
             * This collapses any row splits caused by linkColor
             * having been a GroupingOrMeasure field, so that
             * grouping and graph construction see the true
             * aggregated values per flow path.
             */
            const aggregated = preAggregateRows(parsed.rows);

            /*
             * Step 2: Apply top-N grouping.
             * Low-value leaf destinations/sources are replaced
             * with "Other (N categories)" BEFORE graph construction,
             * so the graph builder's aggregation map naturally
             * merges all "Other" links per source.
             */
            const groupingResult = applyTopNGrouping(aggregated, cfg);
            this.groupingMeta = groupingResult.meta;

            /*
             * Step 3: Build graph from grouped rows.
             */
            const graph = buildGraph(
                groupingResult.rows,
                cfg.node.color,
                cfg.color.colorByNode,
            );

            this.currentGraph = graph;
            this.hideError();
            this.layoutAndRender(vw, vh);

        } catch (err) {
            this.showError("An error occurred rendering the visual.");
            console.error("PerformanceFlow error:", err);
        }
    }

    /* ═══════════════════════════════════════════════
       Layout & Render
       ═══════════════════════════════════════════════ */

    private layoutAndRender(viewportWidth: number, viewportHeight: number): void {
        if (!this.renderConfig || !this.currentGraph) return;

        const cfg = this.renderConfig;
        const m = CHART_MARGIN;
        const w = viewportWidth - m.left - m.right;
        const h = viewportHeight - m.top - m.bottom;
        if (w <= 0 || h <= 0) return;

        const layoutOpts: SankeyLayoutOptions = {
            width: w,
            height: h,
            nodeWidth: cfg.node.width,
            nodePadding: cfg.node.padding,
            iterations: cfg.layout.iterations,
            align: cfg.node.align,
            sortNodes: cfg.layout.sortNodes,
        };

        const layout = computeSankeyLayout(this.currentGraph, layoutOpts);
        this.currentLayout = layout;

        const transform = `translate(${m.left},${m.top})`;
        this.linkGroup.setAttribute("transform", transform);
        this.nodeGroup.setAttribute("transform", transform);
        this.labelGroup.setAttribute("transform", transform);

        this.renderAll(layout, cfg, w);
        this.hasRenderedOnce = true;
    }

    private renderAll(layout: SankeyLayout, cfg: RenderConfig, chartWidth: number): void {
        renderLinks(this.linkGroup, this.defs, layout.links, cfg, this.linkCallbacks);
        renderNodes(this.nodeGroup, layout.nodes, cfg, this.nodeCallbacks);
        renderLabels(this.labelGroup, layout.nodes, cfg, chartWidth);
        this.applySelection();
    }

    /* ═══════════════════════════════════════════════
       Callbacks (built once)
       ═══════════════════════════════════════════════ */

    private buildNodeCallbacks(): NodeCallbacks {
        return {
            onClick: (node: SankeyNode, e: MouseEvent) => {
                handleNodeClick(node, e, this.selectionManager);
                this.applySelection();
            },
            onMouseOver: (node: SankeyNode, e: MouseEvent) => {
                if (this.currentLayout && this.renderConfig) {
                    applyHoverHighlight(
                        this.svgRoot, node, null,
                        this.renderConfig.node.opacity,
                        this.renderConfig.link.opacity,
                        this.renderConfig.link.hoverOpacity,
                    );
                }
                this.showTooltipForNode(node, e);
            },
            onMouseMove: (node: SankeyNode, e: MouseEvent) => {
                this.showTooltipForNode(node, e);
            },
            onMouseOut: () => {
                if (this.renderConfig) {
                    applyHoverHighlight(
                        this.svgRoot, null, null,
                        this.renderConfig.node.opacity,
                        this.renderConfig.link.opacity,
                        this.renderConfig.link.hoverOpacity,
                    );
                }
                this.host.tooltipService.hide({ immediately: true, isTouchEvent: false });
            },
            onDrag: () => {
                this.scheduleDragUpdate();
            },
        };
    }

    private buildLinkCallbacks(): LinkCallbacks {
        return {
            onClick: (link: SankeyLink, e: MouseEvent) => {
                handleLinkClick(link, e, this.selectionManager);
                this.applySelection();
            },
            onMouseOver: (link: SankeyLink, e: MouseEvent) => {
                if (this.renderConfig) {
                    applyHoverHighlight(
                        this.svgRoot, null, link,
                        this.renderConfig.node.opacity,
                        this.renderConfig.link.opacity,
                        this.renderConfig.link.hoverOpacity,
                    );
                }
                this.showTooltipForLink(link, e);
            },
            onMouseMove: (link: SankeyLink, e: MouseEvent) => {
                this.showTooltipForLink(link, e);
            },
            onMouseOut: () => {
                if (this.renderConfig) {
                    applyHoverHighlight(
                        this.svgRoot, null, null,
                        this.renderConfig.node.opacity,
                        this.renderConfig.link.opacity,
                        this.renderConfig.link.hoverOpacity,
                    );
                }
                this.host.tooltipService.hide({ immediately: true, isTouchEvent: false });
            },
        };
    }

    /* ═══════════════════════════════════════════════
       Drag — RAF-batched lightweight updates
       ═══════════════════════════════════════════════ */

    private scheduleDragUpdate(): void {
        if (this.dragPending) return;
        this.dragPending = true;
        requestAnimationFrame(() => {
            this.dragPending = false;
            this.performDragUpdate();
        });
    }

    private performDragUpdate(): void {
        if (!this.currentLayout || !this.renderConfig) return;
        this.recomputeLinkYPositions(this.currentLayout.nodes);
        updateLinkPaths(this.linkGroup, this.renderConfig.link.curvature);
        updateLabelPositions(this.labelGroup, this.currentLayout.nodes, this.renderConfig);
    }

    private recomputeLinkYPositions(nodes: SankeyNode[]): void {
        for (const node of nodes) {
            node.sourceLinks.sort((a, b) => a.target.y0 - b.target.y0);
            node.targetLinks.sort((a, b) => a.source.y0 - b.source.y0);
        }
        for (const node of nodes) {
            const h = node.y1 - node.y0;
            let tot = 0;
            for (const l of node.sourceLinks) tot += l.value;
            const s = tot > 0 ? h / tot : 0;
            let y = node.y0;
            for (const link of node.sourceLinks) {
                link.width = link.value * s;
                link.y0 = y + link.width / 2;
                y += link.width;
            }
        }
        for (const node of nodes) {
            const h = node.y1 - node.y0;
            let tot = 0;
            for (const l of node.targetLinks) tot += l.value;
            const s = tot > 0 ? h / tot : 0;
            let y = node.y0;
            for (const link of node.targetLinks) {
                const w = link.value * s;
                link.y1 = y + w / 2;
                y += w;
            }
        }
    }

    /* ═══════════════════════════════════════════════
       Selection
       ═══════════════════════════════════════════════ */

    private applySelection(): void {
        if (!this.currentLayout || !this.renderConfig) return;
        applySelectionStyles(
            this.svgRoot,
            this.currentLayout.nodes,
            this.currentLayout.links,
            this.selectionManager,
            this.renderConfig.color.selectedNodeColor,
            this.renderConfig.color.selectedLinkColor,
            this.renderConfig.node.opacity,
            this.renderConfig.link.opacity,
        );
    }

    /* ═══════════════════════════════════════════════
       Tooltips
       ═══════════════════════════════════════════════ */

    private showTooltipForNode(node: SankeyNode, e: MouseEvent): void {
        let totalIn = 0;
        let totalOut = 0;
        for (const l of node.targetLinks) totalIn += l.value;
        for (const l of node.sourceLinks) totalOut += l.value;

        const items: powerbi.extensibility.VisualTooltipDataItem[] = [
            { displayName: "Node", value: node.name },
            { displayName: "Total In", value: formatNumber(totalIn) },
            { displayName: "Total Out", value: formatNumber(totalOut) },
        ];

        /*
         * If this is an "Other" bucket, show the grouped categories
         * so the viewer can see what was collapsed.
         */
        if (isOtherNode(node.name)) {
            const cats = this.groupingMeta.groupedCategories.get(node.name);
            if (cats && cats.length > 0) {
                /* Show up to 8 names inline, then "…and N more" */
                const MAX_SHOW = 8;
                const shown = cats.slice(0, MAX_SHOW).join(", ");
                const suffix = cats.length > MAX_SHOW
                    ? ` …and ${cats.length - MAX_SHOW} more`
                    : "";
                items.push({
                    displayName: "Includes",
                    value: shown + suffix,
                });
            }
        }

        this.host.tooltipService.show({
            coordinates: [e.clientX, e.clientY],
            isTouchEvent: false,
            dataItems: items,
            identities: [],
        });
    }

    private showTooltipForLink(link: SankeyLink, e: MouseEvent): void {
        let sourceTotal = 0;
        for (const l of link.source.sourceLinks) sourceTotal += l.value;
        const pctOfSource = sourceTotal > 0 ? link.value / sourceTotal : 0;

        const items: powerbi.extensibility.VisualTooltipDataItem[] = [
            { displayName: "Source", value: link.source.name },
            { displayName: "Destination", value: link.target.name },
            { displayName: "Value", value: formatNumber(link.value) },
            { displayName: "% of Source", value: formatPercent(pctOfSource) },
        ];

        for (const extra of link.tooltipExtras) {
            items.push(extra);
        }

        this.host.tooltipService.show({
            coordinates: [e.clientX, e.clientY],
            isTouchEvent: false,
            dataItems: items,
            identities: [],
        });
    }

    /* ═══════════════════════════════════════════════
       Error Overlay
       ═══════════════════════════════════════════════ */

    private showError(msg: string): void {
        this.errorOverlay.textContent = msg;
        this.errorOverlay.style.display = "flex";
        this.svgRoot.style.display = "none";
    }

    private hideError(): void {
        this.errorOverlay.style.display = "none";
        this.svgRoot.style.display = "block";
    }

    /* ═══════════════════════════════════════════════
       Formatting Model
       ═══════════════════════════════════════════════ */

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}
