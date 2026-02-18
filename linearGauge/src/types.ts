/* ═══════════════════════════════════════════════
   Linear Gauge – Type Definitions
   Domain interfaces, RenderConfig, literal unions
   ═══════════════════════════════════════════════ */
"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

/* ── Literal Unions (as const + derived type) ── */

export const ORIENTATIONS = ["horizontal", "vertical"] as const;
export type Orientation = (typeof ORIENTATIONS)[number];

export const VALUE_LABEL_POSITIONS = ["inside", "right", "left", "above"] as const;
export type ValueLabelPosition = (typeof VALUE_LABEL_POSITIONS)[number];

export const VALUE_FORMATS = ["auto", "number", "percent", "currency"] as const;
export type ValueFormat = (typeof VALUE_FORMATS)[number];

export const TARGET2_STYLES = ["solid", "dashed"] as const;
export type Target2Style = (typeof TARGET2_STYLES)[number];

/* ── Domain Model ── */

/** A single gauge row parsed from the data view */
export interface GaugeItem {
    category: string;
    value: number;
    target: number | null;
    target2: number | null;
    minValue: number;
    maxValue: number;
    range1Max: number | null;
    range2Max: number | null;
    tooltipExtras: TooltipExtra[];
    selectionId: ISelectionId;
    rowIndex: number;
}

export interface TooltipExtra {
    displayName: string;
    value: string;
}

/** Result of the data parsing pipeline */
export interface ParseResult {
    items: GaugeItem[];
}

/* ── Column Index ── */

export interface ColumnIndex {
    category: number;
    value: number;
    target: number;
    target2: number;
    minValue: number;
    maxValue: number;
    range1Max: number;
    range2Max: number;
    tooltipFields: number[];
}

/* ── RenderConfig ── */

export interface RenderConfig {
    layout: {
        orientation: Orientation;
        gaugeHeight: number;
        gaugeSpacing: number;
        gaugeCornerRadius: number;
        categoryWidth: number;
        categoryFontSize: number;
        categoryFontColor: string;
        showCategoryLabels: boolean;
    };
    bar: {
        barColor: string;
        barOpacity: number;       // 0–1 fraction
        trackColor: string;
        trackBorderColor: string;
        trackBorderWidth: number;
    };
    range: {
        showRanges: boolean;
        range1Color: string;
        range2Color: string;
        rangeBeyondColor: string;
    };
    target: {
        showTarget: boolean;
        targetColor: string;
        targetWidth: number;
        targetHeight: number;     // 0–1 fraction (e.g., 1.4 = 140%)
        target2Color: string;
        target2Width: number;
        target2Style: Target2Style;
    };
    label: {
        showValueLabel: boolean;
        valueLabelPosition: ValueLabelPosition;
        valueFontSize: number;
        valueFontColor: string;
        valueFormat: ValueFormat;
        showTargetLabel: boolean;
        showMinMax: boolean;
    };
    color: {
        colorByCategory: boolean;
        conditionalColoring: boolean;
        aboveTargetColor: string;
        belowTargetColor: string;
        selectedColor: string;
    };
}

/* ── Interaction Callbacks ── */

export interface GaugeCallbacks {
    onClick: (item: GaugeItem, e: MouseEvent) => void;
    onMouseOver: (item: GaugeItem, x: number, y: number) => void;
    onMouseMove: (item: GaugeItem, x: number, y: number) => void;
    onMouseOut: () => void;
}
