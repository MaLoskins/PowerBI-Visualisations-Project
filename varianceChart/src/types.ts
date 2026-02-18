/* ═══════════════════════════════════════════════
   types.ts - Domain interfaces, literal unions, RenderConfig
   ═══════════════════════════════════════════════ */
"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

/* ── Literal Unions (as const) ── */

export const ORIENTATIONS = ["vertical", "horizontal"] as const;
export type Orientation = (typeof ORIENTATIONS)[number];

export const VARIANCE_STYLES = ["deltaBar", "lollipop", "arrow", "connectorLine"] as const;
export type VarianceStyle = (typeof VARIANCE_STYLES)[number];

export const LABEL_CONTENTS = ["actual", "variance", "both", "percent"] as const;
export type LabelContent = (typeof LABEL_CONTENTS)[number];

export const LEGEND_POSITIONS = ["top", "bottom"] as const;
export type LegendPosition = (typeof LEGEND_POSITIONS)[number];

export const X_LABEL_ROTATIONS = ["0", "45", "90"] as const;
export type XLabelRotation = (typeof X_LABEL_ROTATIONS)[number];

/* ── Domain Model ── */

/** Single row of parsed variance data (V1) */
export interface VarianceItem {
    category: string;
    actual: number;
    budget: number;
    variance: number;
    variancePercent: number;
    selectionId: ISelectionId;
    tooltipExtras: { displayName: string; value: string }[];
    rowIndex: number;
}

/** Column index mapping from resolveColumns (V2) */
export interface ColumnIndex {
    category: number;
    actual: number;
    budget: number;
    tooltipFields: number[];
}

/** Parse result from parser (V3) */
export interface ParseResult {
    items: VarianceItem[];
    hasData: boolean;
}

/* ── RenderConfig ── */

export interface RenderConfig {
    chart: {
        orientation: Orientation;
        barWidth: number;         // fraction 0-1
        budgetWidth: number;      // fraction 0-1
        barCornerRadius: number;
        barGap: number;
        showVarianceIndicator: boolean;
        varianceStyle: VarianceStyle;
    };
    variancePanel: {
        showVariancePanel: boolean;
        panelWidth: number;       // fraction 0-1
        panelBackground: string;
        panelBorderColor: string;
    };
    colors: {
        actualColor: string;
        budgetColor: string;
        favourableColor: string;
        unfavourableColor: string;
        selectedColor: string;
    };
    axis: {
        showXAxis: boolean;
        showYAxis: boolean;
        axisFontSize: number;
        axisFontColor: string;
        showGridlines: boolean;
        gridlineColor: string;
        xLabelRotation: XLabelRotation;
    };
    labels: {
        showValueLabels: boolean;
        labelContent: LabelContent;
        labelFontSize: number;
        labelFontColor: string;
        showVariancePercent: boolean;
    };
    legend: {
        showLegend: boolean;
        legendPosition: LegendPosition;
        legendFontSize: number;
        legendFontColor: string;
    };
}

/* ── Render Callbacks ── */

export interface ChartCallbacks {
    onClick: (item: VarianceItem | null, e: MouseEvent) => void;
    onMouseOver: (item: VarianceItem, e: MouseEvent) => void;
    onMouseMove: (item: VarianceItem, e: MouseEvent) => void;
    onMouseOut: () => void;
}
