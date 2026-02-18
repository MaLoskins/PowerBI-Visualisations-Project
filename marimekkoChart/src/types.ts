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
    readonly xCategory: string;
    readonly segmentCategory: string;
    readonly value: number;
    /** Absolute value used for computation (handles negatives) */
    readonly absValue: number;
    readonly isNegative: boolean;
    /** Fraction of this segment within its column (0–1) */
    readonly fractionOfColumn: number;
    /** Fraction of this segment of the grand total (0–1) */
    readonly fractionOfTotal: number;
    /** Pixel y-offset within the column (from top) — set by layout pass */
    y: number;
    /** Pixel height — set by layout pass */
    height: number;
    /** Colour assigned to this segment — set by render */
    color: string;
    readonly selectionId: ISelectionId | null;
    readonly tooltipExtras: readonly TooltipExtra[];
    readonly rowIndex: number;
}

/** A Marimekko column (one per xCategory value) */
export interface MekkoColumn {
    readonly xCategory: string;
    readonly columnTotal: number;
    /** Fraction of grand total (determines width) */
    readonly fractionOfTotal: number;
    /** Pixel x-offset — set by layout pass */
    x: number;
    /** Pixel width — set by layout pass */
    width: number;
    readonly segments: MekkoSegment[];
}

/** Additional tooltip field */
export interface TooltipExtra {
    readonly displayName: string;
    readonly value: string;
}

/** Parsed data result from the model pipeline */
export interface ParseResult {
    readonly columns: MekkoColumn[];
    readonly segmentCategories: readonly string[];
    readonly grandTotal: number;
    readonly hasNegatives: boolean;
}

/* ═══════════════════════════════════════════════
   Column Index (data-role → column index mapping)
   ═══════════════════════════════════════════════ */

export interface ColumnIndex {
    readonly xCategory: number;
    readonly segmentCategory: number;
    readonly value: number;
    readonly tooltipFields: readonly number[];
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
