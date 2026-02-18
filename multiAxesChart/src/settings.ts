/* ═══════════════════════════════════════════════
   Multi-Axes Combo Chart — Formatting Settings
   Settings.ts must NOT import constants.ts (M3).
   Palette defaults use literal hex strings.
   ═══════════════════════════════════════════════ */
"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import type {
    RenderConfig,
    SeriesConfig,
    YAxisConfig,
    ChartType,
    AxisBinding,
    LineStyle,
    LabelRotation,
    LegendPosition,
} from "./types";
import {
    CHART_TYPES,
    AXIS_BINDINGS,
    LINE_STYLES,
    LABEL_ROTATIONS,
    LEGEND_POSITIONS,
} from "./types";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import Model = formattingSettings.Model;

/* ═══════════════════════════════════════════════
   Slice Factories
   ═══════════════════════════════════════════════ */

function num(
    name: string,
    displayName: string,
    value: number,
    min: number,
    max: number,
): formattingSettings.NumUpDown {
    return new formattingSettings.NumUpDown({
        name,
        displayName,
        value,
        options: { minValue: { type: powerbi.visuals.ValidatorType.Min, value: min }, maxValue: { type: powerbi.visuals.ValidatorType.Max, value: max } },
    });
}

function pct(
    name: string,
    displayName: string,
    defaultPct: number,
): formattingSettings.NumUpDown {
    return new formattingSettings.NumUpDown({
        name,
        displayName,
        value: defaultPct,
        options: { minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 }, maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 100 } },
    });
}

function color(
    name: string,
    displayName: string,
    hex: string,
): formattingSettings.ColorPicker {
    return new formattingSettings.ColorPicker({
        name,
        displayName,
        value: { value: hex },
    });
}

function toggle(
    name: string,
    displayName: string,
    value: boolean,
): formattingSettings.ToggleSwitch {
    return new formattingSettings.ToggleSwitch({
        name,
        displayName,
        value,
    });
}

function dropdown(
    name: string,
    displayName: string,
    items: readonly string[],
    labels: string[],
    defaultIdx: number,
): formattingSettings.ItemDropdown {
    const enumItems = items.map((v, i) => ({ value: v, displayName: labels[i] }));
    return new formattingSettings.ItemDropdown({
        name,
        displayName,
        items: enumItems,
        value: enumItems[defaultIdx],
    });
}

function text(
    name: string,
    displayName: string,
    value: string,
): formattingSettings.TextInput {
    return new formattingSettings.TextInput({
        name,
        displayName,
        value,
        placeholder: "",
    });
}

function numOptional(
    name: string,
    displayName: string,
): formattingSettings.NumUpDown {
    return new formattingSettings.NumUpDown({
        name,
        displayName,
        value: null as unknown as number,
    });
}

/* ── Import powerbi for ValidatorType ── */
import powerbi from "powerbi-visuals-api";

/* ── Palette literals (not imported from constants) ── */
const SERIES_DEFAULT_COLORS = [
    "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444", "#06B6D4",
];
const SERIES_DEFAULT_CHART_TYPES_IDX = [0, 1, 2, 0, 1, 2]; // bar, line, area, bar, line, area
const CHART_TYPE_VALUES = ["bar", "line", "area", "none"];
const CHART_TYPE_LABELS = ["Bar", "Line", "Area", "None"];
const AXIS_VALUES = ["leftPrimary", "leftSecondary", "right"];
const AXIS_LABELS = ["Left Primary", "Left Secondary", "Right"];
const LINE_STYLE_VALUES = ["solid", "dashed", "dotted"];
const LINE_STYLE_LABELS = ["Solid", "Dashed", "Dotted"];

/* ═══════════════════════════════════════════════
   Series Settings Cards (6 identical shapes)
   ═══════════════════════════════════════════════ */

function createSeriesCard(index: number, cardName: string, displayName: string): SeriesCardSettings {
    return new SeriesCardSettings(index, cardName, displayName);
}

class SeriesCardSettings extends FormattingSettingsCard {
    chartType: formattingSettings.ItemDropdown;
    axis: formattingSettings.ItemDropdown;
    color: formattingSettings.ColorPicker;
    lineWidth: formattingSettings.NumUpDown;
    lineStyle: formattingSettings.ItemDropdown;
    dotRadius: formattingSettings.NumUpDown;
    areaOpacity: formattingSettings.NumUpDown;
    barCornerRadius: formattingSettings.NumUpDown;

    declare name: string;
    declare displayName: string;
    declare slices: FormattingSettingsSlice[];

