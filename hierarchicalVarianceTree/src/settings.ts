/* ═══════════════════════════════════════════════
   settings.ts – Formatting Model & buildRenderConfig()
   Hierarchical Variance Tree
   ═══════════════════════════════════════════════ */

"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

import powerbi from "powerbi-visuals-api";

import {
    RenderConfig,
    Orientation,
    StartExpanded,
    ORIENTATIONS,
    START_EXPANDED_OPTIONS,
} from "./types";

/* ═══════════════════════════════════════════════
   Slice Factories
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
    if (minVal !== undefined) {
        slice.options = {
            ...slice.options,
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: minVal },
        };
    }
    if (maxVal !== undefined) {
        slice.options = {
            ...slice.options,
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: maxVal },
        };
    }
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
    items: readonly string[],
    labels: string[],
    defaultIdx: number,
): formattingSettings.ItemDropdown {
    const enumerationItems = items.map((val, i) => ({
        value: val,
        displayName: labels[i] ?? val,
    }));
    return new formattingSettings.ItemDropdown({
        name,
        displayName,
        items: enumerationItems,
        value: enumerationItems[defaultIdx],
    });
}

/* ═══════════════════════════════════════════════
   Formatting Cards
   ═══════════════════════════════════════════════ */

/* ── Layout Settings ── */
class LayoutSettingsCard extends FormattingSettingsCard {
    orientation = dropdown(
        "orientation", "Orientation",
        ORIENTATIONS, ["Top Down", "Left to Right"], 0,
    );
    nodeWidth = num("nodeWidth", "Node Width", 160, 80, 300);
    nodeHeight = num("nodeHeight", "Node Height", 70, 40, 120);
    levelSpacing = num("levelSpacing", "Level Spacing", 60, 20, 120);
    siblingSpacing = num("siblingSpacing", "Sibling Spacing", 16, 4, 40);
    nodeCornerRadius = num("nodeCornerRadius", "Corner Radius", 6, 0, 16);

    name: string = "layoutSettings";
    displayName: string = "Layout";
    slices: FormattingSettingsSlice[] = [
        this.orientation, this.nodeWidth, this.nodeHeight,
        this.levelSpacing, this.siblingSpacing, this.nodeCornerRadius,
    ];
}

/* ── Node Settings ── */
class NodeSettingsCard extends FormattingSettingsCard {
    showVarianceBar = toggle("showVarianceBar", "Show Variance Bar", true);
    barHeight = num("barHeight", "Bar Height", 8, 4, 20);
    showPercentage = toggle("showPercentage", "Show Percentage", true);
    showAbsoluteValue = toggle("showAbsoluteValue", "Show Absolute Value", true);
    nodeFontSize = num("nodeFontSize", "Label Font Size", 11, 8, 16);
    nodeFontColor = color("nodeFontColor", "Label Font Color", "#334155");
    valueFontSize = num("valueFontSize", "Value Font Size", 13, 9, 20);
    nodeBackground = color("nodeBackground", "Node Background", "#FFFFFF");
    nodeBorderColor = color("nodeBorderColor", "Node Border Color", "#E2E8F0");
    nodeBorderWidth = num("nodeBorderWidth", "Node Border Width", 1, 0, 4);

    name: string = "nodeSettings";
    displayName: string = "Node Appearance";
    slices: FormattingSettingsSlice[] = [
        this.showVarianceBar, this.barHeight, this.showPercentage, this.showAbsoluteValue,
        this.nodeFontSize, this.nodeFontColor, this.valueFontSize,
        this.nodeBackground, this.nodeBorderColor, this.nodeBorderWidth,
    ];
}

