/*
 *  Bullet Chart – Power BI Custom Visual
 *  src/types.ts
 *
 *  Domain interfaces, literal unions, and RenderConfig.
 */
"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

/* ═══════════════════════════════════════════════
   Literal Unions (as const)
   ═══════════════════════════════════════════════ */

export const ORIENTATIONS = ["horizontal", "vertical"] as const;
export type Orientation = (typeof ORIENTATIONS)[number];

export const VALUE_LABEL_POSITIONS = ["inside", "right", "left"] as const;
export type ValueLabelPosition = (typeof VALUE_LABEL_POSITIONS)[number];

/* ═══════════════════════════════════════════════
   Domain Model
   ═══════════════════════════════════════════════ */

/** Single bullet chart item — one row of data. */
export interface BulletItem {
    category: string;
    actual: number;
    target: number | null;
    range1: number | null;
    range2: number | null;
    range3: number | null;
    maxValue: number | null;
    tooltipExtras: TooltipExtra[];
    selectionId: ISelectionId;
    /** Computed: resolved axis max for this item */
    resolvedMax: number;
}

export interface TooltipExtra {
    displayName: string;
    value: string;
}

/** Result from parsing the data view. */
export interface ParseResult {
    items: BulletItem[];
    hasActual: boolean;
    hasTarget: boolean;
    hasRange1: boolean;
    hasRange2: boolean;
    hasRange3: boolean;
}

/* ═══════════════════════════════════════════════
   Column Index
   ═══════════════════════════════════════════════ */

export interface ColumnIndex {
    category: number;
    actual: number;
    target: number;
    range1: number;
    range2: number;
    range3: number;
    maxValue: number;
    tooltipFields: number[];
}

/* ═══════════════════════════════════════════════
   RenderConfig
   ═══════════════════════════════════════════════ */

export interface RenderConfig {
    layout: {
        orientation: Orientation;
        bulletHeight: number;
        bulletSpacing: number;
        categoryWidth: number;
        showCategoryLabels: boolean;
        categoryFontSize: number;
        categoryFontColor: string;
    };
    bar: {
        /** Fraction 0–1 (converted from percent) */
        actualBarHeightFrac: number;
        actualBarColor: string;
        actualBarCornerRadius: number;
    };
    target: {
        showTarget: boolean;
        targetColor: string;
        targetWidth: number;
        /** Fraction 0–1 */
        targetHeightFrac: number;
    };
    range: {
        range1Color: string;
        range2Color: string;
        range3Color: string;
        rangeCornerRadius: number;
    };
    axis: {
        showAxis: boolean;
        axisFontSize: number;
        axisFontColor: string;
        showGridlines: boolean;
        gridlineColor: string;
    };
    label: {
        showValueLabel: boolean;
        valueLabelPosition: ValueLabelPosition;
        valueFontSize: number;
        valueFontColor: string;
        showTargetLabel: boolean;
    };
    color: {
        selectedBarColor: string;
        conditionalColoring: boolean;
        aboveTargetColor: string;
        belowTargetColor: string;
    };
}

/* ═══════════════════════════════════════════════
   Interaction Callbacks
   ═══════════════════════════════════════════════ */

export interface BulletCallbacks {
    onClick: (item: BulletItem, e: MouseEvent) => void;
    onMouseOver: (item: BulletItem, x: number, y: number) => void;
    onMouseMove: (item: BulletItem, x: number, y: number) => void;
    onMouseOut: () => void;
}
