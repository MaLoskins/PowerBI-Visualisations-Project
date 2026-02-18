/* ═══════════════════════════════════════════════
   Advanced Trellis – Type Definitions
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

/* ── Literal Unions (as const) ── */

export const CHART_TYPES = ["bar", "line", "area", "lollipop"] as const;
export type ChartType = (typeof CHART_TYPES)[number];

export const COLOR_PALETTES = ["default", "pastel", "vivid"] as const;
export type ColorPalette = (typeof COLOR_PALETTES)[number];

export const TITLE_ALIGNMENTS = ["left", "center"] as const;
export type TitleAlignment = (typeof TITLE_ALIGNMENTS)[number];

export const X_LABEL_ROTATIONS = ["0", "45", "90"] as const;
export type XLabelRotation = (typeof X_LABEL_ROTATIONS)[number];

/* ── Domain Interfaces ── */

/** A single data point within one trellis panel */
export interface TrellisDataPoint {
    trellisValue: string;
    categoryValue: string;
    value: number;
    seriesValue: string | null;
    selectionId: ISelectionId;
    tooltipExtras: { displayName: string; value: string }[];
    /** Colour assigned from palette/series */
    color: string;
}

/** One panel in the trellis grid */
export interface TrellisPanel {
    trellisValue: string;
    dataPoints: TrellisDataPoint[];
    /** Unique category labels in order */
    categories: string[];
    /** Unique series labels in order (empty if no series field) */
    seriesNames: string[];
    /** Per-series grouped data for rendering */
    seriesBuckets: Map<string, TrellisDataPoint[]>;
}

/** Result of the full parse pipeline */
export interface ParseResult {
    panels: TrellisPanel[];
    globalMinValue: number;
    globalMaxValue: number;
    allCategories: string[];
    allSeries: string[];
    hasSeries: boolean;
}

/* ── Column Index ── */

export interface ColumnIndex {
    trellisBy: number;
    category: number;
    value: number;
    series: number;
    tooltipFields: number[];
}

/* ── Layout ── */

export interface GridLayout {
    columns: number;
    rows: number;
    panelWidth: number;
    panelHeight: number;
    totalHeight: number;
}

/* ── Tooltip Item ── */

export interface TooltipItem {
    displayName: string;
    value: string;
}

/* ── RenderConfig ── */

export interface RenderConfig {
    layout: {
        columns: number;
        panelPadding: number;
        panelBorderWidth: number;
        panelBorderColor: string;
        panelBackground: string;
        panelCornerRadius: number;
        panelMinWidth: number;
        panelMinHeight: number;
    };
    chart: {
        chartType: ChartType;
        barCornerRadius: number;
        lineWidth: number;
        lineSmoothing: boolean;
        dotRadius: number;
        areaOpacity: number;
    };
    axis: {
        sharedYScale: boolean;
        showXAxis: boolean;
        showYAxis: boolean;
        showXGridlines: boolean;
        showYGridlines: boolean;
        axisFontSize: number;
        axisFontColor: string;
        gridlineColor: string;
        xLabelRotation: XLabelRotation;
    };
    title: {
        showPanelTitles: boolean;
        titleFontSize: number;
        titleFontColor: string;
        titleAlignment: TitleAlignment;
        titleBackground: string;
    };
    colors: {
        colorPalette: ColorPalette;
        defaultBarColor: string;
        selectedBarColor: string;
    };
    labels: {
        showDataLabels: boolean;
        dataLabelFontSize: number;
        dataLabelFontColor: string;
    };
}

/* ── Interaction Callbacks ── */

export interface PanelCallbacks {
    onClick: (point: TrellisDataPoint, event: MouseEvent) => void;
    onMouseOver: (
        point: TrellisDataPoint,
        x: number,
        y: number,
        event: MouseEvent,
    ) => void;
    onMouseMove: (
        point: TrellisDataPoint,
        x: number,
        y: number,
        event: MouseEvent,
    ) => void;
    onMouseOut: () => void;
}
