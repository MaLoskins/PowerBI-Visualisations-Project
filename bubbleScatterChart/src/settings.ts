/* ═══════════════════════════════════════════════
   Bubble Scatter Chart – Formatting Settings
   Slice factories, card classes, buildRenderConfig()
   settings.ts must NOT import constants.ts (B2)
   ═══════════════════════════════════════════════ */

"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

import {
    RenderConfig,
    AXIS_SCALE_TYPES,
    QUADRANT_LINE_STYLES,
    TREND_LINE_TYPES,
    TREND_LINE_STYLES,
    LABEL_CONTENTS,
    LEGEND_POSITIONS,
} from "./types";

/* ═══════════════════════════════════════════════
   Slice Factories
   ValidatorType is a const enum: Min = 0, Max = 1
   ═══════════════════════════════════════════════ */

function num(
    name: string,
    displayName: string,
    value: number,
    minVal?: number,
    maxVal?: number,
): formattingSettings.NumUpDown {
    const slice = new formattingSettings.NumUpDown({
        name,
        displayName,
        value,
    });
    if (minVal !== undefined || maxVal !== undefined) {
        const opts: { minValue?: { type: 0; value: number }; maxValue?: { type: 1; value: number } } = {};
        if (minVal !== undefined) opts.minValue = { type: 0, value: minVal };
        if (maxVal !== undefined) opts.maxValue = { type: 1, value: maxVal };
        slice.options = opts;
    }
    return slice;
}

