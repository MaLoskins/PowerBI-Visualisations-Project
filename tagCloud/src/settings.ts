/* ═══════════════════════════════════════════════
   Tag Cloud – Formatting Settings Model
   Note: Must NOT import constants.ts (S1)
   ═══════════════════════════════════════════════ */

"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import {
    RenderConfig,
    ROTATION_MODES,
    COLOR_MODES,
    SPIRAL_TYPES,
    FONT_FAMILIES,
    FONT_WEIGHTS,
} from "./types";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

/* ═══════════════════════════════════════════════
   Slice Factories
   Validators omitted — runtime clamping in
   buildRenderConfig() per Section 6 rules.
   ═══════════════════════════════════════════════ */

function num(
    name: string,
    displayName: string,
    value: number,
): formattingSettings.NumUpDown {
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
   Formatting Cards
   Card name properties must match capabilities.json
   object keys exactly.
   ═══════════════════════════════════════════════ */

/* ── Word Settings Card ── */

class WordSettingsCard extends FormattingSettingsCard {
    minFontSize = num("minFontSize", "Min Font Size", 12);
    maxFontSize = num("maxFontSize", "Max Font Size", 60);
    fontFamily = dropdown("fontFamily", "Font Family",
        FONT_FAMILIES,
        ["Segoe UI", "Arial", "Impact", "Georgia", "Courier New", "Comic Sans MS"],
        0,
    );
    fontWeight = dropdown("fontWeight", "Font Weight",
        FONT_WEIGHTS,
        ["Normal", "Bold", "Black (900)"],
        1,
    );
    maxWords = num("maxWords", "Max Words", 200);
    padding = num("padding", "Padding", 3);

    name: string = "wordSettings";
    displayName: string = "Word Settings";
    slices: FormattingSettingsSlice[] = [
        this.minFontSize, this.maxFontSize, this.fontFamily,
        this.fontWeight, this.maxWords, this.padding,
    ];
}

/* ── Rotation Settings Card ── */

class RotationSettingsCard extends FormattingSettingsCard {
    rotationMode = dropdown("rotationMode", "Rotation Mode",
        ROTATION_MODES,
        ["None", "Right Angle", "Random", "Custom"],
        1,
    );
    customAngle = num("customAngle", "Custom Angle", 45);
    rightAngleChance = pct("rightAngleChance", "Right Angle Chance (%)", 50);
    randomMin = num("randomMin", "Random Min Angle", -60);
    randomMax = num("randomMax", "Random Max Angle", 60);

    name: string = "rotationSettings";
    displayName: string = "Rotation Settings";
    slices: FormattingSettingsSlice[] = [
        this.rotationMode, this.customAngle, this.rightAngleChance,
        this.randomMin, this.randomMax,
    ];
}

/* ── Colour Settings Card ── */

class ColorSettingsCard extends FormattingSettingsCard {
    colorMode = dropdown("colorMode", "Colour Mode",
        COLOR_MODES,
        ["Palette", "Gradient", "Field", "Single Colour"],
        0,
    );
    singleColor = color("singleColor", "Single Colour", "#3B82F6");
    gradientStart = color("gradientStart", "Gradient Start", "#3B82F6");
    gradientEnd = color("gradientEnd", "Gradient End", "#EF4444");
    selectedColor = color("selectedColor", "Selected Colour", "#2563EB");
    hoverOpacity = pct("hoverOpacity", "Hover Opacity (%)", 80);

    name: string = "colorSettings";
    displayName: string = "Colour Settings";
    slices: FormattingSettingsSlice[] = [
        this.colorMode, this.singleColor, this.gradientStart,
        this.gradientEnd, this.selectedColor, this.hoverOpacity,
    ];
}

/* ── Layout Settings Card ── */

class LayoutSettingsCard extends FormattingSettingsCard {
    spiralType = dropdown("spiralType", "Spiral Type",
        SPIRAL_TYPES,
        ["Archimedean", "Rectangular"],
        0,
    );
    centerBias = pct("centerBias", "Center Bias (%)", 70);

    name: string = "layoutSettings";
    displayName: string = "Layout Settings";
    slices: FormattingSettingsSlice[] = [
        this.spiralType, this.centerBias,
    ];
}

/* ═══════════════════════════════════════════════
   Root Model
   ═══════════════════════════════════════════════ */

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    wordSettingsCard = new WordSettingsCard();
    rotationSettingsCard = new RotationSettingsCard();
    colorSettingsCard = new ColorSettingsCard();
    layoutSettingsCard = new LayoutSettingsCard();

    cards = [
        this.wordSettingsCard,
        this.rotationSettingsCard,
        this.colorSettingsCard,
        this.layoutSettingsCard,
    ];
}

/* ═══════════════════════════════════════════════
   buildRenderConfig()
   All percent -> fraction conversions and
   enum sanitisation happens here (S2).
   ═══════════════════════════════════════════════ */

/** Sanitise a string value against an allowed set */
function safeEnum<T extends string>(
    val: string | undefined,
    allowed: readonly T[],
    fallback: T,
): T {
    if (val && (allowed as readonly string[]).includes(val)) return val as T;
    return fallback;
}

/** Clamp a numeric value */
function clampVal(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function buildRenderConfig(model: VisualFormattingSettingsModel): RenderConfig {
    const w = model.wordSettingsCard;
    const r = model.rotationSettingsCard;
    const c = model.colorSettingsCard;
    const l = model.layoutSettingsCard;

    return {
        word: {
            minFontSize: clampVal(w.minFontSize.value, 6, 30),
            maxFontSize: clampVal(w.maxFontSize.value, 20, 120),
            fontFamily: safeEnum(w.fontFamily.value?.value as string | undefined, FONT_FAMILIES, "Segoe UI"),
            fontWeight: safeEnum(w.fontWeight.value?.value as string | undefined, FONT_WEIGHTS, "bold"),
            maxWords: clampVal(w.maxWords.value, 10, 500),
            padding: clampVal(w.padding.value, 0, 10),
        },
        rotation: {
            rotationMode: safeEnum(r.rotationMode.value?.value as string | undefined, ROTATION_MODES, "rightAngle"),
            customAngle: clampVal(r.customAngle.value, -90, 90),
            rightAngleChance: clampVal(r.rightAngleChance.value, 0, 100) / 100,
            randomMin: clampVal(r.randomMin.value, -90, 0),
            randomMax: clampVal(r.randomMax.value, 0, 90),
        },
        color: {
            colorMode: safeEnum(c.colorMode.value?.value as string | undefined, COLOR_MODES, "palette"),
            singleColor: c.singleColor.value?.value || "#3B82F6",
            gradientStart: c.gradientStart.value?.value || "#3B82F6",
            gradientEnd: c.gradientEnd.value?.value || "#EF4444",
            selectedColor: c.selectedColor.value?.value || "#2563EB",
            hoverOpacity: clampVal(c.hoverOpacity.value, 0, 100) / 100,
        },
        layout: {
            spiralType: safeEnum(l.spiralType.value?.value as string | undefined, SPIRAL_TYPES, "archimedean"),
            centerBias: clampVal(l.centerBias.value, 0, 100) / 100,
        },
    };
}
