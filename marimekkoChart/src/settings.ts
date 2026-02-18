/*
 *  Marimekko Chart – Power BI Custom Visual
 *  settings.ts — Formatting model + buildRenderConfig()
 *
 *  NOTE: This file must NOT import constants.ts.
 *  Palette defaults use literal hex strings per DEVELOPER-README.md.
 */
"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

import {
    RenderConfig,
    XLabelRotation,
    X_LABEL_ROTATIONS,
    ColorPalette,
    COLOR_PALETTES,
    SegmentLabelContent,
    SEGMENT_LABEL_CONTENTS,
    LegendPosition,
    LEGEND_POSITIONS,
} from "./types";

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
    return new formattingSettings.ItemDropdown({
        name,
        displayName,
        items: items.map((v, i) => ({ displayName: labels[i], value: v })),
        value: { displayName: labels[defaultIdx], value: items[defaultIdx] },
    });
}

/* ═══════════════════════════════════════════════
   Safe enum converter
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
   Card: chartSettings
   ═══════════════════════════════════════════════ */

class ChartSettingsCard extends FormattingSettingsCard {
    columnGap = num("columnGap", "Column Gap", 2, 0, 10);
    segmentGap = num("segmentGap", "Segment Gap", 1, 0, 4);
    cornerRadius = num("cornerRadius", "Corner Radius", 0, 0, 8);
    showPercentages = toggle("showPercentages", "Show Percentages", true);
    percentThreshold = num("percentThreshold", "Percent Threshold", 5, 1, 20);

    name: string = "chartSettings";
    displayName: string = "Chart Settings";
    slices: FormattingSettingsSlice[] = [
        this.columnGap, this.segmentGap, this.cornerRadius,
        this.showPercentages, this.percentThreshold,
    ];
}

/* ═══════════════════════════════════════════════
   Card: axisSettings
   ═══════════════════════════════════════════════ */

class AxisSettingsCard extends FormattingSettingsCard {
    showXAxis = toggle("showXAxis", "Show X Axis", true);
    xAxisFontSize = num("xAxisFontSize", "X Axis Font Size", 10, 7, 16);
    xAxisFontColor = color("xAxisFontColor", "X Axis Font Color", "#475569");
    xLabelRotation = dropdown("xLabelRotation", "X Label Rotation", X_LABEL_ROTATIONS, ["0°", "45°", "90°"], 0);
    showYAxis = toggle("showYAxis", "Show Y Axis", true);
    yAxisFontSize = num("yAxisFontSize", "Y Axis Font Size", 10, 7, 16);
    yAxisFontColor = color("yAxisFontColor", "Y Axis Font Color", "#64748B");
    showGridlines = toggle("showGridlines", "Show Gridlines", true);
    gridlineColor = color("gridlineColor", "Gridline Color", "#F1F5F9");
    showWidthLabels = toggle("showWidthLabels", "Show Width Labels", false);

    name: string = "axisSettings";
    displayName: string = "Axis Settings";
    slices: FormattingSettingsSlice[] = [
        this.showXAxis, this.xAxisFontSize, this.xAxisFontColor, this.xLabelRotation,
        this.showYAxis, this.yAxisFontSize, this.yAxisFontColor,
        this.showGridlines, this.gridlineColor, this.showWidthLabels,
    ];
}

/* ═══════════════════════════════════════════════
   Card: colorSettings
   ═══════════════════════════════════════════════ */

class ColorSettingsCard extends FormattingSettingsCard {
    colorPalette = dropdown("colorPalette", "Color Palette", COLOR_PALETTES, ["Default", "Pastel", "Vivid"], 0);
    selectedColor = color("selectedColor", "Selected Color", "#2563EB");
    segmentBorderColor = color("segmentBorderColor", "Segment Border Color", "#FFFFFF");
    segmentBorderWidth = num("segmentBorderWidth", "Segment Border Width", 1, 0, 3);

    name: string = "colorSettings";
    displayName: string = "Color Settings";
    slices: FormattingSettingsSlice[] = [
        this.colorPalette, this.selectedColor,
        this.segmentBorderColor, this.segmentBorderWidth,
    ];
}

/* ═══════════════════════════════════════════════
   Card: labelSettings
   ═══════════════════════════════════════════════ */

class LabelSettingsCard extends FormattingSettingsCard {
    showSegmentLabels = toggle("showSegmentLabels", "Show Segment Labels", true);
    segmentLabelContent = dropdown("segmentLabelContent", "Label Content", SEGMENT_LABEL_CONTENTS, ["Name", "Percent", "Value", "Name & Percent"], 3);
    segmentLabelFontSize = num("segmentLabelFontSize", "Label Font Size", 9, 7, 14);
    segmentLabelFontColor = color("segmentLabelFontColor", "Label Font Color", "#FFFFFF");

