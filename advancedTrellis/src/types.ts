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
    readonly trellisValue: string;
    readonly categoryValue: string;
    readonly value: number;
    readonly seriesValue: string | null;
    readonly selectionId: ISelectionId;
    readonly tooltipExtras: ReadonlyArray<{ readonly displayName: string; readonly value: string }>;
    /** Colour assigned from palette/series */
    readonly color: string;
}

/** One panel in the trellis grid */
export interface TrellisPanel {
    readonly trellisValue: string;
    readonly dataPoints: readonly TrellisDataPoint[];
    /** Unique category labels in order */
    readonly categories: readonly string[];
    /** Unique series labels in order (empty if no series field) */
    readonly seriesNames: readonly string[];
    /** Per-series grouped data for rendering */
    readonly seriesBuckets: Map<string, TrellisDataPoint[]>;
}

/** Result of the full parse pipeline */
export interface ParseResult {
    readonly panels: readonly TrellisPanel[];
    readonly globalMinValue: number;
    readonly globalMaxValue: number;
    readonly allCategories: readonly string[];
    readonly allSeries: readonly string[];
    readonly hasSeries: boolean;
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
    readonly columns: number;
    readonly rows: number;
    readonly panelWidth: number;
    readonly panelHeight: number;
    readonly totalHeight: number;
}

/* ── Tooltip Item ── */

export interface TooltipItem {
    readonly displayName: string;
    readonly value: string;
}

/* ── RenderConfig ── */

export interface RenderConfig {
    readonly layout: {
        readonly columns: number;
        readonly panelPadding: number;
        readonly panelBorderWidth: number;
        readonly panelBorderColor: string;
        readonly panelBackground: string;
        readonly panelCornerRadius: number;
        readonly panelMinWidth: number;
        readonly panelMinHeight: number;
    };
    readonly chart: {
        readonly chartType: ChartType;
        readonly barCornerRadius: number;
        readonly lineWidth: number;
        readonly lineSmoothing: boolean;
        readonly dotRadius: number;
        readonly areaOpacity: number;
    };
    readonly axis: {
        readonly sharedYScale: boolean;
        readonly showXAxis: boolean;
        readonly showYAxis: boolean;
        readonly showXGridlines: boolean;
        readonly showYGridlines: boolean;
        readonly axisFontSize: number;
        readonly axisFontColor: string;
        readonly gridlineColor: string;
        readonly xLabelRotation: XLabelRotation;
    };
    readonly title: {
        readonly showPanelTitles: boolean;
        readonly titleFontSize: number;
        readonly titleFontColor: string;
        readonly titleAlignment: TitleAlignment;
        readonly titleBackground: string;
    };
    readonly colors: {
        readonly colorPalette: ColorPalette;
        readonly defaultBarColor: string;
        readonly selectedBarColor: string;
    };
    readonly labels: {
        readonly showDataLabels: boolean;
        readonly dataLabelFontSize: number;
        readonly dataLabelFontColor: string;
    };
}

/* ── Interaction Callbacks ── */

export interface PanelCallbacks {
    readonly onClick: (point: TrellisDataPoint, event: MouseEvent) => void;
    readonly onMouseOver: (
        point: TrellisDataPoint,
        x: number,
        y: number,
        event: MouseEvent,
    ) => void;
    readonly onMouseMove: (
        point: TrellisDataPoint,
        x: number,
        y: number,
        event: MouseEvent,
    ) => void;
    readonly onMouseOut: () => void;
}
