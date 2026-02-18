/* ═══════════════════════════════════════════════
   Multi-Axes Combo Chart — Type Definitions
   ═══════════════════════════════════════════════ */
"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

/* ── Literal Unions (as const) ── */

export const CHART_TYPES = ["bar", "line", "area", "none"] as const;
export type ChartType = (typeof CHART_TYPES)[number];

export const AXIS_BINDINGS = ["leftPrimary", "leftSecondary", "right"] as const;
export type AxisBinding = (typeof AXIS_BINDINGS)[number];

export const LINE_STYLES = ["solid", "dashed", "dotted"] as const;
export type LineStyle = (typeof LINE_STYLES)[number];

export const LABEL_ROTATIONS = ["0", "45", "90"] as const;
export type LabelRotation = (typeof LABEL_ROTATIONS)[number];

export const LEGEND_POSITIONS = ["top", "bottom"] as const;
export type LegendPosition = (typeof LEGEND_POSITIONS)[number];

export const SERIES_INDICES = [0, 1, 2, 3, 4, 5] as const;
export type SeriesIndex = (typeof SERIES_INDICES)[number];

export const MAX_SERIES = 6;

/* ── Domain Model ── */

export interface CategoryDataPoint {
    categoryLabel: string;
    categoryIndex: number;
    values: (number | null)[];
    selectionId: ISelectionId;
    tooltipExtras: TooltipExtra[];
}

export interface TooltipExtra {
    displayName: string;
    value: string;
}

export interface ParsedData {
    categories: CategoryDataPoint[];
    measureNames: string[];
    measureCount: number;
}

/* ── Column Index ── */

export interface ColumnIndex {
    xCategoryIdx: number;
    measureIndices: (number | null)[];
    tooltipIndices: number[];
}

/* ── Computed Layout ── */

export interface ChartLayout {
    chartLeft: number;
    chartTop: number;
    chartWidth: number;
    chartHeight: number;
    leftPrimaryAxisWidth: number;
    leftSecondaryAxisWidth: number;
    rightAxisWidth: number;
    legendHeight: number;
    xAxisHeight: number;
    totalWidth: number;
    totalHeight: number;
    hasLeftPrimary: boolean;
    hasLeftSecondary: boolean;
    hasRight: boolean;
}

/* ── RenderConfig (M1) — single bridge between settings and render ── */

export interface SeriesConfig {
    chartType: ChartType;
    axis: AxisBinding;
    color: string;
    lineWidth: number;
    lineStyle: LineStyle;
    dotRadius: number;
    areaOpacity: number;
    barCornerRadius: number;
}

export interface YAxisConfig {
    showAxis: boolean;
    axisLabel: string;
    axisFontSize: number;
    axisFontColor: string;
    axisMin: number | null;
    axisMax: number | null;
    showGridlines: boolean;
}

export interface RenderConfig {
    series: SeriesConfig[];
    xAxis: {
        showXAxis: boolean;
        xAxisFontSize: number;
        xAxisFontColor: string;
        xLabelRotation: LabelRotation;
        showXGridlines: boolean;
        gridlineColor: string;
    };
    yAxisLeft: YAxisConfig;
    yAxisLeftSecondary: YAxisConfig;
    yAxisRight: YAxisConfig;
    legend: {
        showLegend: boolean;
        legendPosition: LegendPosition;
        legendFontSize: number;
        legendFontColor: string;
    };
    labels: {
        showDataLabels: boolean;
        dataLabelFontSize: number;
        dataLabelFontColor: string;
    };
    colors: {
        selectedColor: string;
    };
}

/* ── Axis Scale Map ── */

export interface AxisScaleEntry {
    binding: AxisBinding;
    domain: [number, number];
    seriesIndices: number[];
}