/* ── Color Settings ── */
class ColorSettingsCard extends FormattingSettingsCard {
    favourableColor = color("favourableColor", "Favourable Color", "#10B981");
    unfavourableColor = color("unfavourableColor", "Unfavourable Color", "#EF4444");
    neutralColor = color("neutralColor", "Neutral Color", "#94A3B8");
    connectorColor = color("connectorColor", "Connector Color", "#CBD5E1");
    connectorWidth = num("connectorWidth", "Connector Width", 1.5, 0.5, 4);
    selectedNodeBorder = color("selectedNodeBorder", "Selected Node Border", "#3B82F6");

    name: string = "colorSettings";
    displayName: string = "Colors";
    slices: FormattingSettingsSlice[] = [
        this.favourableColor, this.unfavourableColor, this.neutralColor,
        this.connectorColor, this.connectorWidth, this.selectedNodeBorder,
    ];
}

/* ── Interaction Settings ── */
class InteractionSettingsCard extends FormattingSettingsCard {
    startExpanded = dropdown(
        "startExpanded", "Start Expanded",
        START_EXPANDED_OPTIONS, ["All", "Root Only", "None"], 1,
    );
    animationDuration = num("animationDuration", "Animation Duration (ms)", 400, 0, 1000);

    name: string = "interactionSettings";
    displayName: string = "Interaction";
    slices: FormattingSettingsSlice[] = [
        this.startExpanded, this.animationDuration,
    ];
}

/* ═══════════════════════════════════════════════
   Root Formatting Model
   ═══════════════════════════════════════════════ */

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    layoutCard = new LayoutSettingsCard();
    nodeCard = new NodeSettingsCard();
    colorCard = new ColorSettingsCard();
    interactionCard = new InteractionSettingsCard();

    cards = [this.layoutCard, this.nodeCard, this.colorCard, this.interactionCard];
}

/* ═══════════════════════════════════════════════
   buildRenderConfig()
   Single bridge between formatting model and render code.
   All enum sanitisation and colour extraction happens here.
   ═══════════════════════════════════════════════ */

/** Sanitise a string to a typed union using allowed values. */
function safeEnum<T extends string>(
    val: string | number | undefined,
    allowed: readonly T[],
    fallback: T,
): T {
    const s = val != null ? String(val) : undefined;
    if (s && (allowed as readonly string[]).includes(s)) return s as T;
    return fallback;
}

export function buildRenderConfig(model: VisualFormattingSettingsModel): RenderConfig {
    const l = model.layoutCard;
    const n = model.nodeCard;
    const c = model.colorCard;
    const ia = model.interactionCard;

    return {
        layout: {
            orientation: safeEnum<Orientation>(l.orientation.value?.value, ORIENTATIONS, "topDown"),
            nodeWidth: l.nodeWidth.value,
            nodeHeight: l.nodeHeight.value,
            levelSpacing: l.levelSpacing.value,
            siblingSpacing: l.siblingSpacing.value,
            nodeCornerRadius: l.nodeCornerRadius.value,
        },
        node: {
            showVarianceBar: n.showVarianceBar.value,
            barHeight: n.barHeight.value,
            showPercentage: n.showPercentage.value,
            showAbsoluteValue: n.showAbsoluteValue.value,
            nodeFontSize: n.nodeFontSize.value,
            nodeFontColor: n.nodeFontColor.value.value,
            valueFontSize: n.valueFontSize.value,
            nodeBackground: n.nodeBackground.value.value,
            nodeBorderColor: n.nodeBorderColor.value.value,
            nodeBorderWidth: n.nodeBorderWidth.value,
        },
        colors: {
            favourableColor: c.favourableColor.value.value,
            unfavourableColor: c.unfavourableColor.value.value,
            neutralColor: c.neutralColor.value.value,
            connectorColor: c.connectorColor.value.value,
            connectorWidth: c.connectorWidth.value,
            selectedNodeBorder: c.selectedNodeBorder.value.value,
        },
        interaction: {
            startExpanded: safeEnum<StartExpanded>(ia.startExpanded.value?.value, START_EXPANDED_OPTIONS, "rootOnly"),
            animationDuration: ia.animationDuration.value,
        },
    };
}
