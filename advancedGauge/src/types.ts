/* ═══════════════════════════════════════════════
   Advanced Gauge – Types
   Domain interfaces, literal unions, RenderConfig
   ═══════════════════════════════════════════════ */
"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

/* ── Literal unions (as const) ── */

export const VALUE_FORMATS = ["auto", "number", "percent", "currency"] as const;
export type ValueFormat = (typeof VALUE_FORMATS)[number];

/* ── Column index ── */

export interface ColumnIndex {
    value: number;
    target: number;
    minValue: number;
    maxValue: number;
    range1Max: number;
    range2Max: number;
    range3Max: number;
    tooltipFields: number[];
}

/* ── Domain model ── */

/** Parsed gauge data from a single row */
export interface GaugeData {
    value: number;
    target: number | null;
    minValue: number;
    maxValue: number;
    range1Max: number | null;
    range2Max: number | null;
    range3Max: number | null;
    hasRanges: boolean;
    selectionId: ISelectionId | null;
    tooltipItems: TooltipField[];
    /** Column format string from Power BI metadata (e.g., "0.00%") */
    valueFormatString: string;
}

export interface TooltipField {
    displayName: string;
    value: string;
}

/* ── RenderConfig ── */

export interface RenderConfig {
    gauge: {
        startAngle: number;
        endAngle: number;
        arcThickness: number;
        arcCornerRadius: number;
        backgroundArcColor: string;
        backgroundArcOpacity: number;  /* 0–1 fraction */
    };
    needle: {
        showNeedle: boolean;
        needleColor: string;
        needleLength: number;   /* 0–1 fraction */
        needleWidth: number;
        pivotRadius: number;
        pivotColor: string;
        animationDuration: number;
    };
    ranges: {
        range1Color: string;
        range2Color: string;
        range3Color: string;
        rangeBeyondColor: string;
    };
    target: {
        showTarget: boolean;
        targetMarkerColor: string;
        targetMarkerWidth: number;
        targetMarkerLength: number;  /* 0–1 fraction */
        showTargetLabel: boolean;
        targetLabelFontSize: number;
    };
    labels: {
        showValueLabel: boolean;
        valueFontSize: number;
        valueFontColor: string;
        valueFormat: ValueFormat;
        showMinMaxLabels: boolean;
        minMaxFontSize: number;
        minMaxFontColor: string;
        showTitle: boolean;
        titleText: string;
        titleFontSize: number;
        titleFontColor: string;
    };
    colors: {
        defaultBarColor: string;
        selectedBarColor: string;
    };
    ticks: {
        showTicks: boolean;
        tickCount: number;
        tickLength: number;
        tickWidth: number;
        tickColor: string;
        showTickLabels: boolean;
        tickLabelFontSize: number;
        tickLabelFontColor: string;
    };
}

/* ── Gauge geometry (computed layout) ── */

export interface GaugeLayout {
    cx: number;
    cy: number;
    outerRadius: number;
    innerRadius: number;
    startAngleRad: number;
    endAngleRad: number;
}

/* ── Render callbacks ── */

export interface GaugeCallbacks {
    onClick: (e: MouseEvent) => void;
    onMouseOver: (e: MouseEvent, x: number, y: number) => void;
    onMouseMove: (e: MouseEvent, x: number, y: number) => void;
    onMouseOut: () => void;
}
