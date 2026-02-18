/* ═══════════════════════════════════════════════
   Advanced Trellis – Formatting Settings
   ═══════════════════════════════════════════════ */

"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

import powerbi from "powerbi-visuals-api";

import type {
    RenderConfig,
    ChartType,
    ColorPalette,
    TitleAlignment,
    XLabelRotation,
} from "./types";
import {
    CHART_TYPES,
    COLOR_PALETTES,
    TITLE_ALIGNMENTS,
    X_LABEL_ROTATIONS,
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
    items: string[],
    labels: string[],
    defaultIdx: number,
): formattingSettings.ItemDropdown {
    const dropdownItems = items.map((val, i) => ({
        value: val,
        displayName: labels[i],
    }));
    return new formattingSettings.ItemDropdown({
        name,
        displayName,
        items: dropdownItems,
        value: dropdownItems[defaultIdx],
    });
}

/* ═══════════════════════════════════════════════
   Formatting Cards
   ═══════════════════════════════════════════════ */

/* ── Layout Settings Card ── */

class LayoutSettingsCard extends FormattingSettingsCard {
    columns = num("columns", "Columns (0 = auto)", 0, 0, 10);
    panelPadding = num("panelPadding", "Panel padding", 8, 0, 24);
    panelBorderWidth = num("panelBorderWidth", "Border width", 1, 0, 4);
    panelBorderColor = color("panelBorderColor", "Border color", "#E2E8F0");
    panelBackground = color("panelBackground", "Panel background", "#FFFFFF");
    panelCornerRadius = num("panelCornerRadius", "Corner radius", 4, 0, 16);
    panelMinWidth = num("panelMinWidth", "Min panel width", 160, 80, 400);
    panelMinHeight = num("panelMinHeight", "Min panel height", 120, 60, 300);

    name: string = "layoutSettings";
    displayName: string = "Layout";
    slices: FormattingSettingsSlice[] = [
        this.columns,
        this.panelPadding,
        this.panelBorderWidth,
        this.panelBorderColor,
        this.panelBackground,
        this.panelCornerRadius,
        this.panelMinWidth,
        this.panelMinHeight,
    ];
}

/* ── Chart Settings Card ── */

class ChartSettingsCard extends FormattingSettingsCard {
    chartType = dropdown("chartType", "Chart type", ["bar", "line", "area", "lollipop"], ["Bar", "Line", "Area", "Lollipop"], 0);
    barCornerRadius = num("barCornerRadius", "Bar corner radius", 2, 0, 10);
    lineWidth = num("lineWidth", "Line width", 2, 1, 6);
    lineSmoothing = toggle("lineSmoothing", "Smooth lines", false);
    dotRadius = num("dotRadius", "Dot radius", 3, 0, 8);
    areaOpacity = pct("areaOpacity", "Area opacity %", 20);

    name: string = "chartSettings";
    displayName: string = "Chart";
    slices: FormattingSettingsSlice[] = [
        this.chartType,
        this.barCornerRadius,
        this.lineWidth,
        this.lineSmoothing,
        this.dotRadius,
        this.areaOpacity,
    ];
}

/* ── Axis Settings Card ── */

class AxisSettingsCard extends FormattingSettingsCard {
    sharedYScale = toggle("sharedYScale", "Shared Y scale", true);
    showXAxis = toggle("showXAxis", "Show X axis", true);
    showYAxis = toggle("showYAxis", "Show Y axis", true);
    showXGridlines = toggle("showXGridlines", "Show X gridlines", false);
    showYGridlines = toggle("showYGridlines", "Show Y gridlines", true);
    axisFontSize = num("axisFontSize", "Axis font size", 9, 7, 14);
    axisFontColor = color("axisFontColor", "Axis font color", "#64748B");
    gridlineColor = color("gridlineColor", "Gridline color", "#F1F5F9");
    xLabelRotation = dropdown("xLabelRotation", "X label rotation", ["0", "45", "90"], ["0°", "45°", "90°"], 0);

    name: string = "axisSettings";
    displayName: string = "Axes";
    slices: FormattingSettingsSlice[] = [
        this.sharedYScale,
        this.showXAxis,
        this.showYAxis,
        this.showXGridlines,
        this.showYGridlines,
        this.axisFontSize,
        this.axisFontColor,
        this.gridlineColor,
        this.xLabelRotation,
    ];
}

/* ── Title Settings Card ── */

class TitleSettingsCard extends FormattingSettingsCard {
    showPanelTitles = toggle("showPanelTitles", "Show panel titles", true);
    titleFontSize = num("titleFontSize", "Title font size", 11, 8, 18);
    titleFontColor = color("titleFontColor", "Title font color", "#334155");
    titleAlignment = dropdown("titleAlignment", "Title alignment", ["left", "center"], ["Left", "Center"], 0);
    titleBackground = color("titleBackground", "Title background", "#F8FAFC");

    name: string = "titleSettings";
    displayName: string = "Panel Titles";
    slices: FormattingSettingsSlice[] = [
        this.showPanelTitles,
        this.titleFontSize,
        this.titleFontColor,
        this.titleAlignment,
        this.titleBackground,
    ];
}

