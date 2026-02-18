/*
 *  Performance Flow (Sankey Diagram) — Power BI Custom Visual
 *  visual.ts — Entry point / orchestrator
 *
 *  Responsibilities:
 *    1. DOM scaffolding — build entire DOM skeleton in constructor
 *    2. Data pipeline — gate on VisualUpdateType flags
 *    3. Render orchestration — delegate to render/, layout/, interactions/
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
import DataViewTable = powerbi.DataViewTable;

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
    CSS_PREFIX,
} from "./constants";

/* Model */
import { resolveColumns } from "./model/columns";
import { parseFlowRows, ParseResult } from "./model/parser";
import { buildGraph } from "./model/graphBuilder";

/* Layout */
import { computeSankeyLayout, SankeyLayoutOptions } from "./layout/sankey";

/* Render */
import { renderNodes } from "./render/nodes";
import { renderLinks } from "./render/links";
import { renderLabels } from "./render/labels";

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
import { formatNumber, formatPercent, formatCompact } from "./utils/format";

/* ═══════════════════════════════════════════════
   Visual Class
   ═══════════════════════════════════════════════ */

export class Visual implements IVisual {
    /* ── Power BI references ── */
    private host: IVisualHost;
    private selectionManager: ISelectionManager;
    private formattingSettings!: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    /* ── DOM skeleton (created once in constructor) ── */
    private container: HTMLDivElement;
    private errorOverlay: HTMLDivElement;
    private svgRoot: SVGSVGElement;
    private defs: SVGDefsElement;
    private linkGroup: SVGGElement;
    private nodeGroup: SVGGElement;
    private labelGroup: SVGGElement;

    /* ── State ── */
    private currentLayout: SankeyLayout | null = null;
    private renderConfig: RenderConfig | null = null;
    private hasRenderedOnce: boolean = false;

    /* ═══════════════════════════════════════════════
       Constructor — DOM scaffolding (built once)
       ═══════════════════════════════════════════════ */

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.selectionManager = this.host.createSelectionManager();
        this.formattingSettingsService = new FormattingSettingsService();

        /* Root container */
        this.container = el("div", pfx("container")) as HTMLDivElement;
        options.element.appendChild(this.container);

        /* Error overlay (hidden by default) */
        this.errorOverlay = el("div", pfx("error")) as HTMLDivElement;
        this.errorOverlay.style.display = "none";
        this.container.appendChild(this.errorOverlay);

        /* SVG root */
        const svgNS = "http://www.w3.org/2000/svg";
        this.svgRoot = document.createElementNS(svgNS, "svg") as SVGSVGElement;
        this.svgRoot.setAttribute("class", pfx("svg"));
        this.container.appendChild(this.svgRoot);

        /* SVG defs for gradients */
        this.defs = document.createElementNS(svgNS, "defs") as SVGDefsElement;
        this.svgRoot.appendChild(this.defs);

        /* Render groups — order matters (links behind nodes behind labels) */
        this.linkGroup = document.createElementNS(svgNS, "g") as SVGGElement;
        this.linkGroup.setAttribute("class", pfx("links"));
        this.svgRoot.appendChild(this.linkGroup);

        this.nodeGroup = document.createElementNS(svgNS, "g") as SVGGElement;
        this.nodeGroup.setAttribute("class", pfx("nodes"));
        this.svgRoot.appendChild(this.nodeGroup);

        this.labelGroup = document.createElementNS(svgNS, "g") as SVGGElement;
        this.labelGroup.setAttribute("class", pfx("labels"));
        this.svgRoot.appendChild(this.labelGroup);

        /* Background click clears selection */
        this.svgRoot.addEventListener("click", (e: MouseEvent) => {
            if (e.target === this.svgRoot) {
                handleBackgroundClick(this.selectionManager);
                this.applySelection();
            }
        });

