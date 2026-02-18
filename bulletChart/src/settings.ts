/*
 *  Bullet Chart – Power BI Custom Visual
 *  src/settings.ts
 *
 *  Formatting settings model + buildRenderConfig().
 *  NOTE: This file must NOT import constants.ts — palette defaults use literal hex strings.
 */
"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import {
    RenderConfig,
    Orientation,
    ORIENTATIONS,
    ValueLabelPosition,
    VALUE_LABEL_POSITIONS,
} from "./types";

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
    minValue: number,
    maxValue: number,
): formattingSettings.NumUpDown {
    return new formattingSettings.NumUpDown({
        name,
        displayName,
        value,
        options: { minValue: { type: powerbi.visuals.ValidatorType.Min, value: minValue }, maxValue: { type: powerbi.visuals.ValidatorType.Max, value: maxValue } },
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
    items: { value: string; displayName: string }[],
    defaultIdx: number,
): formattingSettings.ItemDropdown {
    return new formattingSettings.ItemDropdown({
        name,
        displayName,
        items,
        value: items[defaultIdx],
    });
}

/* ═══════════════════════════════════════════════
   Formatting Cards
   ═══════════════════════════════════════════════ */

/* ── Layout Settings ── */
class LayoutSettingsCard extends FormattingSettingsCard {
    orientation = dropdown("orientation", "Orientation", [
        { value: "horizontal", displayName: "Horizontal" },
        { value: "vertical", displayName: "Vertical" },
    ], 0);
    bulletHeight = num("bulletHeight", "Bullet Height", 32, 16, 80);
    bulletSpacing = num("bulletSpacing", "Bullet Spacing", 8, 0, 24);
    categoryWidth = num("categoryWidth", "Category Label Width", 120, 40, 300);
    showCategoryLabels = toggle("showCategoryLabels", "Show Category Labels", true);
    categoryFontSize = num("categoryFontSize", "Category Font Size", 11, 7, 18);
    categoryFontColor = color("categoryFontColor", "Category Font Color", "#334155");

    name: string = "layoutSettings";
    displayName: string = "Layout";
    slices: FormattingSettingsSlice[] = [
        this.orientation,
        this.bulletHeight,
        this.bulletSpacing,
        this.categoryWidth,
        this.showCategoryLabels,
        this.categoryFontSize,
        this.categoryFontColor,
    ];
}

/* ── Bar Settings ── */
class BarSettingsCard extends FormattingSettingsCard {
    actualBarHeightPct = pct("actualBarHeightPct", "Actual Bar Height %", 50);
    actualBarColor = color("actualBarColor", "Actual Bar Color", "#1E293B");
    actualBarCornerRadius = num("actualBarCornerRadius", "Corner Radius", 0, 0, 8);

    name: string = "barSettings";
    displayName: string = "Actual Bar";
    slices: FormattingSettingsSlice[] = [
        this.actualBarHeightPct,
        this.actualBarColor,
        this.actualBarCornerRadius,
    ];
}

/* ── Target Settings ── */
class TargetSettingsCard extends FormattingSettingsCard {
    showTarget = toggle("showTarget", "Show Target", true);
    targetColor = color("targetColor", "Target Color", "#0F172A");
    targetWidth = num("targetWidth", "Target Width", 3, 1, 8);
    targetHeightPct = pct("targetHeightPct", "Target Height %", 65);

    name: string = "targetSettings";
    displayName: string = "Target Marker";
    slices: FormattingSettingsSlice[] = [
        this.showTarget,
        this.targetColor,
        this.targetWidth,
        this.targetHeightPct,
    ];
}

/* ── Range Settings ── */
class RangeSettingsCard extends FormattingSettingsCard {
    range1Color = color("range1Color", "Range 1 Color (Bad)", "#E2E8F0");
    range2Color = color("range2Color", "Range 2 Color (Satisfactory)", "#CBD5E1");
    range3Color = color("range3Color", "Range 3 Color (Good)", "#F1F5F9");
    rangeCornerRadius = num("rangeCornerRadius", "Range Corner Radius", 0, 0, 8);

    name: string = "rangeSettings";
    displayName: string = "Qualitative Ranges";
    slices: FormattingSettingsSlice[] = [
        this.range1Color,
        this.range2Color,
        this.range3Color,
        this.rangeCornerRadius,
    ];
}

/* ── Axis Settings ── */
class AxisSettingsCard extends FormattingSettingsCard {
    showAxis = toggle("showAxis", "Show Axis", true);
    axisFontSize = num("axisFontSize", "Axis Font Size", 9, 7, 14);
    axisFontColor = color("axisFontColor", "Axis Font Color", "#94A3B8");
    showGridlines = toggle("showGridlines", "Show Gridlines", true);
    gridlineColor = color("gridlineColor", "Gridline Color", "#F1F5F9");

    name: string = "axisSettings";
    displayName: string = "Axis";
    slices: FormattingSettingsSlice[] = [
        this.showAxis,
        this.axisFontSize,
        this.axisFontColor,
        this.showGridlines,
        this.gridlineColor,
    ];
}

/* ── Label Settings ── */
class LabelSettingsCard extends FormattingSettingsCard {
    showValueLabel = toggle("showValueLabel", "Show Value Labels", true);
    valueLabelPosition = dropdown("valueLabelPosition", "Value Label Position", [
        { value: "inside", displayName: "Inside" },
        { value: "right", displayName: "Right" },
        { value: "left", displayName: "Left" },
    ], 1);
    valueFontSize = num("valueFontSize", "Value Font Size", 10, 7, 16);
    valueFontColor = color("valueFontColor", "Value Font Color", "#475569");
    showTargetLabel = toggle("showTargetLabel", "Show Target Labels", false);

    name: string = "labelSettings";
    displayName: string = "Data Labels";
    slices: FormattingSettingsSlice[] = [
        this.showValueLabel,
        this.valueLabelPosition,
        this.valueFontSize,
        this.valueFontColor,
        this.showTargetLabel,
    ];
}

/* ── Color Settings ── */
class ColorSettingsCard extends FormattingSettingsCard {
    selectedBarColor = color("selectedBarColor", "Selected Bar Color", "#2563EB");
    conditionalColoring = toggle("conditionalColoring", "Conditional Coloring", false);
    aboveTargetColor = color("aboveTargetColor", "Above Target Color", "#10B981");
    belowTargetColor = color("belowTargetColor", "Below Target Color", "#EF4444");

    name: string = "colorSettings";
    displayName: string = "Colors";
    slices: FormattingSettingsSlice[] = [
        this.selectedBarColor,
        this.conditionalColoring,
        this.aboveTargetColor,
        this.belowTargetColor,
    ];
}

/* ═══════════════════════════════════════════════
   Root Model
   ═══════════════════════════════════════════════ */

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    layoutSettingsCard = new LayoutSettingsCard();
    barSettingsCard = new BarSettingsCard();
    targetSettingsCard = new TargetSettingsCard();
    rangeSettingsCard = new RangeSettingsCard();
    axisSettingsCard = new AxisSettingsCard();
    labelSettingsCard = new LabelSettingsCard();
    colorSettingsCard = new ColorSettingsCard();

    cards: FormattingSettingsCard[] = [
        this.layoutSettingsCard,
        this.barSettingsCard,
        this.targetSettingsCard,
        this.rangeSettingsCard,
        this.axisSettingsCard,
        this.labelSettingsCard,
        this.colorSettingsCard,
    ];
}

/* ═══════════════════════════════════════════════
   buildRenderConfig()
   ═══════════════════════════════════════════════ */

/** Sanitize string → literal union. */
function safeEnum<T extends string>(
    val: string | undefined,
    allowed: readonly T[],
    fallback: T,
): T {
    if (val && (allowed as readonly string[]).includes(val)) return val as T;
    return fallback;
}

/** Convert populated formatting model into a plain RenderConfig object. */
export function buildRenderConfig(m: VisualFormattingSettingsModel): RenderConfig {
    const l = m.layoutSettingsCard;
    const b = m.barSettingsCard;
    const t = m.targetSettingsCard;
    const r = m.rangeSettingsCard;
    const a = m.axisSettingsCard;
    const lb = m.labelSettingsCard;
    const c = m.colorSettingsCard;

    return {
        layout: {
            orientation: safeEnum<Orientation>(l.orientation.value?.value as string | undefined, ORIENTATIONS, "horizontal"),
            bulletHeight: l.bulletHeight.value,
            bulletSpacing: l.bulletSpacing.value,
            categoryWidth: l.categoryWidth.value,
            showCategoryLabels: l.showCategoryLabels.value,
            categoryFontSize: l.categoryFontSize.value,
            categoryFontColor: l.categoryFontColor.value.value,
        },
        bar: {
            actualBarHeightFrac: b.actualBarHeightPct.value / 100,
            actualBarColor: b.actualBarColor.value.value,
            actualBarCornerRadius: b.actualBarCornerRadius.value,
        },
        target: {
            showTarget: t.showTarget.value,
            targetColor: t.targetColor.value.value,
            targetWidth: t.targetWidth.value,
            targetHeightFrac: t.targetHeightPct.value / 100,
        },
        range: {
            range1Color: r.range1Color.value.value,
            range2Color: r.range2Color.value.value,
            range3Color: r.range3Color.value.value,
            rangeCornerRadius: r.rangeCornerRadius.value,
        },
        axis: {
            showAxis: a.showAxis.value,
            axisFontSize: a.axisFontSize.value,
            axisFontColor: a.axisFontColor.value.value,
            showGridlines: a.showGridlines.value,
            gridlineColor: a.gridlineColor.value.value,
        },
        label: {
            showValueLabel: lb.showValueLabel.value,
            valueLabelPosition: safeEnum<ValueLabelPosition>(lb.valueLabelPosition.value?.value as string | undefined, VALUE_LABEL_POSITIONS, "right"),
            valueFontSize: lb.valueFontSize.value,
            valueFontColor: lb.valueFontColor.value.value,
            showTargetLabel: lb.showTargetLabel.value,
        },
        color: {
            selectedBarColor: c.selectedBarColor.value.value,
            conditionalColoring: c.conditionalColoring.value,
            aboveTargetColor: c.aboveTargetColor.value.value,
            belowTargetColor: c.belowTargetColor.value.value,
        },
    };
}

/* Need powerbi import for ValidatorType */
import powerbi from "powerbi-visuals-api";
