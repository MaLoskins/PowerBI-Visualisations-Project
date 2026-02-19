/*
 *  Performance Flow (Sankey Diagram) — Power BI Custom Visual
 *  types.ts — Domain interfaces, literal unions, RenderConfig
 */
"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

/* ═══════════════════════════════════════════════
   Literal Unions (as const + derived types)
   ═══════════════════════════════════════════════ */

export const NODE_ALIGN_OPTIONS = ["left", "right", "center", "justify"] as const;
export type NodeAlign = (typeof NODE_ALIGN_OPTIONS)[number];

export const COLOR_MODES = ["sourceColor", "destColor", "gradient", "fixed"] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

export const LABEL_POSITIONS = ["inside", "outside"] as const;
export type LabelPosition = (typeof LABEL_POSITIONS)[number];

export const SORT_NODE_OPTIONS = ["auto", "name", "value", "none"] as const;
export type SortNodeOption = (typeof SORT_NODE_OPTIONS)[number];

/* ═══════════════════════════════════════════════
   Column Index
   ═══════════════════════════════════════════════ */

export interface ColumnIndex {
    source: number;
    destination: number;
    value: number;
    linkColor: number;
    tooltipFields: number[];
}

/* ═══════════════════════════════════════════════
   Domain Model — Raw parsed data
   ═══════════════════════════════════════════════ */

export interface FlowRow {
    source: string;
    destination: string;
    value: number;
    linkColorValue: string | null;
    selectionId: ISelectionId;
    tooltipExtras: powerbi.extensibility.VisualTooltipDataItem[];
}

/* ═══════════════════════════════════════════════
   Domain Model — Graph structures
   ═══════════════════════════════════════════════ */

export interface SankeyNodeDatum {
    id: string;
    name: string;
    color: string;
    selectionIds: ISelectionId[];
}

export interface SankeyLinkDatum {
    sourceId: string;
    targetId: string;
    value: number;
    colorOverride: string | null;
    selectionId: ISelectionId;
    tooltipExtras: powerbi.extensibility.VisualTooltipDataItem[];
}

export interface SankeyGraph {
    nodes: SankeyNodeDatum[];
    links: SankeyLinkDatum[];
    nodeMap: Map<string, SankeyNodeDatum>;
    maxDepth: number;
}

/* ═══════════════════════════════════════════════
   Layout — Positioned node & link (S1)
   ═══════════════════════════════════════════════ */

/** S1: Positioned node after Sankey layout computation */
export interface SankeyNode {
    id: string;
    name: string;
    depth: number;
    x0: number;
    x1: number;
    y0: number;
    y1: number;
    value: number;
    color: string;
    sourceLinks: SankeyLink[];
    targetLinks: SankeyLink[];
    selectionIds: ISelectionId[];
}

/** S1: Positioned link after Sankey layout computation */
export interface SankeyLink {
    source: SankeyNode;
    target: SankeyNode;
    value: number;
    width: number;
    y0: number;
    y1: number;
    color: string;
    colorOverride: string | null;
    selectionId: ISelectionId;
    tooltipExtras: powerbi.extensibility.VisualTooltipDataItem[];
}

/** Complete layout result from Sankey algorithm */
export interface SankeyLayout {
    nodes: SankeyNode[];
    links: SankeyLink[];
}

/* ═══════════════════════════════════════════════
   RenderConfig — Bridge between settings & render
   ═══════════════════════════════════════════════ */

export interface RenderConfig {
    node: {
        width: number;
        padding: number;
        cornerRadius: number;
        color: string;
        opacity: number;          // 0–1 fraction
        align: NodeAlign;
    };
    link: {
        opacity: number;          // 0–1 fraction
        hoverOpacity: number;     // 0–1 fraction
        colorMode: ColorMode;
        fixedColor: string;
        curvature: number;
    };
    label: {
        showNodeLabels: boolean;
        fontSize: number;
        fontColor: string;
        position: LabelPosition;
        showValues: boolean;
        valueFontSize: number;
    };
    color: {
        colorByNode: boolean;
        selectedLinkColor: string;
        selectedNodeColor: string;
    };
    layout: {
        iterations: number;
        sortNodes: SortNodeOption;
    };
}

/* ═══════════════════════════════════════════════
   Callback Interfaces (C1)
   ═══════════════════════════════════════════════ */

/** C1: Callbacks for node rendering interactions */
export interface NodeCallbacks {
    onClick: (node: SankeyNode, e: MouseEvent) => void;
    onMouseOver: (node: SankeyNode, e: MouseEvent) => void;
    onMouseMove: (node: SankeyNode, e: MouseEvent) => void;
    onMouseOut: () => void;
    onDrag: (node: SankeyNode, dy: number) => void;
}

/** C1: Callbacks for link rendering interactions */
export interface LinkCallbacks {
    onClick: (link: SankeyLink, e: MouseEvent) => void;
    onMouseOver: (link: SankeyLink, e: MouseEvent) => void;
    onMouseMove: (link: SankeyLink, e: MouseEvent) => void;
    onMouseOut: () => void;
}