    constructor(index: number, cardName: string, cardDisplayName: string) {
        super();
        this.chartType = dropdown("chartType", "Chart Type", CHART_TYPE_VALUES, CHART_TYPE_LABELS, SERIES_DEFAULT_CHART_TYPES_IDX[index]);
        this.axis = dropdown("axis", "Axis", AXIS_VALUES, AXIS_LABELS, 0);
        this.color = color("color", "Color", SERIES_DEFAULT_COLORS[index]);
        this.lineWidth = num("lineWidth", "Line Width", 2, 1, 6);
        this.lineStyle = dropdown("lineStyle", "Line Style", LINE_STYLE_VALUES, LINE_STYLE_LABELS, 0);
        this.dotRadius = num("dotRadius", "Dot Radius", 0, 0, 6);
        this.areaOpacity = pct("areaOpacity", "Area Opacity (%)", 20);
        this.barCornerRadius = num("barCornerRadius", "Bar Corner Radius", 2, 0, 10);

        this.name = cardName;
        this.displayName = cardDisplayName;
        this.slices = [
            this.chartType, this.axis, this.color, this.lineWidth,
            this.lineStyle, this.dotRadius, this.areaOpacity, this.barCornerRadius,
        ];
    }
}

/* ═══════════════════════════════════════════════
   X-Axis Settings Card
   ═══════════════════════════════════════════════ */

class XAxisCardSettings extends FormattingSettingsCard {
    showXAxis = toggle("showXAxis", "Show X Axis", true);
    xAxisFontSize = num("xAxisFontSize", "Font Size", 10, 7, 16);
    xAxisFontColor = color("xAxisFontColor", "Font Color", "#64748B");
    xLabelRotation = dropdown("xLabelRotation", "Label Rotation", ["0", "45", "90"], ["0°", "45°", "90°"], 0);
    showXGridlines = toggle("showXGridlines", "Show Gridlines", false);
    gridlineColor = color("gridlineColor", "Gridline Color", "#F1F5F9");

    name = "xAxisSettings";
    displayName = "X Axis";
    slices: FormattingSettingsSlice[] = [
        this.showXAxis, this.xAxisFontSize, this.xAxisFontColor,
        this.xLabelRotation, this.showXGridlines, this.gridlineColor,
    ];
}

/* ═══════════════════════════════════════════════
   Y-Axis Settings Cards
   ═══════════════════════════════════════════════ */

class YAxisCardSettings extends FormattingSettingsCard {
    showAxis = toggle("showAxis", "Show Axis", true);
    axisLabel = text("axisLabel", "Axis Label", "");
    axisFontSize = num("axisFontSize", "Font Size", 10, 7, 16);
    axisFontColor = color("axisFontColor", "Font Color", "#64748B");
    axisMin = numOptional("axisMin", "Axis Min (auto if empty)");
    axisMax = numOptional("axisMax", "Axis Max (auto if empty)");
    showGridlines = toggle("showGridlines", "Show Gridlines", true);

    declare name: string;
    declare displayName: string;
    declare slices: FormattingSettingsSlice[];

    constructor(cardName: string, cardDisplayName: string) {
        super();
        this.name = cardName;
        this.displayName = cardDisplayName;
        this.slices = [
            this.showAxis, this.axisLabel, this.axisFontSize, this.axisFontColor,
            this.axisMin, this.axisMax, this.showGridlines,
        ];
    }
}

/* ═══════════════════════════════════════════════
   Legend Settings Card
   ═══════════════════════════════════════════════ */

class LegendCardSettings extends FormattingSettingsCard {
    showLegend = toggle("showLegend", "Show Legend", true);
    legendPosition = dropdown("legendPosition", "Position", ["top", "bottom"], ["Top", "Bottom"], 0);
    legendFontSize = num("legendFontSize", "Font Size", 10, 7, 16);
    legendFontColor = color("legendFontColor", "Font Color", "#475569");

    name = "legendSettings";
    displayName = "Legend";
    slices: FormattingSettingsSlice[] = [
        this.showLegend, this.legendPosition, this.legendFontSize, this.legendFontColor,
    ];
}

/* ═══════════════════════════════════════════════
   Label Settings Card
   ═══════════════════════════════════════════════ */

class LabelCardSettings extends FormattingSettingsCard {
    showDataLabels = toggle("showDataLabels", "Show Data Labels", false);
    dataLabelFontSize = num("dataLabelFontSize", "Font Size", 9, 7, 14);
    dataLabelFontColor = color("dataLabelFontColor", "Font Color", "#475569");

    name = "labelSettings";
    displayName = "Data Labels";
    slices: FormattingSettingsSlice[] = [
        this.showDataLabels, this.dataLabelFontSize, this.dataLabelFontColor,
    ];
}

/* ═══════════════════════════════════════════════
   Color Settings Card
   ═══════════════════════════════════════════════ */

class ColorCardSettings extends FormattingSettingsCard {
    selectedColor = color("selectedColor", "Selection Highlight", "#2563EB");

    name = "colorSettings";
    displayName = "Selection Colors";
    slices: FormattingSettingsSlice[] = [this.selectedColor];
}

/* ═══════════════════════════════════════════════
   Root Formatting Model
   ═══════════════════════════════════════════════ */

export class VisualFormattingSettingsModel extends Model {
    series1Card = new SeriesCardSettings(0, "series1Settings", "Series 1");
    series2Card = new SeriesCardSettings(1, "series2Settings", "Series 2");
    series3Card = new SeriesCardSettings(2, "series3Settings", "Series 3");
    series4Card = new SeriesCardSettings(3, "series4Settings", "Series 4");
    series5Card = new SeriesCardSettings(4, "series5Settings", "Series 5");
    series6Card = new SeriesCardSettings(5, "series6Settings", "Series 6");