/* ── Color Settings Card ── */

class ColorSettingsCard extends FormattingSettingsCard {
    colorPalette = dropdown("colorPalette", "Colour palette", ["default", "pastel", "vivid"], ["Default", "Pastel", "Vivid"], 0);
    defaultBarColor = color("defaultBarColor", "Default bar color", "#3B82F6");
    selectedBarColor = color("selectedBarColor", "Selected bar color", "#2563EB");

    name: string = "colorSettings";
    displayName: string = "Colors";
    slices: FormattingSettingsSlice[] = [
        this.colorPalette,
        this.defaultBarColor,
        this.selectedBarColor,
    ];
}

/* ── Label Settings Card ── */

class LabelSettingsCard extends FormattingSettingsCard {
    showDataLabels = toggle("showDataLabels", "Show data labels", false);
    dataLabelFontSize = num("dataLabelFontSize", "Label font size", 9, 7, 14);
    dataLabelFontColor = color("dataLabelFontColor", "Label font color", "#475569");

    name: string = "labelSettings";
    displayName: string = "Data Labels";
    slices: FormattingSettingsSlice[] = [
        this.showDataLabels,
        this.dataLabelFontSize,
        this.dataLabelFontColor,
    ];
}

/* ═══════════════════════════════════════════════
   Root Formatting Model
   ═══════════════════════════════════════════════ */

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    layoutCard = new LayoutSettingsCard();
    chartCard = new ChartSettingsCard();
    axisCard = new AxisSettingsCard();
    titleCard = new TitleSettingsCard();
    colorCard = new ColorSettingsCard();
    labelCard = new LabelSettingsCard();

    cards = [
        this.layoutCard,
        this.chartCard,
        this.axisCard,
        this.titleCard,
        this.colorCard,
        this.labelCard,
    ];
}

/* ═══════════════════════════════════════════════
   buildRenderConfig()
   Converts formatting model to plain RenderConfig.
   Percent → fraction conversions happen here.
   ═══════════════════════════════════════════════ */

/** Type-safe enum sanitiser — resolves a raw dropdown value to a union type */
function safeEnum<T extends string>(
    val: string | number | undefined | null,
    allowed: readonly T[],
    fallback: T,
): T {
    const s = val != null ? String(val) : undefined;
    if (s && (allowed as readonly string[]).includes(s)) return s as T;
    return fallback;
}

export function buildRenderConfig(
    model: VisualFormattingSettingsModel,
): RenderConfig {
    const lc = model.layoutCard;
    const cc = model.chartCard;
    const ac = model.axisCard;
    const tc = model.titleCard;
    const oc = model.colorCard;
    const lbc = model.labelCard;

    return {
        layout: {
            columns: lc.columns.value,
            panelPadding: lc.panelPadding.value,
            panelBorderWidth: lc.panelBorderWidth.value,
            panelBorderColor: lc.panelBorderColor.value.value,
            panelBackground: lc.panelBackground.value.value,
            panelCornerRadius: lc.panelCornerRadius.value,
            panelMinWidth: lc.panelMinWidth.value,
            panelMinHeight: lc.panelMinHeight.value,
        },
        chart: {
            chartType: safeEnum<ChartType>(cc.chartType.value?.value, CHART_TYPES, "bar"),
            barCornerRadius: cc.barCornerRadius.value,
            lineWidth: cc.lineWidth.value,
            lineSmoothing: cc.lineSmoothing.value,
            dotRadius: cc.dotRadius.value,
            areaOpacity: cc.areaOpacity.value / 100,  /* pct → fraction */
        },
        axis: {
            sharedYScale: ac.sharedYScale.value,
            showXAxis: ac.showXAxis.value,
            showYAxis: ac.showYAxis.value,
            showXGridlines: ac.showXGridlines.value,
            showYGridlines: ac.showYGridlines.value,
            axisFontSize: ac.axisFontSize.value,
            axisFontColor: ac.axisFontColor.value.value,
            gridlineColor: ac.gridlineColor.value.value,
            xLabelRotation: safeEnum<XLabelRotation>(ac.xLabelRotation.value?.value, X_LABEL_ROTATIONS, "0"),
        },
        title: {
            showPanelTitles: tc.showPanelTitles.value,
            titleFontSize: tc.titleFontSize.value,
            titleFontColor: tc.titleFontColor.value.value,
            titleAlignment: safeEnum<TitleAlignment>(tc.titleAlignment.value?.value, TITLE_ALIGNMENTS, "left"),
            titleBackground: tc.titleBackground.value.value,
        },
        colors: {
            colorPalette: safeEnum<ColorPalette>(oc.colorPalette.value?.value, COLOR_PALETTES, "default"),
            defaultBarColor: oc.defaultBarColor.value.value,
            selectedBarColor: oc.selectedBarColor.value.value,
        },
        labels: {
            showDataLabels: lbc.showDataLabels.value,
            dataLabelFontSize: lbc.dataLabelFontSize.value,
            dataLabelFontColor: lbc.dataLabelFontColor.value.value,
        },
    };
}
