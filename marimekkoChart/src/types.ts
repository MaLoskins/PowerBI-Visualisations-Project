/*
 *  Marimekko Chart – Power BI Custom Visual
 *  types.ts — Domain interfaces, literal unions, RenderConfig
 */
"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

/* ═══════════════════════════════════════════════
   Literal Unions (as const)
   ═══════════════════════════════════════════════ */

export const X_LABEL_ROTATIONS = ["0", "45", "90"] as const;
export type XLabelRotation = (typeof X_LABEL_ROTATIONS)[number];

export const COLOR_PALETTES = ["default", "pastel", "vivid"] as const;
export type ColorPalette = (typeof COLOR_PALETTES)[number];

export const SEGMENT_LABEL_CONTENTS = ["name", "percent", "value", "nameAndPercent"] as const;
export type SegmentLabelContent = (typeof SEGMENT_LABEL_CONTENTS)[number];

export const LEGEND_POSITIONS = ["top", "bottom", "right"] as const;
export type LegendPosition = (typeof LEGEND_POSITIONS)[number];

/* ═══════════════════════════════════════════════
   Domain Model
   ═══════════════════════════════════════════════ */

/** A single segment within a Marimekko column */
export interface MekkoSegment {
    xCategory: string;
    segmentCategory: string;
    value: number;
    /** Absolute value used for computation (handles negatives) */
    absValue: number;
    isNegative: boolean;
    /** Fraction of this segment within its column (0–1) */
    fractionOfColumn: number;
    /** Fraction of this segment of the grand total (0–1) */
    fractionOfTotal: number;
    /** Pixel y-offset within the column (from top) */
    y: number;
    /** Pixel height */
    height: number;
    /** Colour assigned to this segment */
    color: string;
    selectionId: ISelectionId | null;
    tooltipExtras: TooltipExtra[];
    rowIndex: number;
}

/** A Marimekko column (one per xCategory value) */
export interface MekkoColumn {
    xCategory: string;
    columnTotal: number;
    /** Fraction of grand total (determines width) */
    fractionOfTotal: number;
    /** Pixel x-offset */
    x: number;
    /** Pixel width */
    width: number;
    segments: MekkoSegment[];
}

/** Additional tooltip field */
export interface TooltipExtra {
    displayName: string;
    value: string;
}

/** Parsed data result from the model pipeline */
export interface ParseResult {
    columns: MekkoColumn[];
    segmentCategories: string[];
    grandTotal: number;
    hasNegatives: boolean;
}

/* ═══════════════════════════════════════════════
   Column Index (data-role → column index mapping)
   ═══════════════════════════════════════════════ */

export interface ColumnIndex {
    xCategory: number;
    segmentCategory: number;
    value: number;
    tooltipFields: number[];
}

/* ═══════════════════════════════════════════════
   RenderConfig
   ═══════════════════════════════════════════════ */

export interface RenderConfig {
    chart: {
        columnGap: number;
        segmentGap: number;
        cornerRadius: number;
        showPercentages: boolean;
        percentThreshold: number;
    };
    axis: {
        showXAxis: boolean;
        xAxisFontSize: number;
        xAxisFontColor: string;
        xLabelRotation: XLabelRotation;
        showYAxis: boolean;
        yAxisFontSize: number;
        yAxisFontColor: string;
        showGridlines: boolean;
        gridlineColor: string;
        showWidthLabels: boolean;
    };
    color: {
        colorPalette: ColorPalette;
        selectedColor: string;
        segmentBorderColor: string;
        segmentBorderWidth: number;
    };
    label: {
        showSegmentLabels: boolean;
        segmentLabelContent: SegmentLabelContent;
        segmentLabelFontSize: number;
        segmentLabelFontColor: string;
    };
    legend: {
        showLegend: boolean;
        legendPosition: LegendPosition;
        legendFontSize: number;
        legendFontColor: string;
    };
}

/* ═══════════════════════════════════════════════
   Interaction Callbacks
   ═══════════════════════════════════════════════ */

export interface ChartCallbacks {
    onSegmentClick: (segment: MekkoSegment, event: MouseEvent) => void;
    onBackgroundClick: () => void;
}