    xAxisCard = new XAxisCardSettings();
    yAxisLeftCard = new YAxisCardSettings("yAxisLeftSettings", "Y Axis — Left Primary");
    yAxisLeftSecondaryCard = new YAxisCardSettings("yAxisLeftSecondarySettings", "Y Axis — Left Secondary");
    yAxisRightCard = new YAxisCardSettings("yAxisRightSettings", "Y Axis — Right");

    legendCard = new LegendCardSettings();
    labelCard = new LabelCardSettings();
    colorCard = new ColorCardSettings();

    cards = [
        this.series1Card, this.series2Card, this.series3Card,
        this.series4Card, this.series5Card, this.series6Card,
        this.xAxisCard,
        this.yAxisLeftCard, this.yAxisLeftSecondaryCard, this.yAxisRightCard,
        this.legendCard, this.labelCard, this.colorCard,
    ];
}

/* ═══════════════════════════════════════════════
   safeEnum — Sanitise string→union at the
   settings boundary (M4)
   ═══════════════════════════════════════════════ */

function safeEnum<T extends string>(
    val: string | undefined,
    allowed: readonly T[],
    fallback: T,
): T {
    if (val && (allowed as readonly string[]).includes(val)) return val as T;
    return fallback;
}

/* ═══════════════════════════════════════════════
   buildRenderConfig — Single bridge from
   formatting model to render code (M5)
   ═══════════════════════════════════════════════ */

function extractSeriesConfig(card: SeriesCardSettings): SeriesConfig {
    return {
        chartType: safeEnum(card.chartType.value?.value as string | undefined, CHART_TYPES, "bar"),
        axis: safeEnum(card.axis.value?.value as string | undefined, AXIS_BINDINGS, "leftPrimary"),
        color: card.color.value.value || "#3B82F6",
        lineWidth: card.lineWidth.value ?? 2,
        lineStyle: safeEnum(card.lineStyle.value?.value as string | undefined, LINE_STYLES, "solid"),
        dotRadius: card.dotRadius.value ?? 0,
        areaOpacity: (card.areaOpacity.value ?? 20) / 100,
        barCornerRadius: card.barCornerRadius.value ?? 2,
    };
}

function extractYAxisConfig(card: YAxisCardSettings): YAxisConfig {
    return {
        showAxis: card.showAxis.value ?? true,
        axisLabel: card.axisLabel.value ?? "",
        axisFontSize: card.axisFontSize.value ?? 10,
        axisFontColor: card.axisFontColor.value.value || "#64748B",
        axisMin: (card.axisMin.value != null && !isNaN(card.axisMin.value)) ? card.axisMin.value : null,
        axisMax: (card.axisMax.value != null && !isNaN(card.axisMax.value)) ? card.axisMax.value : null,
        showGridlines: card.showGridlines.value ?? true,
    };
}

export function buildRenderConfig(model: VisualFormattingSettingsModel): RenderConfig {
    const seriesCards = [
        model.series1Card, model.series2Card, model.series3Card,
        model.series4Card, model.series5Card, model.series6Card,
    ];

    return {
        series: seriesCards.map(extractSeriesConfig),
        xAxis: {
            showXAxis: model.xAxisCard.showXAxis.value ?? true,
            xAxisFontSize: model.xAxisCard.xAxisFontSize.value ?? 10,
            xAxisFontColor: model.xAxisCard.xAxisFontColor.value.value || "#64748B",
            xLabelRotation: safeEnum(
                model.xAxisCard.xLabelRotation.value?.value as string | undefined,
                LABEL_ROTATIONS,
                "0",
            ),
            showXGridlines: model.xAxisCard.showXGridlines.value ?? false,
            gridlineColor: model.xAxisCard.gridlineColor.value.value || "#F1F5F9",
        },
        yAxisLeft: extractYAxisConfig(model.yAxisLeftCard),
        yAxisLeftSecondary: extractYAxisConfig(model.yAxisLeftSecondaryCard),
        yAxisRight: extractYAxisConfig(model.yAxisRightCard),
        legend: {
            showLegend: model.legendCard.showLegend.value ?? true,
            legendPosition: safeEnum(
                model.legendCard.legendPosition.value?.value as string | undefined,
                LEGEND_POSITIONS,
                "top",
            ),
            legendFontSize: model.legendCard.legendFontSize.value ?? 10,
            legendFontColor: model.legendCard.legendFontColor.value.value || "#475569",
        },
        labels: {
            showDataLabels: model.labelCard.showDataLabels.value ?? false,
            dataLabelFontSize: model.labelCard.dataLabelFontSize.value ?? 9,
            dataLabelFontColor: model.labelCard.dataLabelFontColor.value.value || "#475569",
        },
        colors: {
            selectedColor: model.colorCard.selectedColor.value.value || "#2563EB",
        },
    };
}