    name: string = "labelSettings";
    displayName: string = "Label Settings";
    slices: FormattingSettingsSlice[] = [
        this.showSegmentLabels, this.segmentLabelContent,
        this.segmentLabelFontSize, this.segmentLabelFontColor,
    ];
}

/* ═══════════════════════════════════════════════
   Card: legendSettings
   ═══════════════════════════════════════════════ */

class LegendSettingsCard extends FormattingSettingsCard {
    showLegend = toggle("showLegend", "Show Legend", true);
    legendPosition = dropdown("legendPosition", "Legend Position", LEGEND_POSITIONS, ["Top", "Bottom", "Right"], 0);
    legendFontSize = num("legendFontSize", "Legend Font Size", 10, 7, 16);
    legendFontColor = color("legendFontColor", "Legend Font Color", "#475569");

    name: string = "legendSettings";
    displayName: string = "Legend Settings";
    slices: FormattingSettingsSlice[] = [
        this.showLegend, this.legendPosition,
        this.legendFontSize, this.legendFontColor,
    ];
}

/* ═══════════════════════════════════════════════
   Root Formatting Settings Model
   ═══════════════════════════════════════════════ */

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    chartSettingsCard = new ChartSettingsCard();
    axisSettingsCard = new AxisSettingsCard();
    colorSettingsCard = new ColorSettingsCard();
    labelSettingsCard = new LabelSettingsCard();
    legendSettingsCard = new LegendSettingsCard();

    cards = [
        this.chartSettingsCard,
        this.axisSettingsCard,
        this.colorSettingsCard,
        this.labelSettingsCard,
        this.legendSettingsCard,
    ];
}

/* ═══════════════════════════════════════════════
   buildRenderConfig()
   Converts formatting model → plain RenderConfig.
   All percent → fraction conversions happen here.
   ═══════════════════════════════════════════════ */

export function buildRenderConfig(model: VisualFormattingSettingsModel): RenderConfig {
    const cs = model.chartSettingsCard;
    const ax = model.axisSettingsCard;
    const co = model.colorSettingsCard;
    const la = model.labelSettingsCard;
    const le = model.legendSettingsCard;

    /** Extract dropdown string value safely (EnumMemberValue may be number) */
    const dropVal = (v: { value?: unknown } | undefined): string | undefined => {
        const raw = v?.value;
        return raw != null ? String(raw) : undefined;
    };

    return {
        chart: {
            columnGap: cs.columnGap.value,
            segmentGap: cs.segmentGap.value,
            cornerRadius: cs.cornerRadius.value,
            showPercentages: cs.showPercentages.value,
            percentThreshold: cs.percentThreshold.value,
        },
        axis: {
            showXAxis: ax.showXAxis.value,
            xAxisFontSize: ax.xAxisFontSize.value,
            xAxisFontColor: ax.xAxisFontColor.value.value,
            xLabelRotation: safeEnum(dropVal(ax.xLabelRotation.value), X_LABEL_ROTATIONS, "0"),
            showYAxis: ax.showYAxis.value,
            yAxisFontSize: ax.yAxisFontSize.value,
            yAxisFontColor: ax.yAxisFontColor.value.value,
            showGridlines: ax.showGridlines.value,
            gridlineColor: ax.gridlineColor.value.value,
            showWidthLabels: ax.showWidthLabels.value,
        },
        color: {
            colorPalette: safeEnum(dropVal(co.colorPalette.value), COLOR_PALETTES, "default"),
            selectedColor: co.selectedColor.value.value,
            segmentBorderColor: co.segmentBorderColor.value.value,
            segmentBorderWidth: co.segmentBorderWidth.value,
        },
        label: {
            showSegmentLabels: la.showSegmentLabels.value,
            segmentLabelContent: safeEnum(dropVal(la.segmentLabelContent.value), SEGMENT_LABEL_CONTENTS, "nameAndPercent"),
            segmentLabelFontSize: la.segmentLabelFontSize.value,
            segmentLabelFontColor: la.segmentLabelFontColor.value.value,
        },
        legend: {
            showLegend: le.showLegend.value,
            legendPosition: safeEnum(dropVal(le.legendPosition.value), LEGEND_POSITIONS, "top"),
            legendFontSize: le.legendFontSize.value,
            legendFontColor: le.legendFontColor.value.value,
        },
    };
}
