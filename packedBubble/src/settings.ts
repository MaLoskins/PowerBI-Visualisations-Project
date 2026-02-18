/* ═══════════════════════════════════════════════
   Packed Bubble Chart – Formatting Settings
   ═══════════════════════════════════════════════ */

"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import {
    RenderConfig,
    LabelContent,
    LABEL_CONTENT_OPTIONS,
    LegendPosition,
    LEGEND_POSITION_OPTIONS,
} from "./types";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

/* ── Slice Factories ── */

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
    const dropdownItems = items.map((v, i) => ({ displayName: labels[i], value: v }));
    return new formattingSettings.ItemDropdown({
        name,
        displayName,
        items: dropdownItems,
        value: dropdownItems[defaultIdx],
    });
}

/* ── Utility ── */

import powerbi from "powerbi-visuals-api";

function safeEnum<T extends string>(
    val: string | undefined,
    allowed: readonly T[],
    fallback: T,
): T {
    if (val && (allowed as readonly string[]).includes(val)) return val as T;
    return fallback;
}

/* ═══════════════════════════════════════════════
   Formatting Cards
   ═══════════════════════════════════════════════ */

/** Bubble appearance settings */
class BubbleSettingsCard extends FormattingSettingsCard {
    minRadius = num("minRadius", "Min radius", 12, 4, 40);
    maxRadius = num("maxRadius", "Max radius", 80, 20, 200);
    bubbleOpacity = pct("bubbleOpacity", "Opacity (%)", 85);
    bubbleBorderWidth = num("bubbleBorderWidth", "Border width", 1.5, 0, 5);
    bubbleBorderColor = color("bubbleBorderColor", "Border colour", "#FFFFFF");
    bubblePadding = num("bubblePadding", "Padding", 2, 0, 10);

    name: string = "bubbleSettings";
    displayName: string = "Bubble Settings";
    slices: FormattingSettingsSlice[] = [
        this.minRadius, this.maxRadius, this.bubbleOpacity,
        this.bubbleBorderWidth, this.bubbleBorderColor, this.bubblePadding,
    ];
}

/** Force simulation settings */
class ForceSettingsCard extends FormattingSettingsCard {
    simulationStrength = num("simulationStrength", "Simulation strength", 0.3, 0.01, 1.0);
    collisionPadding = num("collisionPadding", "Collision padding", 2, 0, 10);
    splitGroups = toggle("splitGroups", "Split groups", false);
    groupPadding = num("groupPadding", "Group padding", 40, 10, 100);

    name: string = "forceSettings";
    displayName: string = "Force Settings";
    slices: FormattingSettingsSlice[] = [
        this.simulationStrength, this.collisionPadding,
        this.splitGroups, this.groupPadding,
    ];
}

/** Label settings */
class LabelSettingsCard extends FormattingSettingsCard {
    showLabels = toggle("showLabels", "Show labels", true);
    labelContent = dropdown("labelContent", "Label content",
        LABEL_CONTENT_OPTIONS,
        ["Name", "Value", "Name & Value"],
        0,
    );
    labelFontSize = num("labelFontSize", "Font size", 10, 7, 16);
    labelFontColor = color("labelFontColor", "Font colour", "#FFFFFF");
    minRadiusForLabel = num("minRadiusForLabel", "Min radius for label", 20, 8, 60);
    wrapLabels = toggle("wrapLabels", "Wrap labels", true);

    name: string = "labelSettings";
    displayName: string = "Label Settings";
    slices: FormattingSettingsSlice[] = [
        this.showLabels, this.labelContent, this.labelFontSize,
        this.labelFontColor, this.minRadiusForLabel, this.wrapLabels,
    ];
}

/** Colour settings */
class ColorSettingsCard extends FormattingSettingsCard {
    colorByGroup = toggle("colorByGroup", "Colour by group", true);
    defaultBubbleColor = color("defaultBubbleColor", "Default bubble colour", "#3B82F6");
    selectedBubbleColor = color("selectedBubbleColor", "Selected bubble colour", "#2563EB");

    name: string = "colorSettings";
    displayName: string = "Colour Settings";
    slices: FormattingSettingsSlice[] = [
        this.colorByGroup, this.defaultBubbleColor, this.selectedBubbleColor,
    ];
}

/** Group label settings */
class GroupLabelSettingsCard extends FormattingSettingsCard {
    showGroupLabels = toggle("showGroupLabels", "Show group labels", true);
    groupLabelFontSize = num("groupLabelFontSize", "Font size", 14, 10, 24);
    groupLabelFontColor = color("groupLabelFontColor", "Font colour", "#64748B");

