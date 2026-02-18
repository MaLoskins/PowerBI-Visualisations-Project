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
    readonly id: string;
    readonly rowIndex: number;
    readonly x: number;
    readonly y: number;
    readonly size: number | null;
    readonly category: string;
    readonly series: string | null;
    readonly playAxisValue: string | null;
    readonly tooltipExtras: readonly TooltipExtra[];
    readonly color: string;
    readonly selectionId: ISelectionId;
}

export interface TooltipExtra {
    readonly displayName: string;
    readonly value: string;
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
    readonly points: ScatterDataPoint[];
    readonly hasSize: boolean;
    readonly hasPlayAxis: boolean;
    readonly hasSeries: boolean;
    readonly playAxisValues: string[];
    readonly seriesValues: string[];
    readonly categoryValues: string[];
}

/* ── RenderConfig (B1) ── */

/**
 * Single bridge between the Power BI formatting model and all render code.
 * Constructed by buildRenderConfig() in settings.ts.
 * Percent values are already converted to 0–1 fractions.
 */
export interface RenderConfig {
    readonly chart: {
        readonly minBubbleRadius: number;
        readonly maxBubbleRadius: number;
        readonly bubbleOpacity: number;       // 0–1 fraction
        readonly bubbleBorderWidth: number;
        readonly bubbleBorderColor: string;
    };
    readonly axis: {
        readonly xAxisLabel: string;
        readonly yAxisLabel: string;
        readonly xAxisScale: AxisScaleType;
        readonly yAxisScale: AxisScaleType;
        readonly xAxisMin: number | null;
        readonly xAxisMax: number | null;
        readonly yAxisMin: number | null;
        readonly yAxisMax: number | null;
        readonly axisFontSize: number;
        readonly axisFontColor: string;
        readonly showGridlines: boolean;
        readonly gridlineColor: string;
        readonly axisLineColor: string;
    };
    readonly quadrant: {
        readonly showQuadrants: boolean;
        readonly quadrantXValue: number;
        readonly quadrantYValue: number;
        readonly quadrantLineColor: string;
        readonly quadrantLineWidth: number;
        readonly quadrantLineStyle: QuadrantLineStyle;
        readonly showQuadrantLabels: boolean;
        readonly q1Label: string;
        readonly q2Label: string;
        readonly q3Label: string;
        readonly q4Label: string;
    };
    readonly trend: {
        readonly showTrendLine: boolean;
        readonly trendLineType: TrendLineType;
        readonly trendLineColor: string;
        readonly trendLineWidth: number;
        readonly trendLineStyle: TrendLineStyle;
    };
    readonly label: {
        readonly showDataLabels: boolean;
        readonly labelContent: LabelContent;
        readonly labelFontSize: number;
        readonly labelFontColor: string;
    };
    readonly color: {
        readonly defaultBubbleColor: string;
        readonly selectedBubbleColor: string;
        readonly colorByCategory: boolean;
    };
    readonly legend: {
        readonly showLegend: boolean;
        readonly legendPosition: LegendPosition;
        readonly legendFontSize: number;
        readonly legendFontColor: string;
    };
    readonly zoom: {
        readonly enableZoom: boolean;
        readonly enablePan: boolean;
        readonly showResetButton: boolean;
    };
    readonly play: {
        readonly playSpeed: number;
        readonly showPlayControls: boolean;
        readonly trailOpacity: number;        // 0–1 fraction
    };
}

/* ── Chart Layout Dimensions ── */

export interface ChartMargins {
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
}

export interface ChartDimensions {
    readonly width: number;
    readonly height: number;
    readonly plotWidth: number;
    readonly plotHeight: number;
    readonly margins: ChartMargins;
}