        /* Selection manager callback for cross-visual filtering */
        this.selectionManager.registerOnSelectCallback(() => {
            this.applySelection();
        });
    }

    /* ═══════════════════════════════════════════════
       Update — Data pipeline + render orchestration
       ═══════════════════════════════════════════════ */

    public update(options: VisualUpdateOptions): void {
        try {
            /* ── Update type gating ── */
            const updateType = options.type ?? 0;
            const hasData = (updateType & 2) !== 0;
            const isResizeOnly = !hasData && (updateType & (4 | 16)) !== 0;

            /* Always rebuild render config */
            this.formattingSettings = this.formattingSettingsService
                .populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews[0]);
            this.renderConfig = buildRenderConfig(this.formattingSettings);

            /* Viewport sizing */
            const vw = options.viewport.width;
            const vh = options.viewport.height;
            this.svgRoot.setAttribute("width", String(vw));
            this.svgRoot.setAttribute("height", String(vh));

            if (vw < MIN_CHART_WIDTH || vh < MIN_CHART_HEIGHT) {
                this.showError("Visual area too small.");
                return;
            }

            /* Resize-only: re-layout with existing data */
            if (isResizeOnly && this.currentLayout && this.hasRenderedOnce) {
                this.layoutAndRender(vw, vh);
                return;
            }

            /* ── Data pipeline ── */
            const dataView = options.dataViews?.[0];
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

            /* Build graph */
            const graph = buildGraph(
                parsed.rows,
                this.renderConfig.node.color,
                this.renderConfig.color.colorByNode,
            );

            /* Store for resize-only updates */
            this.currentGraph = graph;
            this.hideError();
            this.layoutAndRender(vw, vh);

        } catch (err) {
            this.showError("An error occurred rendering the visual.");
            console.error("PerformanceFlow error:", err);
        }
    }

    /* ── Stored graph for re-layout on resize ── */
    private currentGraph: SankeyGraph | null = null;

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

        /* Compute Sankey layout */
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

        /* Offset groups by margin */
        const transform = `translate(${m.left},${m.top})`;
        this.linkGroup.setAttribute("transform", transform);
        this.nodeGroup.setAttribute("transform", transform);
        this.labelGroup.setAttribute("transform", transform);

        /* ── Render ── */
        this.renderAll(layout, cfg, w);
        this.hasRenderedOnce = true;
    }

    private renderAll(layout: SankeyLayout, cfg: RenderConfig, chartWidth: number): void {
        const nodeCallbacks = this.buildNodeCallbacks();
        const linkCallbacks = this.buildLinkCallbacks();

        renderLinks(this.linkGroup, this.defs, layout.links, cfg, linkCallbacks);
        renderNodes(this.nodeGroup, layout.nodes, cfg, nodeCallbacks);
        renderLabels(this.labelGroup, layout.nodes, cfg, chartWidth);

        this.applySelection();
    }

    /* ═══════════════════════════════════════════════
       Interaction Callbacks (C1)
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
            onDrag: (node: SankeyNode, _dy: number) => {
                /* Re-render after drag to update link paths and labels */
                if (this.currentLayout && this.renderConfig) {
                    this.reRenderAfterDrag();
                }
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
        const totalIn = node.targetLinks.reduce((s, l) => s + l.value, 0);
        const totalOut = node.sourceLinks.reduce((s, l) => s + l.value, 0);

        const items: powerbi.extensibility.VisualTooltipDataItem[] = [
            { displayName: "Node", value: node.name },
            { displayName: "Total In", value: formatNumber(totalIn) },
            { displayName: "Total Out", value: formatNumber(totalOut) },
        ];

        this.host.tooltipService.show({
            coordinates: [e.clientX, e.clientY],
            isTouchEvent: false,
            dataItems: items,
            identities: [],
        });
    }

    private showTooltipForLink(link: SankeyLink, e: MouseEvent): void {
        const sourceTotal = link.source.sourceLinks.reduce((s, l) => s + l.value, 0);
        const pctOfSource = sourceTotal > 0 ? link.value / sourceTotal : 0;

        const items: powerbi.extensibility.VisualTooltipDataItem[] = [
            { displayName: "Source", value: link.source.name },
            { displayName: "Destination", value: link.target.name },
            { displayName: "Value", value: formatNumber(link.value) },
            { displayName: "% of Source", value: formatPercent(pctOfSource) },
        ];

        /* Append user-defined tooltip extras */
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
       Drag Re-render
       ═══════════════════════════════════════════════ */

    private reRenderAfterDrag(): void {
        if (!this.currentLayout || !this.renderConfig) return;
        const cfg = this.renderConfig;
        const linkCallbacks = this.buildLinkCallbacks();
        const chartWidth = parseFloat(this.svgRoot.getAttribute("width") || "0")
            - CHART_MARGIN.left - CHART_MARGIN.right;

        /* Re-render links and labels to follow dragged node positions */
        renderLinks(this.linkGroup, this.defs, this.currentLayout.links, cfg, linkCallbacks);
        renderLabels(this.labelGroup, this.currentLayout.nodes, cfg, chartWidth);
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
