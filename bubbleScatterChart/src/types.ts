/* ═══════════════════════════════════════════════
   Bubble Scatter Chart – Type Definitions
   Domain interfaces, literal unions, RenderConfig
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

/* ── Literal Unions (as const) ── */

export const AXIS_SCALE_TYPES = ["linear", "log"] as const;
export type AxisScaleType = (typeof AXIS_SCALE_TYPES)[number];

export const QUADRANT_LINE_STYLES = ["solid", "dashed", "dotted"] as const;
export type QuadrantLineStyle = (typeof QUADRANT_LINE_STYLES)[number];

export const TREND_LINE_TYPES = ["linear", "polynomial", "exponential"] as const;
export type TrendLineType = (typeof TREND_LINE_TYPES)[number];

export const TREND_LINE_STYLES = ["solid", "dashed"] as const;
export type TrendLineStyle = (typeof TREND_LINE_STYLES)[number];

export const LABEL_CONTENTS = ["category", "value", "both"] as const;
export type LabelContent = (typeof LABEL_CONTENTS)[number];

export const LEGEND_POSITIONS = ["top", "bottom", "left", "right"] as const;
export type LegendPosition = (typeof LEGEND_POSITIONS)[number];

/* ── Domain Model ── */

/** A single scatter data point parsed from the table row */
export interface ScatterDataPoint {
    id: string;
    rowIndex: number;
    x: number;
    y: number;
    size: number | null;
    category: string;
    series: string | null;
    playAxisValue: string | null;
    tooltipExtras: TooltipExtra[];
    color: string;
    selectionId: ISelectionId;
}

export interface TooltipExtra {
    displayName: string;
    value: string;
}

/** Result of column resolution */
export interface ColumnIndex {
    xValue: number;
    yValue: number;
    size: number;
    category: number;
    series: number;
    playAxis: number;
    tooltipFields: number[];
}

/** Result of parsing */
export interface ParseResult {
    points: ScatterDataPoint[];
    hasSize: boolean;
    hasPlayAxis: boolean;
    hasSeries: boolean;
    playAxisValues: string[];
    seriesValues: string[];
    categoryValues: string[];
}

/* ── RenderConfig (B1) ── */

/**
 * Single bridge between the Power BI formatting model and all render code.
 * Constructed by buildRenderConfig() in settings.ts.
 * Percent values are already converted to 0–1 fractions.
 */
export interface RenderConfig {
    chart: {
        minBubbleRadius: number;
        maxBubbleRadius: number;
        bubbleOpacity: number;       // 0–1 fraction
        bubbleBorderWidth: number;
        bubbleBorderColor: string;
    };
    axis: {
        xAxisLabel: string;
        yAxisLabel: string;
        xAxisScale: AxisScaleType;
        yAxisScale: AxisScaleType;
        xAxisMin: number | null;
        xAxisMax: number | null;
        yAxisMin: number | null;
        yAxisMax: number | null;
        axisFontSize: number;
        axisFontColor: string;
        showGridlines: boolean;
        gridlineColor: string;
        axisLineColor: string;
    };
    quadrant: {
        showQuadrants: boolean;
        quadrantXValue: number;
        quadrantYValue: number;
        quadrantLineColor: string;
        quadrantLineWidth: number;
        quadrantLineStyle: QuadrantLineStyle;
        showQuadrantLabels: boolean;
        q1Label: string;
        q2Label: string;
        q3Label: string;
        q4Label: string;
    };
    trend: {
        showTrendLine: boolean;
        trendLineType: TrendLineType;
        trendLineColor: string;
        trendLineWidth: number;
        trendLineStyle: TrendLineStyle;
    };
    label: {
        showDataLabels: boolean;
        labelContent: LabelContent;
        labelFontSize: number;
        labelFontColor: string;
    };
    color: {
        defaultBubbleColor: string;
        selectedBubbleColor: string;
        colorByCategory: boolean;
    };
    legend: {
        showLegend: boolean;
        legendPosition: LegendPosition;
        legendFontSize: number;
        legendFontColor: string;
    };
    zoom: {
        enableZoom: boolean;
        enablePan: boolean;
        showResetButton: boolean;
    };
    play: {
        playSpeed: number;
        showPlayControls: boolean;
        trailOpacity: number;        // 0–1 fraction
    };
}

/* ── Chart Layout Dimensions ── */

export interface ChartMargins {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface ChartDimensions {
    width: number;
    height: number;
    plotWidth: number;
    plotHeight: number;
    margins: ChartMargins;
}
