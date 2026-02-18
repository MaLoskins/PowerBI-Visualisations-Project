/* ═══════════════════════════════════════════════
   Radar / Polar Chart – Type Definitions
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

/* ── Literal Unions (no enums – R1) ── */

export const GRID_SHAPES = ["polygon", "circle"] as const;
export type GridShape = (typeof GRID_SHAPES)[number];

export const SCALE_TYPES = ["linear", "percentage"] as const;
export type ScaleType = (typeof SCALE_TYPES)[number];

export const COLOR_PALETTES = ["default", "pastel", "vivid"] as const;
export type ColorPalette = (typeof COLOR_PALETTES)[number];

export const LEGEND_POSITIONS = ["top", "bottom", "right"] as const;
export type LegendPosition = (typeof LEGEND_POSITIONS)[number];

/* ── Domain Model ── */

/** A single data point on one axis for one series */
export interface RadarDataPoint {
    axisName: string;
    axisIndex: number;
    value: number;
    formattedValue: string;
    seriesName: string;
    seriesIndex: number;
    selectionId: ISelectionId;
    tooltipItems: TooltipItem[];
}

export interface TooltipItem {
    displayName: string;
    value: string;
}

/** A complete series polygon */
export interface RadarSeries {
    name: string;
    index: number;
    color: string;
    points: RadarDataPoint[];
}

/** Parsed data ready for rendering */
export interface RadarData {
    axes: string[];
    series: RadarSeries[];
    hasData: boolean;
}

/* ── Column Index ── */

export interface ColumnIndex {
    axisIndex: number;
    valueIndices: number[];
    seriesColumn: boolean;
}

/* ── RenderConfig (R2) ── */

export interface RenderConfig {
    chart: {
        startAngle: number;
        fillOpacity: number;     // 0-1 fraction
        strokeWidth: number;
        dotRadius: number;
        showDots: boolean;
        smoothCurve: boolean;
    };
    grid: {
        gridLevels: number;
        gridShape: GridShape;
        gridColor: string;
        gridWidth: number;
        gridOpacity: number;     // 0-1 fraction
        spokeColor: string;
        spokeWidth: number;
        showGridLabels: boolean;
        gridLabelFontSize: number;
        gridLabelFontColor: string;
    };
    axisLabel: {
        showAxisLabels: boolean;
        axisFontSize: number;
        axisFontColor: string;
        labelPadding: number;
    };
    scale: {
        scaleMin: number;
        scaleMax: number;
        scaleType: ScaleType;
    };
    color: {
        colorPalette: ColorPalette;
        selectedColor: string;
    };
    legend: {
        showLegend: boolean;
        legendPosition: LegendPosition;
        legendFontSize: number;
        legendFontColor: string;
    };
}

/* ── Layout Output ── */

export interface RadarLayout {
    cx: number;
    cy: number;
    radius: number;
    spokeAngles: number[];                // radians per axis
    radialScale: (value: number) => number; // value -> pixel radius
    scaleMin: number;
    scaleMax: number;
}

/* ── Interaction Callbacks ── */

export interface ChartCallbacks {
    onDotClick: (point: RadarDataPoint, event: MouseEvent) => void;
    onPolygonClick: (series: RadarSeries, event: MouseEvent) => void;
    onBackgroundClick: () => void;
    onMouseOver: (point: RadarDataPoint, x: number, y: number) => void;
    onMouseMove: (point: RadarDataPoint, x: number, y: number) => void;
    onMouseOut: () => void;
}
