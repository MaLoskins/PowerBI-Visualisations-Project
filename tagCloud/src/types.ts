/* ═══════════════════════════════════════════════
   Tag Cloud – Domain Types & RenderConfig
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

/* ── Literal Unions (as const + derived type) ── */

export const ROTATION_MODES = ["none", "rightAngle", "random", "custom"] as const;
export type RotationMode = (typeof ROTATION_MODES)[number];

export const COLOR_MODES = ["palette", "gradient", "field", "single"] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

export const SPIRAL_TYPES = ["archimedean", "rectangular"] as const;
export type SpiralType = (typeof SPIRAL_TYPES)[number];

export const FONT_FAMILIES = ["Segoe UI", "Arial", "Impact", "Georgia", "Courier New", "Comic Sans MS"] as const;
export type FontFamily = (typeof FONT_FAMILIES)[number];

export const FONT_WEIGHTS = ["normal", "bold", "900"] as const;
export type FontWeight = (typeof FONT_WEIGHTS)[number];

/* ── Column Index ── */

export interface ColumnIndex {
    word: number;
    size: number;
    colorField: number;
    tooltipCols: number[];
}

/* ── Domain Model ── */

export interface WordItem {
    text: string;
    value: number;
    colorFieldValue: string | null;
    tooltipExtras: { displayName: string; value: string }[];
    selectionId: ISelectionId;
}

/* ── Placed Word (after layout) ── */

export interface PlacedWord extends WordItem {
    x: number;
    y: number;
    fontSize: number;
    rotation: number;
    color: string;
    width: number;
    height: number;
}

/* ── Bounding Box for overlap detection (L1) ── */

export interface BBox {
    x: number;
    y: number;
    w: number;
    h: number;
}

/* ── RenderConfig ── */

export interface RenderConfig {
    word: {
        minFontSize: number;
        maxFontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        maxWords: number;
        padding: number;
    };
    rotation: {
        rotationMode: RotationMode;
        customAngle: number;
        rightAngleChance: number;   /* 0-1 fraction */
        randomMin: number;
        randomMax: number;
    };
    color: {
        colorMode: ColorMode;
        singleColor: string;
        gradientStart: string;
        gradientEnd: string;
        selectedColor: string;
        hoverOpacity: number;       /* 0-1 fraction */
    };
    layout: {
        spiralType: SpiralType;
        centerBias: number;         /* 0-1 fraction */
    };
}

/* ── Interaction Callbacks ── */

export interface CloudCallbacks {
    onClick: (item: WordItem, e: MouseEvent) => void;
    onMouseOver: (item: WordItem, x: number, y: number, e: MouseEvent) => void;
    onMouseMove: (item: WordItem, x: number, y: number, e: MouseEvent) => void;
    onMouseOut: () => void;
}