function pct(
    name: string,
    displayName: string,
    defaultPct: number,
): formattingSettings.NumUpDown {
    const slice = new formattingSettings.NumUpDown({
        name,
        displayName,
        value: defaultPct,
    });
    slice.options = {
        minValue: { type: 0, value: 0 },
        maxValue: { type: 1, value: 100 },
    };
    return slice;
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
    items: string[],
    labels: string[],
    defaultIdx: number,
): formattingSettings.ItemDropdown {
    const itemsList = items.map((val, i) => ({
        value: val,
        displayName: labels[i] || val,
    }));
    return new formattingSettings.ItemDropdown({
        name,
        displayName,
        items: itemsList,
        value: itemsList[defaultIdx],
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

/* ═══════════════════════════════════════════════
   Formatting Cards
   Card `name` must match capabilities.json object keys
   ═══════════════════════════════════════════════ */

/* ── 1. Chart Settings ── */
class ChartSettingsCard extends FormattingSettingsCard {
    minBubbleRadius = num("minBubbleRadius", "Min Bubble Radius", 4, 2, 20);
    maxBubbleRadius = num("maxBubbleRadius", "Max Bubble Radius", 30, 10, 80);
    bubbleOpacity = pct("bubbleOpacity", "Bubble Opacity (%)", 75);
    bubbleBorderWidth = num("bubbleBorderWidth", "Border Width", 1, 0, 4);
    bubbleBorderColor = color("bubbleBorderColor", "Border Color", "#FFFFFF");

    name: string = "chartSettings";
    displayName: string = "Chart Settings";
    slices: FormattingSettingsSlice[] = [
        this.minBubbleRadius,
        this.maxBubbleRadius,
        this.bubbleOpacity,
        this.bubbleBorderWidth,
        this.bubbleBorderColor,
    ];
}

/* ── 2. Axis Settings ── */
class AxisSettingsCard extends FormattingSettingsCard {
    xAxisLabel = text("xAxisLabel", "X Axis Label", "");
    yAxisLabel = text("yAxisLabel", "Y Axis Label", "");
    xAxisScale = dropdown("xAxisScale", "X Axis Scale", ["linear", "log"], ["Linear", "Logarithmic"], 0);
    yAxisScale = dropdown("yAxisScale", "Y Axis Scale", ["linear", "log"], ["Linear", "Logarithmic"], 0);
    xAxisMin = num("xAxisMin", "X Axis Min (auto if 0)", 0);
    xAxisMax = num("xAxisMax", "X Axis Max (auto if 0)", 0);
    yAxisMin = num("yAxisMin", "Y Axis Min (auto if 0)", 0);
    yAxisMax = num("yAxisMax", "Y Axis Max (auto if 0)", 0);
    axisFontSize = num("axisFontSize", "Font Size", 10, 7, 16);
    axisFontColor = color("axisFontColor", "Font Color", "#64748B");
    showGridlines = toggle("showGridlines", "Show Gridlines", true);
    gridlineColor = color("gridlineColor", "Gridline Color", "#F1F5F9");
    axisLineColor = color("axisLineColor", "Axis Line Color", "#CBD5E1");

    name: string = "axisSettings";
    displayName: string = "Axis Settings";
    slices: FormattingSettingsSlice[] = [
        this.xAxisLabel,
        this.yAxisLabel,
        this.xAxisScale,
        this.yAxisScale,
        this.xAxisMin,
        this.xAxisMax,
        this.yAxisMin,
        this.yAxisMax,
        this.axisFontSize,
        this.axisFontColor,
        this.showGridlines,
        this.gridlineColor,
        this.axisLineColor,
    ];
}

/* ── 3. Quadrant Settings ── */
class QuadrantSettingsCard extends FormattingSettingsCard {
    showQuadrants = toggle("showQuadrants", "Show Quadrants", false);
    quadrantXValue = num("quadrantXValue", "X Centre Line", 0);
    quadrantYValue = num("quadrantYValue", "Y Centre Line", 0);
    quadrantLineColor = color("quadrantLineColor", "Line Color", "#CBD5E1");
    quadrantLineWidth = num("quadrantLineWidth", "Line Width", 1, 0.5, 4);
    quadrantLineStyle = dropdown("quadrantLineStyle", "Line Style", ["solid", "dashed", "dotted"], ["Solid", "Dashed", "Dotted"], 1);
    showQuadrantLabels = toggle("showQuadrantLabels", "Show Labels", false);
    q1Label = text("q1Label", "Q1 Label (top-right)", "Q1");
    q2Label = text("q2Label", "Q2 Label (top-left)", "Q2");
    q3Label = text("q3Label", "Q3 Label (bottom-left)", "Q3");
    q4Label = text("q4Label", "Q4 Label (bottom-right)", "Q4");

    name: string = "quadrantSettings";
    displayName: string = "Quadrant Settings";
    slices: FormattingSettingsSlice[] = [
        this.showQuadrants,
        this.quadrantXValue,
        this.quadrantYValue,
        this.quadrantLineColor,
        this.quadrantLineWidth,
        this.quadrantLineStyle,
        this.showQuadrantLabels,
        this.q1Label,
        this.q2Label,
        this.q3Label,
        this.q4Label,
    ];
}

/* ── 4. Trend Settings ── */
class TrendSettingsCard extends FormattingSettingsCard {
    showTrendLine = toggle("showTrendLine", "Show Trend Line", false);
    trendLineType = dropdown("trendLineType", "Trend Type", ["linear", "polynomial", "exponential"], ["Linear", "Polynomial (deg 2)", "Exponential"], 0);
    trendLineColor = color("trendLineColor", "Line Color", "#94A3B8");
    trendLineWidth = num("trendLineWidth", "Line Width", 1.5, 0.5, 4);
    trendLineStyle = dropdown("trendLineStyle", "Line Style", ["solid", "dashed"], ["Solid", "Dashed"], 1);

    name: string = "trendSettings";
    displayName: string = "Trend Line";
    slices: FormattingSettingsSlice[] = [
        this.showTrendLine,
        this.trendLineType,
        this.trendLineColor,
        this.trendLineWidth,
        this.trendLineStyle,
    ];
}

/* ── 5. Label Settings ── */
class LabelSettingsCard extends FormattingSettingsCard {
    showDataLabels = toggle("showDataLabels", "Show Data Labels", false);
    labelContent = dropdown("labelContent", "Label Content", ["category", "value", "both"], ["Category", "Value", "Both"], 0);
    labelFontSize = num("labelFontSize", "Font Size", 9, 7, 14);
    labelFontColor = color("labelFontColor", "Font Color", "#475569");

    name: string = "labelSettings";
    displayName: string = "Data Labels";
    slices: FormattingSettingsSlice[] = [
        this.showDataLabels,
        this.labelContent,
        this.labelFontSize,
        this.labelFontColor,
    ];
}

/* ── 6. Color Settings ── */
class ColorSettingsCard extends FormattingSettingsCard {
    defaultBubbleColor = color("defaultBubbleColor", "Default Bubble Color", "#3B82F6");
    selectedBubbleColor = color("selectedBubbleColor", "Selected Bubble Color", "#2563EB");
    colorByCategory = toggle("colorByCategory", "Color by Category", true);

    name: string = "colorSettings";
    displayName: string = "Color Settings";
    slices: FormattingSettingsSlice[] = [
        this.defaultBubbleColor,
        this.selectedBubbleColor,
        this.colorByCategory,
    ];
}

/* ── 7. Legend Settings ── */
class LegendSettingsCard extends FormattingSettingsCard {
    showLegend = toggle("showLegend", "Show Legend", true);
    legendPosition = dropdown("legendPosition", "Position", ["top", "bottom", "left", "right"], ["Top", "Bottom", "Left", "Right"], 0);
    legendFontSize = num("legendFontSize", "Font Size", 10, 7, 16);
    legendFontColor = color("legendFontColor", "Font Color", "#475569");

    name: string = "legendSettings";
    displayName: string = "Legend";
    slices: FormattingSettingsSlice[] = [
        this.showLegend,
        this.legendPosition,
        this.legendFontSize,
        this.legendFontColor,
    ];
}

/* ── 8. Zoom Settings ── */
class ZoomSettingsCard extends FormattingSettingsCard {
    enableZoom = toggle("enableZoom", "Enable Zoom", true);
    enablePan = toggle("enablePan", "Enable Pan", true);
    showResetButton = toggle("showResetButton", "Show Reset Button", true);

    name: string = "zoomSettings";
    displayName: string = "Zoom & Pan";
    slices: FormattingSettingsSlice[] = [
        this.enableZoom,
        this.enablePan,
        this.showResetButton,
    ];
}

/* ── 9. Play Settings ── */
class PlaySettingsCard extends FormattingSettingsCard {
    playSpeed = num("playSpeed", "Speed (ms per frame)", 1000, 200, 5000);
    showPlayControls = toggle("showPlayControls", "Show Play Controls", true);
    trailOpacity = pct("trailOpacity", "Trail Opacity (%)", 20);

    name: string = "playSettings";
    displayName: string = "Play Axis";
    slices: FormattingSettingsSlice[] = [
        this.playSpeed,
        this.showPlayControls,
        this.trailOpacity,
    ];
}

/* ═══════════════════════════════════════════════
   Root Formatting Model
   ═══════════════════════════════════════════════ */

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    chartSettingsCard = new ChartSettingsCard();
    axisSettingsCard = new AxisSettingsCard();
    quadrantSettingsCard = new QuadrantSettingsCard();
    trendSettingsCard = new TrendSettingsCard();
    labelSettingsCard = new LabelSettingsCard();
    colorSettingsCard = new ColorSettingsCard();
    legendSettingsCard = new LegendSettingsCard();
    zoomSettingsCard = new ZoomSettingsCard();
    playSettingsCard = new PlaySettingsCard();

    cards = [
        this.chartSettingsCard,
        this.axisSettingsCard,
        this.quadrantSettingsCard,
        this.trendSettingsCard,
        this.labelSettingsCard,
        this.colorSettingsCard,
        this.legendSettingsCard,
        this.zoomSettingsCard,
        this.playSettingsCard,
    ];
}

/* ═══════════════════════════════════════════════
   buildRenderConfig()
   Convert formatting model → plain typed object
   All percent → 0-1, all enums → safeEnum()
   ═══════════════════════════════════════════════ */

function safeEnum<T extends string>(
    val: string | undefined,
    allowed: readonly T[],
    fallback: T,
): T {
    if (val && (allowed as readonly string[]).includes(val)) return val as T;
    return fallback;
}

/** Extract dropdown value as string. IEnumMember.value is string | number. */
function dropdownStr(slice: formattingSettings.ItemDropdown): string | undefined {
    const v = slice.value?.value;
    return v != null ? String(v) : undefined;
}

export function buildRenderConfig(
    model: VisualFormattingSettingsModel,
): RenderConfig {
    const c = model.chartSettingsCard;
    const a = model.axisSettingsCard;
    const q = model.quadrantSettingsCard;
    const t = model.trendSettingsCard;
    const l = model.labelSettingsCard;
    const col = model.colorSettingsCard;
    const leg = model.legendSettingsCard;
    const z = model.zoomSettingsCard;
    const p = model.playSettingsCard;

    return {
        chart: {
            minBubbleRadius: c.minBubbleRadius.value,
            maxBubbleRadius: c.maxBubbleRadius.value,
            bubbleOpacity: c.bubbleOpacity.value / 100,
            bubbleBorderWidth: c.bubbleBorderWidth.value,
            bubbleBorderColor: c.bubbleBorderColor.value.value,
        },
        axis: {
            xAxisLabel: a.xAxisLabel.value,
            yAxisLabel: a.yAxisLabel.value,
            xAxisScale: safeEnum(dropdownStr(a.xAxisScale), AXIS_SCALE_TYPES, "linear"),
            yAxisScale: safeEnum(dropdownStr(a.yAxisScale), AXIS_SCALE_TYPES, "linear"),
            xAxisMin: a.xAxisMin.value === 0 ? null : a.xAxisMin.value,
            xAxisMax: a.xAxisMax.value === 0 ? null : a.xAxisMax.value,
            yAxisMin: a.yAxisMin.value === 0 ? null : a.yAxisMin.value,
            yAxisMax: a.yAxisMax.value === 0 ? null : a.yAxisMax.value,
            axisFontSize: a.axisFontSize.value,
            axisFontColor: a.axisFontColor.value.value,
            showGridlines: a.showGridlines.value,
            gridlineColor: a.gridlineColor.value.value,
            axisLineColor: a.axisLineColor.value.value,
        },
        quadrant: {
            showQuadrants: q.showQuadrants.value,
            quadrantXValue: q.quadrantXValue.value,
            quadrantYValue: q.quadrantYValue.value,
            quadrantLineColor: q.quadrantLineColor.value.value,
            quadrantLineWidth: q.quadrantLineWidth.value,
            quadrantLineStyle: safeEnum(dropdownStr(q.quadrantLineStyle), QUADRANT_LINE_STYLES, "dashed"),
            showQuadrantLabels: q.showQuadrantLabels.value,
            q1Label: q.q1Label.value,
            q2Label: q.q2Label.value,
            q3Label: q.q3Label.value,
            q4Label: q.q4Label.value,
        },
        trend: {
            showTrendLine: t.showTrendLine.value,
            trendLineType: safeEnum(dropdownStr(t.trendLineType), TREND_LINE_TYPES, "linear"),
            trendLineColor: t.trendLineColor.value.value,
            trendLineWidth: t.trendLineWidth.value,
            trendLineStyle: safeEnum(dropdownStr(t.trendLineStyle), TREND_LINE_STYLES, "dashed"),
        },
        label: {
            showDataLabels: l.showDataLabels.value,
            labelContent: safeEnum(dropdownStr(l.labelContent), LABEL_CONTENTS, "category"),
            labelFontSize: l.labelFontSize.value,
            labelFontColor: l.labelFontColor.value.value,
        },
        color: {
            defaultBubbleColor: col.defaultBubbleColor.value.value,
            selectedBubbleColor: col.selectedBubbleColor.value.value,
            colorByCategory: col.colorByCategory.value,
        },
        legend: {
            showLegend: leg.showLegend.value,
            legendPosition: safeEnum(dropdownStr(leg.legendPosition), LEGEND_POSITIONS, "top"),
            legendFontSize: leg.legendFontSize.value,
            legendFontColor: leg.legendFontColor.value.value,
        },
        zoom: {
            enableZoom: z.enableZoom.value,
            enablePan: z.enablePan.value,
            showResetButton: z.showResetButton.value,
        },
        play: {
            playSpeed: p.playSpeed.value,
            showPlayControls: p.showPlayControls.value,
            trailOpacity: p.trailOpacity.value / 100,
        },
    };
}
