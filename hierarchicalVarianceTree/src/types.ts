/* ═══════════════════════════════════════════════
   types.ts – Domain Interfaces & RenderConfig
   Hierarchical Variance Tree
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

/* ── Literal union types (as const) ── */

export const ORIENTATIONS = ["topDown", "leftRight"] as const;
export type Orientation = (typeof ORIENTATIONS)[number];

export const START_EXPANDED_OPTIONS = ["all", "rootOnly", "none"] as const;
export type StartExpanded = (typeof START_EXPANDED_OPTIONS)[number];

/* ── Column index mapping ── */

export interface ColumnIndex {
    categoryIndices: number[];
    actualIndex: number;
    budgetIndex: number;
    tooltipIndices: number[];
}

/* ── Domain model ── */

/** A single node in the variance tree (T1) */
export interface VarianceNode {
    id: string;
    label: string;
    depth: number;
    actual: number;
    budget: number;
    variance: number;
    variancePct: number;           // fraction (0–1), NaN if budget = 0
    children: VarianceNode[];
    isLeaf: boolean;
    isExpanded: boolean;
    selectionId: ISelectionId | null;
    /** Category path from root to this node */
    categoryPath: string[];
    /** Tooltip extra fields from data row (leaf only) */
    tooltipExtras: TooltipExtra[];
}

export interface TooltipExtra {
    displayName: string;
    value: string;
}

/** Result of parsing the data view */
export interface ParseResult {
    root: VarianceNode | null;
    hasData: boolean;
}

/* ── Render config (T2) ── */

export interface RenderConfig {
    layout: {
        orientation: Orientation;
        nodeWidth: number;
        nodeHeight: number;
        levelSpacing: number;
        siblingSpacing: number;
        nodeCornerRadius: number;
    };
    node: {
        showVarianceBar: boolean;
        barHeight: number;
        showPercentage: boolean;
        showAbsoluteValue: boolean;
        nodeFontSize: number;
        nodeFontColor: string;
        valueFontSize: number;
        nodeBackground: string;
        nodeBorderColor: string;
        nodeBorderWidth: number;
    };
    colors: {
        favourableColor: string;
        unfavourableColor: string;
        neutralColor: string;
        connectorColor: string;
        connectorWidth: number;
        selectedNodeBorder: string;
    };
    interaction: {
        startExpanded: StartExpanded;
        animationDuration: number;
    };
}

/* ── Positioned node for rendering ── */

export interface PositionedNode {
    node: VarianceNode;
    x: number;
    y: number;
}

/* ── Callbacks for render modules ── */

export interface TreeCallbacks {
    onNodeClick: (node: VarianceNode, e: MouseEvent) => void;
    onNodeToggle: (node: VarianceNode) => void;
    onBackgroundClick: () => void;
    onNodeMouseOver: (node: VarianceNode, e: MouseEvent) => void;
    onNodeMouseMove: (node: VarianceNode, e: MouseEvent) => void;
    onNodeMouseOut: () => void;
}