    name: string = "groupLabelSettings";
    displayName: string = "Group Labels";
    slices: FormattingSettingsSlice[] = [
        this.showGroupLabels, this.groupLabelFontSize, this.groupLabelFontColor,
    ];
}

/** Legend settings */
class LegendSettingsCard extends FormattingSettingsCard {
    showLegend = toggle("showLegend", "Show legend", true);
    legendPosition = dropdown("legendPosition", "Position",
        LEGEND_POSITION_OPTIONS,
        ["Top", "Bottom", "Right"],
        0,
    );
    legendFontSize = num("legendFontSize", "Font size", 10, 7, 16);
    legendFontColor = color("legendFontColor", "Font colour", "#475569");

    name: string = "legendSettings";
    displayName: string = "Legend";
    slices: FormattingSettingsSlice[] = [
        this.showLegend, this.legendPosition,
        this.legendFontSize, this.legendFontColor,
    ];
}

/* ═══════════════════════════════════════════════
   Root Model
   ═══════════════════════════════════════════════ */

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    bubbleSettingsCard = new BubbleSettingsCard();
    forceSettingsCard = new ForceSettingsCard();
    labelSettingsCard = new LabelSettingsCard();
    colorSettingsCard = new ColorSettingsCard();
    groupLabelSettingsCard = new GroupLabelSettingsCard();
    legendSettingsCard = new LegendSettingsCard();

    cards = [
        this.bubbleSettingsCard,
        this.forceSettingsCard,
        this.labelSettingsCard,
        this.colorSettingsCard,
        this.groupLabelSettingsCard,
        this.legendSettingsCard,
    ];
}

/* ═══════════════════════════════════════════════
   buildRenderConfig()
   ═══════════════════════════════════════════════ */

/** Convert formatting model to a plain RenderConfig object (R1).
 *  All percentages are converted to 0–1 fractions here. */
export function buildRenderConfig(m: VisualFormattingSettingsModel): RenderConfig {
    return {
        bubble: {
            minRadius: m.bubbleSettingsCard.minRadius.value,
            maxRadius: m.bubbleSettingsCard.maxRadius.value,
            opacity: m.bubbleSettingsCard.bubbleOpacity.value / 100,
            borderWidth: m.bubbleSettingsCard.bubbleBorderWidth.value,
            borderColor: m.bubbleSettingsCard.bubbleBorderColor.value.value,
            padding: m.bubbleSettingsCard.bubblePadding.value,
        },
        force: {
            simulationStrength: m.forceSettingsCard.simulationStrength.value,
            collisionPadding: m.forceSettingsCard.collisionPadding.value,
            splitGroups: m.forceSettingsCard.splitGroups.value,
            groupPadding: m.forceSettingsCard.groupPadding.value,
        },
        label: {
            showLabels: m.labelSettingsCard.showLabels.value,
            labelContent: safeEnum(
                m.labelSettingsCard.labelContent.value?.value as string | undefined,
                LABEL_CONTENT_OPTIONS,
                "name",
            ),
            fontSize: m.labelSettingsCard.labelFontSize.value,
            fontColor: m.labelSettingsCard.labelFontColor.value.value,
            minRadiusForLabel: m.labelSettingsCard.minRadiusForLabel.value,
            wrapLabels: m.labelSettingsCard.wrapLabels.value,
        },
        color: {
            colorByGroup: m.colorSettingsCard.colorByGroup.value,
            defaultBubbleColor: m.colorSettingsCard.defaultBubbleColor.value.value,
            selectedBubbleColor: m.colorSettingsCard.selectedBubbleColor.value.value,
        },
        groupLabel: {
            showGroupLabels: m.groupLabelSettingsCard.showGroupLabels.value,
            fontSize: m.groupLabelSettingsCard.groupLabelFontSize.value,
            fontColor: m.groupLabelSettingsCard.groupLabelFontColor.value.value,
        },
        legend: {
            showLegend: m.legendSettingsCard.showLegend.value,
            position: safeEnum(
                m.legendSettingsCard.legendPosition.value?.value as string | undefined,
                LEGEND_POSITION_OPTIONS,
                "top",
            ),
            fontSize: m.legendSettingsCard.legendFontSize.value,
            fontColor: m.legendSettingsCard.legendFontColor.value.value,
        },
    };
}
