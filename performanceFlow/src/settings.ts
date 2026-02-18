/*
 *  Performance Flow (Sankey Diagram) — Power BI Custom Visual
 *  settings.ts — Formatting model + buildRenderConfig()
 *
 *  NOTE: This file must NOT import constants.ts.
 *        Palette defaults use literal hex strings.
 */
"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

import {
    RenderConfig,
    NodeAlign,
    NODE_ALIGN_OPTIONS,
    ColorMode,
    COLOR_MODES,
    LabelPosition,
    LABEL_POSITIONS,
    SortNodeOption,
    SORT_NODE_OPTIONS,
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
    items: readonly string[],
    labels: string[],
    defaultIdx: number,
): formattingSettings.ItemDropdown {
    const dropdownItems = items.map((val, i) => ({ value: val, displayName: labels[i] }));
    return new formattingSettings.ItemDropdown({
        name,
        displayName,
        items: dropdownItems,
        value: dropdownItems[defaultIdx],
    });
}

/* ═══════════════════════════════════════════════
   Safe Enum Sanitiser
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
   Formatting Cards
   ═══════════════════════════════════════════════ */

/* ── Import powerbi for validator types ── */
import powerbi from "powerbi-visuals-api";

/** Node Settings Card */
class NodeSettingsCard extends FormattingSettingsCard {
    nodeWidth = num("nodeWidth", "Node Width", 16, 6, 40);
    nodePadding = num("nodePadding", "Node Padding", 12, 4, 40);
    nodeCornerRadius = num("nodeCornerRadius", "Corner Radius", 2, 0, 10);
    nodeColor = color("nodeColor", "Node Color", "#334155");
    nodeOpacity = pct("nodeOpacity", "Node Opacity", 90);
    nodeAlign = dropdown("nodeAlign", "Node Alignment", NODE_ALIGN_OPTIONS, ["Left", "Right", "Center", "Justify"], 3);

    name: string = "nodeSettings";
    displayName: string = "Nodes";
    slices: FormattingSettingsSlice[] = [
        this.nodeWidth, this.nodePadding, this.nodeCornerRadius,
        this.nodeColor, this.nodeOpacity, this.nodeAlign,
    ];
}

/** Link Settings Card */
class LinkSettingsCard extends FormattingSettingsCard {
    linkOpacity = pct("linkOpacity", "Link Opacity", 40);
    linkHoverOpacity = pct("linkHoverOpacity", "Hover Opacity", 70);
    colorMode = dropdown("colorMode", "Color Mode", COLOR_MODES, ["Source Color", "Dest Color", "Gradient", "Fixed"], 2);
    fixedLinkColor = color("fixedLinkColor", "Fixed Link Color", "#CBD5E1");
    linkCurvature = num("linkCurvature", "Link Curvature", 0.5, 0.1, 0.9);

    name: string = "linkSettings";
    displayName: string = "Links";
    slices: FormattingSettingsSlice[] = [
        this.linkOpacity, this.linkHoverOpacity, this.colorMode,
        this.fixedLinkColor, this.linkCurvature,
    ];
}

/** Label Settings Card */
class LabelSettingsCard extends FormattingSettingsCard {
    showNodeLabels = toggle("showNodeLabels", "Show Node Labels", true);
    labelFontSize = num("labelFontSize", "Label Font Size", 11, 7, 18);
    labelFontColor = color("labelFontColor", "Label Font Color", "#334155");
    labelPosition = dropdown("labelPosition", "Label Position", LABEL_POSITIONS, ["Inside", "Outside"], 1);
    showValues = toggle("showValues", "Show Values", true);
    valueFontSize = num("valueFontSize", "Value Font Size", 9, 7, 14);

    name: string = "labelSettings";
    displayName: string = "Labels";
    slices: FormattingSettingsSlice[] = [
        this.showNodeLabels, this.labelFontSize, this.labelFontColor,
        this.labelPosition, this.showValues, this.valueFontSize,
    ];
}

/** Color Settings Card */
class ColorSettingsCard extends FormattingSettingsCard {
    colorByNode = toggle("colorByNode", "Color By Node", true);
    selectedLinkColor = color("selectedLinkColor", "Selected Link Color", "#3B82F6");
    selectedNodeColor = color("selectedNodeColor", "Selected Node Color", "#2563EB");

    name: string = "colorSettings";
    displayName: string = "Colors";
    slices: FormattingSettingsSlice[] = [
        this.colorByNode, this.selectedLinkColor, this.selectedNodeColor,
    ];
}

/** Layout Settings Card */
class LayoutSettingsCard extends FormattingSettingsCard {
    iterations = num("iterations", "Layout Iterations", 32, 6, 128);
    sortNodes = dropdown("sortNodes", "Sort Nodes", SORT_NODE_OPTIONS, ["Auto", "Name", "Value", "None"], 0);

    name: string = "layoutSettings";
    displayName: string = "Layout";
    slices: FormattingSettingsSlice[] = [
        this.iterations, this.sortNodes,
    ];
}

/* ═══════════════════════════════════════════════
   Root Formatting Model
   ═══════════════════════════════════════════════ */

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    nodeSettingsCard = new NodeSettingsCard();
    linkSettingsCard = new LinkSettingsCard();
    labelSettingsCard = new LabelSettingsCard();
    colorSettingsCard = new ColorSettingsCard();
    layoutSettingsCard = new LayoutSettingsCard();

    cards = [
        this.nodeSettingsCard,
        this.linkSettingsCard,
        this.labelSettingsCard,
        this.colorSettingsCard,
        this.layoutSettingsCard,
    ];
}

/* ═══════════════════════════════════════════════
   buildRenderConfig() — settings → RenderConfig
   ═══════════════════════════════════════════════ */

/** Convert formatting model to plain RenderConfig object. Percent → fraction. */
export function buildRenderConfig(model: VisualFormattingSettingsModel): RenderConfig {
    const n = model.nodeSettingsCard;
    const l = model.linkSettingsCard;
    const lb = model.labelSettingsCard;
    const c = model.colorSettingsCard;
    const ly = model.layoutSettingsCard;

    return {
        node: {
            width: n.nodeWidth.value,
            padding: n.nodePadding.value,
            cornerRadius: n.nodeCornerRadius.value,
            color: n.nodeColor.value.value,
            opacity: n.nodeOpacity.value / 100,
            align: safeEnum(n.nodeAlign.value?.value as string | undefined, NODE_ALIGN_OPTIONS, "justify"),
        },
        link: {
            opacity: l.linkOpacity.value / 100,
            hoverOpacity: l.linkHoverOpacity.value / 100,
            colorMode: safeEnum(l.colorMode.value?.value as string | undefined, COLOR_MODES, "gradient"),
            fixedColor: l.fixedLinkColor.value.value,
            curvature: l.linkCurvature.value,
        },
        label: {
            showNodeLabels: lb.showNodeLabels.value,
            fontSize: lb.labelFontSize.value,
            fontColor: lb.labelFontColor.value.value,
            position: safeEnum(lb.labelPosition.value?.value as string | undefined, LABEL_POSITIONS, "outside"),
            showValues: lb.showValues.value,
            valueFontSize: lb.valueFontSize.value,
        },
        color: {
            colorByNode: c.colorByNode.value,
            selectedLinkColor: c.selectedLinkColor.value.value,
            selectedNodeColor: c.selectedNodeColor.value.value,
        },
        layout: {
            iterations: ly.iterations.value,
            sortNodes: safeEnum(ly.sortNodes.value?.value as string | undefined, SORT_NODE_OPTIONS, "auto"),
        },
    };
}
