/* ═══════════════════════════════════════════════
   Advanced Gauge – Settings
   Formatting model + buildRenderConfig()
   S1: settings.ts must NOT import constants.ts;
       palette defaults use literal hex strings.
   ═══════════════════════════════════════════════ */
"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import type { RenderConfig, ValueFormat } from "./types";
import { VALUE_FORMATS } from "./types";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

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
    const dropdownItems = items.map((item, i) => ({ displayName: labels[i], value: item }));
    return new formattingSettings.ItemDropdown({
        name,
        displayName,
        items: dropdownItems,
        value: dropdownItems[defaultIdx],
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
   ═══════════════════════════════════════════════ */

/* ── Gauge Settings ── */
class GaugeSettingsCard extends FormattingSettingsCard {
    startAngle = num("startAngle", "Start Angle", -135, -180, 0);
    endAngle = num("endAngle", "End Angle", 135, 0, 180);
    arcThickness = num("arcThickness", "Arc Thickness", 28, 8, 60);
    arcCornerRadius = num("arcCornerRadius", "Corner Radius", 4, 0, 20);
    backgroundArcColor = color("backgroundArcColor", "Background Arc Color", "#E2E8F0");
    backgroundArcOpacity = pct("backgroundArcOpacity", "Background Arc Opacity", 30);

    name: string = "gaugeSettings";
    displayName: string = "Gauge";
    slices: FormattingSettingsSlice[] = [
        this.startAngle, this.endAngle, this.arcThickness,
        this.arcCornerRadius, this.backgroundArcColor, this.backgroundArcOpacity,
    ];
}

/* ── Needle Settings ── */
class NeedleSettingsCard extends FormattingSettingsCard {
    showNeedle = toggle("showNeedle", "Show Needle", true);
    needleColor = color("needleColor", "Needle Color", "#334155");
    needleLength = pct("needleLength", "Needle Length (%)", 90);
    needleWidth = num("needleWidth", "Needle Width", 3, 1, 8);
    pivotRadius = num("pivotRadius", "Pivot Radius", 6, 2, 16);
    pivotColor = color("pivotColor", "Pivot Color", "#334155");
    animationDuration = num("animationDuration", "Animation Duration (ms)", 800, 0, 2000);

    name: string = "needleSettings";
    displayName: string = "Needle";
    slices: FormattingSettingsSlice[] = [
        this.showNeedle, this.needleColor, this.needleLength,
        this.needleWidth, this.pivotRadius, this.pivotColor, this.animationDuration,
    ];
}

/* ── Range Settings ── */
class RangeSettingsCard extends FormattingSettingsCard {
    range1Color = color("range1Color", "Range 1 Color", "#10B981");
    range2Color = color("range2Color", "Range 2 Color", "#F59E0B");
    range3Color = color("range3Color", "Range 3 Color", "#EF4444");
    rangeBeyondColor = color("rangeBeyondColor", "Beyond Range Color", "#94A3B8");

    name: string = "rangeSettings";
    displayName: string = "Range Colors";
    slices: FormattingSettingsSlice[] = [
        this.range1Color, this.range2Color, this.range3Color, this.rangeBeyondColor,
    ];
}

/* ── Target Settings ── */
class TargetSettingsCard extends FormattingSettingsCard {
    showTarget = toggle("showTarget", "Show Target", true);
    targetMarkerColor = color("targetMarkerColor", "Marker Color", "#1E293B");
    targetMarkerWidth = num("targetMarkerWidth", "Marker Width", 3, 1, 8);
    targetMarkerLength = pct("targetMarkerLength", "Marker Length (%)", 100);
    showTargetLabel = toggle("showTargetLabel", "Show Label", false);
    targetLabelFontSize = num("targetLabelFontSize", "Label Font Size", 10, 7, 18);

    name: string = "targetSettings";
    displayName: string = "Target";
    slices: FormattingSettingsSlice[] = [
        this.showTarget, this.targetMarkerColor, this.targetMarkerWidth,
        this.targetMarkerLength, this.showTargetLabel, this.targetLabelFontSize,
    ];
}

/* ── Label Settings ── */
class LabelSettingsCard extends FormattingSettingsCard {
    showValueLabel = toggle("showValueLabel", "Show Value", true);
    valueFontSize = num("valueFontSize", "Value Font Size", 28, 12, 72);
    valueFontColor = color("valueFontColor", "Value Font Color", "#1E293B");
    valueFormat = dropdown(
        "valueFormat", "Value Format",
        VALUE_FORMATS,
        ["Auto", "Number", "Percent", "Currency"],
        0,
    );
    showMinMaxLabels = toggle("showMinMaxLabels", "Show Min/Max", true);
    minMaxFontSize = num("minMaxFontSize", "Min/Max Font Size", 10, 7, 16);
    minMaxFontColor = color("minMaxFontColor", "Min/Max Font Color", "#94A3B8");
    showTitle = toggle("showTitle", "Show Title", false);
    titleText = text("titleText", "Title Text", "");
    titleFontSize = num("titleFontSize", "Title Font Size", 14, 8, 28);
    titleFontColor = color("titleFontColor", "Title Font Color", "#334155");

    name: string = "labelSettings";
    displayName: string = "Labels";
    slices: FormattingSettingsSlice[] = [
        this.showValueLabel, this.valueFontSize, this.valueFontColor, this.valueFormat,
        this.showMinMaxLabels, this.minMaxFontSize, this.minMaxFontColor,
        this.showTitle, this.titleText, this.titleFontSize, this.titleFontColor,
    ];
}

/* ── Color Settings ── */
class ColorSettingsCard extends FormattingSettingsCard {
    defaultBarColor = color("defaultBarColor", "Default Bar Color", "#3B82F6");
    selectedBarColor = color("selectedBarColor", "Selected Bar Color", "#2563EB");

    name: string = "colorSettings";
    displayName: string = "Colors";
    slices: FormattingSettingsSlice[] = [
        this.defaultBarColor, this.selectedBarColor,
    ];
}

/* ── Tick Settings ── */
class TickSettingsCard extends FormattingSettingsCard {
    showTicks = toggle("showTicks", "Show Ticks", false);
    tickCount = num("tickCount", "Tick Count", 5, 2, 20);
    tickLength = num("tickLength", "Tick Length", 8, 3, 20);
    tickWidth = num("tickWidth", "Tick Width", 1, 0.5, 4);
    tickColor = color("tickColor", "Tick Color", "#94A3B8");
    showTickLabels = toggle("showTickLabels", "Show Labels", false);
    tickLabelFontSize = num("tickLabelFontSize", "Label Font Size", 9, 7, 14);
    tickLabelFontColor = color("tickLabelFontColor", "Label Font Color", "#64748B");

    name: string = "tickSettings";
    displayName: string = "Ticks";
    slices: FormattingSettingsSlice[] = [
        this.showTicks, this.tickCount, this.tickLength, this.tickWidth, this.tickColor,
        this.showTickLabels, this.tickLabelFontSize, this.tickLabelFontColor,
    ];
}

/* ═══════════════════════════════════════════════
   Root Formatting Model
   ═══════════════════════════════════════════════ */

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    gaugeSettingsCard = new GaugeSettingsCard();
    needleSettingsCard = new NeedleSettingsCard();
    rangeSettingsCard = new RangeSettingsCard();
    targetSettingsCard = new TargetSettingsCard();
    labelSettingsCard = new LabelSettingsCard();
    colorSettingsCard = new ColorSettingsCard();
    tickSettingsCard = new TickSettingsCard();

    cards = [
        this.gaugeSettingsCard,
        this.needleSettingsCard,
        this.rangeSettingsCard,
        this.targetSettingsCard,
        this.labelSettingsCard,
        this.colorSettingsCard,
        this.tickSettingsCard,
    ];
}

/* ═══════════════════════════════════════════════
   buildRenderConfig()
   Converts the formatting model into a plain typed
   RenderConfig object. All percent→fraction conversions
   and enum sanitisation happen here.
   ═══════════════════════════════════════════════ */

/** Sanitise a string to a literal union member. */
function safeEnum<T extends string>(
    val: string | undefined,
    allowed: readonly T[],
    fallback: T,
): T {
    if (val && (allowed as readonly string[]).includes(val)) return val as T;
    return fallback;
}

export function buildRenderConfig(model: VisualFormattingSettingsModel): RenderConfig {
    const g = model.gaugeSettingsCard;
    const n = model.needleSettingsCard;
    const r = model.rangeSettingsCard;
    const t = model.targetSettingsCard;
    const l = model.labelSettingsCard;
    const c = model.colorSettingsCard;
    const tk = model.tickSettingsCard;

    return {
        gauge: {
            startAngle: g.startAngle.value,
            endAngle: g.endAngle.value,
            arcThickness: g.arcThickness.value,
            arcCornerRadius: g.arcCornerRadius.value,
            backgroundArcColor: g.backgroundArcColor.value.value,
            backgroundArcOpacity: g.backgroundArcOpacity.value / 100,  /* pct → fraction */
        },
        needle: {
            showNeedle: n.showNeedle.value,
            needleColor: n.needleColor.value.value,
            needleLength: n.needleLength.value / 100,  /* pct → fraction */
            needleWidth: n.needleWidth.value,
            pivotRadius: n.pivotRadius.value,
            pivotColor: n.pivotColor.value.value,
            animationDuration: n.animationDuration.value,
        },
        ranges: {
            range1Color: r.range1Color.value.value,
            range2Color: r.range2Color.value.value,
            range3Color: r.range3Color.value.value,
            rangeBeyondColor: r.rangeBeyondColor.value.value,
        },
        target: {
            showTarget: t.showTarget.value,
            targetMarkerColor: t.targetMarkerColor.value.value,
            targetMarkerWidth: t.targetMarkerWidth.value,
            targetMarkerLength: t.targetMarkerLength.value / 100,  /* pct → fraction */
            showTargetLabel: t.showTargetLabel.value,
            targetLabelFontSize: t.targetLabelFontSize.value,
        },
        labels: {
            showValueLabel: l.showValueLabel.value,
            valueFontSize: l.valueFontSize.value,
            valueFontColor: l.valueFontColor.value.value,
            valueFormat: safeEnum<ValueFormat>(
                l.valueFormat.value?.value as string | undefined,
                VALUE_FORMATS,
                "auto",
            ),
            showMinMaxLabels: l.showMinMaxLabels.value,
            minMaxFontSize: l.minMaxFontSize.value,
            minMaxFontColor: l.minMaxFontColor.value.value,
            showTitle: l.showTitle.value,
            titleText: l.titleText.value,
            titleFontSize: l.titleFontSize.value,
            titleFontColor: l.titleFontColor.value.value,
        },
        colors: {
            defaultBarColor: c.defaultBarColor.value.value,
            selectedBarColor: c.selectedBarColor.value.value,
        },
        ticks: {
            showTicks: tk.showTicks.value,
            tickCount: tk.tickCount.value,
            tickLength: tk.tickLength.value,
            tickWidth: tk.tickWidth.value,
            tickColor: tk.tickColor.value.value,
            showTickLabels: tk.showTickLabels.value,
            tickLabelFontSize: tk.tickLabelFontSize.value,
            tickLabelFontColor: tk.tickLabelFontColor.value.value,
        },
    };
}

