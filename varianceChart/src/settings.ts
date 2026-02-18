/* ═══════════════════════════════════════════════
   settings.ts - Formatting model + buildRenderConfig()
   Settings must NOT import constants.ts (S1)
   ═══════════════════════════════════════════════ */
"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import {
    RenderConfig,
    Orientation,
    ORIENTATIONS,
    VarianceStyle,
    VARIANCE_STYLES,
    LabelContent,
    LABEL_CONTENTS,
    LegendPosition,
    LEGEND_POSITIONS,
    XLabelRotation,
    X_LABEL_ROTATIONS,
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
    _minValue?: number,
    _maxValue?: number,
): formattingSettings.NumUpDown {
    /* Omit validators — use runtime clamping in buildRenderConfig() instead (Section 6) */
    return new formattingSettings.NumUpDown({
        name,
        displayName,
        value,
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
    return new formattingSettings.ItemDropdown({
        name,
        displayName,
        items: items.map((v, i) => ({ displayName: labels[i], value: v })),
        value: { displayName: labels[defaultIdx], value: items[defaultIdx] },
    });
}

/* ── No direct powerbi import needed in settings (S1) ── */

/* ═══════════════════════════════════════════════
   Formatting Cards
   ═══════════════════════════════════════════════ */

/* ── 1. Chart Settings ── */
class ChartSettingsCard extends FormattingSettingsCard {
    orientation = dropdown(
        "orientation", "Orientation",
        ["vertical", "horizontal"], ["Vertical", "Horizontal"], 0,
    );
    barWidth = pct("barWidth", "Bar Width (%)", 60);
    budgetWidth = pct("budgetWidth", "Budget Width (%)", 30);
    barCornerRadius = num("barCornerRadius", "Corner Radius", 2, 0, 10);
    barGap = num("barGap", "Bar Gap", 2, 0, 8);
    showVarianceIndicator = toggle("showVarianceIndicator", "Show Variance Indicator", true);
    varianceStyle = dropdown(
        "varianceStyle", "Variance Style",
        ["deltaBar", "lollipop", "arrow", "connectorLine"],
        ["Delta Bar", "Lollipop", "Arrow", "Connector Line"], 0,
    );

    name: string = "chartSettings";
    displayName: string = "Chart Settings";
    slices: FormattingSettingsSlice[] = [
        this.orientation, this.barWidth, this.budgetWidth,
        this.barCornerRadius, this.barGap,
        this.showVarianceIndicator, this.varianceStyle,
    ];
}

/* ── 2. Variance Panel Settings ── */
class VariancePanelSettingsCard extends FormattingSettingsCard {
    showVariancePanel = toggle("showVariancePanel", "Show Variance Panel", false);
    panelWidth = pct("panelWidth", "Panel Width (%)", 25);
    panelBackground = color("panelBackground", "Panel Background", "#F8FAFC");
    panelBorderColor = color("panelBorderColor", "Panel Border Color", "#E2E8F0");

    name: string = "variancePanelSettings";
    displayName: string = "Variance Panel";
    slices: FormattingSettingsSlice[] = [
        this.showVariancePanel, this.panelWidth,
        this.panelBackground, this.panelBorderColor,
    ];
}

/* ── 3. Color Settings ── */
class ColorSettingsCard extends FormattingSettingsCard {
    actualColor = color("actualColor", "Actual Color", "#3B82F6");
    budgetColor = color("budgetColor", "Budget Color", "#CBD5E1");
    favourableColor = color("favourableColor", "Favourable Color", "#10B981");
    unfavourableColor = color("unfavourableColor", "Unfavourable Color", "#EF4444");
    selectedColor = color("selectedColor", "Selected Color", "#2563EB");

    name: string = "colorSettings";
    displayName: string = "Colors";
    slices: FormattingSettingsSlice[] = [
        this.actualColor, this.budgetColor,
        this.favourableColor, this.unfavourableColor,
        this.selectedColor,
    ];
}

/* ── 4. Axis Settings ── */
class AxisSettingsCard extends FormattingSettingsCard {
    showXAxis = toggle("showXAxis", "Show X Axis", true);
    showYAxis = toggle("showYAxis", "Show Y Axis", true);
    axisFontSize = num("axisFontSize", "Font Size", 10, 7, 16);
    axisFontColor = color("axisFontColor", "Font Color", "#64748B");
    showGridlines = toggle("showGridlines", "Show Gridlines", true);
    gridlineColor = color("gridlineColor", "Gridline Color", "#F1F5F9");
    xLabelRotation = dropdown(
        "xLabelRotation", "X Label Rotation",
        ["0", "45", "90"], ["0°", "45°", "90°"], 0,
    );

    name: string = "axisSettings";
    displayName: string = "Axes";
    slices: FormattingSettingsSlice[] = [
        this.showXAxis, this.showYAxis,
        this.axisFontSize, this.axisFontColor,
        this.showGridlines, this.gridlineColor,
        this.xLabelRotation,
    ];
}

/* ── 5. Label Settings ── */
class LabelSettingsCard extends FormattingSettingsCard {
    showValueLabels = toggle("showValueLabels", "Show Value Labels", true);
    labelContent = dropdown(
        "labelContent", "Label Content",
        ["actual", "variance", "both", "percent"],
        ["Actual", "Variance", "Both", "Percent"], 1,
    );
    labelFontSize = num("labelFontSize", "Font Size", 9, 7, 14);
    labelFontColor = color("labelFontColor", "Font Color", "#475569");
    showVariancePercent = toggle("showVariancePercent", "Show Variance %", true);

    name: string = "labelSettings";
    displayName: string = "Labels";
    slices: FormattingSettingsSlice[] = [
        this.showValueLabels, this.labelContent,
        this.labelFontSize, this.labelFontColor,
        this.showVariancePercent,
    ];
}

/* ── 6. Legend Settings ── */
class LegendSettingsCard extends FormattingSettingsCard {
    showLegend = toggle("showLegend", "Show Legend", true);
    legendPosition = dropdown(
        "legendPosition", "Position",
        ["top", "bottom"], ["Top", "Bottom"], 0,
    );
    legendFontSize = num("legendFontSize", "Font Size", 10, 7, 16);
    legendFontColor = color("legendFontColor", "Font Color", "#475569");

    name: string = "legendSettings";
    displayName: string = "Legend";
    slices: FormattingSettingsSlice[] = [
        this.showLegend, this.legendPosition,
        this.legendFontSize, this.legendFontColor,
    ];
}

/* ═══════════════════════════════════════════════
   Root Formatting Settings Model
   ═══════════════════════════════════════════════ */

export class VisualFormattingSettingsModel extends Model {
    chartSettingsCard = new ChartSettingsCard();
    variancePanelSettingsCard = new VariancePanelSettingsCard();
    colorSettingsCard = new ColorSettingsCard();
    axisSettingsCard = new AxisSettingsCard();
    labelSettingsCard = new LabelSettingsCard();
    legendSettingsCard = new LegendSettingsCard();

    cards = [
        this.chartSettingsCard,
        this.variancePanelSettingsCard,
        this.colorSettingsCard,
        this.axisSettingsCard,
        this.labelSettingsCard,
        this.legendSettingsCard,
    ];
}

/* ═══════════════════════════════════════════════
   buildRenderConfig()
   Converts formatting settings to a plain typed RenderConfig.
   All percent -> fraction conversions happen here. (S2)
   ═══════════════════════════════════════════════ */

/** Sanitise a dropdown value against an allowed set. Handles EnumMemberValue (string|number). */
function safeEnum<T extends string>(
    val: string | number | undefined,
    allowed: readonly T[],
    fallback: T,
): T {
    const s = val != null ? String(val) : undefined;
    if (s && (allowed as readonly string[]).includes(s)) return s as T;
    return fallback;
}

function clampVal(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
}

export function buildRenderConfig(
    model: VisualFormattingSettingsModel,
): RenderConfig {
    const cs = model.chartSettingsCard;
    const vp = model.variancePanelSettingsCard;
    const cl = model.colorSettingsCard;
    const ax = model.axisSettingsCard;
    const lb = model.labelSettingsCard;
    const lg = model.legendSettingsCard;

    return {
        chart: {
            orientation: safeEnum(cs.orientation.value?.value, ORIENTATIONS, "vertical"),
            barWidth: clampVal(cs.barWidth.value, 10, 100) / 100,
            budgetWidth: clampVal(cs.budgetWidth.value, 5, 100) / 100,
            barCornerRadius: clampVal(cs.barCornerRadius.value, 0, 10),
            barGap: clampVal(cs.barGap.value, 0, 8),
            showVarianceIndicator: cs.showVarianceIndicator.value,
            varianceStyle: safeEnum(cs.varianceStyle.value?.value, VARIANCE_STYLES, "deltaBar"),
        },
        variancePanel: {
            showVariancePanel: vp.showVariancePanel.value,
            panelWidth: clampVal(vp.panelWidth.value, 10, 50) / 100,
            panelBackground: vp.panelBackground.value.value || "#F8FAFC",
            panelBorderColor: vp.panelBorderColor.value.value || "#E2E8F0",
        },
        colors: {
            actualColor: cl.actualColor.value.value || "#3B82F6",
            budgetColor: cl.budgetColor.value.value || "#CBD5E1",
            favourableColor: cl.favourableColor.value.value || "#10B981",
            unfavourableColor: cl.unfavourableColor.value.value || "#EF4444",
            selectedColor: cl.selectedColor.value.value || "#2563EB",
        },
        axis: {
            showXAxis: ax.showXAxis.value,
            showYAxis: ax.showYAxis.value,
            axisFontSize: clampVal(ax.axisFontSize.value, 7, 16),
            axisFontColor: ax.axisFontColor.value.value || "#64748B",
            showGridlines: ax.showGridlines.value,
            gridlineColor: ax.gridlineColor.value.value || "#F1F5F9",
            xLabelRotation: safeEnum(ax.xLabelRotation.value?.value, X_LABEL_ROTATIONS, "0"),
        },
        labels: {
            showValueLabels: lb.showValueLabels.value,
            labelContent: safeEnum(lb.labelContent.value?.value, LABEL_CONTENTS, "variance"),
            labelFontSize: clampVal(lb.labelFontSize.value, 7, 14),
            labelFontColor: lb.labelFontColor.value.value || "#475569",
            showVariancePercent: lb.showVariancePercent.value,
        },
        legend: {
            showLegend: lg.showLegend.value,
            legendPosition: safeEnum(lg.legendPosition.value?.value, LEGEND_POSITIONS, "top"),
            legendFontSize: clampVal(lg.legendFontSize.value, 7, 16),
            legendFontColor: lg.legendFontColor.value.value || "#475569",
        },
    };
}
