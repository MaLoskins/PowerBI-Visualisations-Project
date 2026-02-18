/* ═══════════════════════════════════════════════
   Packed Bubble Chart – Type Definitions
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

/* ── Literal Unions (as const) ── */

export const LABEL_CONTENT_OPTIONS = ["name", "value", "nameAndValue"] as const;
export type LabelContent = (typeof LABEL_CONTENT_OPTIONS)[number];

export const LEGEND_POSITION_OPTIONS = ["top", "bottom", "right"] as const;
export type LegendPosition = (typeof LEGEND_POSITION_OPTIONS)[number];

/* ── Domain Model ── */

/** A single bubble data point (B1) */
export interface BubbleNode {
    id: number;
    category: string;
    value: number;
    group: string | null;
    colorHex: string | null;
    selectionId: ISelectionId;
    tooltipFields: TooltipField[];
    /** Computed radius from scaleSqrt — set during layout */
    radius: number;
    /** Resolved fill colour after palette logic */
    fill: string;
    /** d3-force mutable positions */
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
}

export interface TooltipField {
    displayName: string;
    value: string;
}

/** Column index map returned by resolveColumns (C1) */
export interface ColumnIndex {
    category: number;
    value: number;
    group: number;
    colorField: number;
    tooltipStart: number;
    tooltipCount: number;
}

/** Result of parsing rows */
export interface ParseResult {
    nodes: BubbleNode[];
    groups: string[];
    hasGroupField: boolean;
    hasColorField: boolean;
    minValue: number;
    maxValue: number;
}

/* ── RenderConfig ── */

export interface RenderConfig {
    bubble: {
        minRadius: number;
        maxRadius: number;
        opacity: number;          // 0–1 fraction
        borderWidth: number;
        borderColor: string;
        padding: number;
    };
    force: {
        simulationStrength: number;
        collisionPadding: number;
        splitGroups: boolean;
        groupPadding: number;
    };
    label: {
        showLabels: boolean;
        labelContent: LabelContent;
        fontSize: number;
        fontColor: string;
        minRadiusForLabel: number;
        wrapLabels: boolean;
    };
    color: {
        colorByGroup: boolean;
        defaultBubbleColor: string;
        selectedBubbleColor: string;
    };
    groupLabel: {
        showGroupLabels: boolean;
        fontSize: number;
        fontColor: string;
    };
    legend: {
        showLegend: boolean;
        position: LegendPosition;
        fontSize: number;
        fontColor: string;
    };
}

/* ── Callback Interfaces ── */

export interface ChartCallbacks {
    onClick: (node: BubbleNode, event: MouseEvent) => void;
    onBackgroundClick: () => void;
    onMouseOver: (node: BubbleNode, event: MouseEvent) => void;
    onMouseMove: (node: BubbleNode, event: MouseEvent) => void;
    onMouseOut: () => void;
}
