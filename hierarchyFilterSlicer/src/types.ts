/* ═══════════════════════════════════════════════
   Hierarchy Filter Slicer – Types
   Domain interfaces, RenderConfig, literal unions
   ═══════════════════════════════════════════════ */

"use strict";

/* ── Check state union (H1) ── */

export const CHECK_STATES = ["unchecked", "checked", "indeterminate"] as const;
export type CheckState = (typeof CHECK_STATES)[number];

/* ── Font family union ── */

export const FONT_FAMILIES = ["Segoe UI", "Arial", "Calibri"] as const;
export type FontFamily = (typeof FONT_FAMILIES)[number];

/* ── Font weight union ── */

export const FONT_WEIGHTS = ["normal", "bold"] as const;
export type FontWeight = (typeof FONT_WEIGHTS)[number];

/* ── Hierarchy node — the primary domain model ── */

export interface HierarchyNode {
    /** Unique key for this node (concatenation of ancestor labels + own label) */
    key: string;
    /** Display label for this node */
    label: string;
    /** Depth in the hierarchy (0-based) */
    level: number;
    /** Child nodes */
    children: HierarchyNode[];
    /** All leaf-level display values reachable from this node (H2) */
    leafValues: string[];
    /** Whether this branch is expanded in the tree */
    isExpanded: boolean;
    /** Current check state — computed from children or direct toggle */
    checkState: CheckState;
    /** Reference to parent node (null for roots) */
    parent: HierarchyNode | null;
    /** Whether this is a leaf (no children) */
    isLeaf: boolean;
}

/* ── Column index result from resolveColumns ── */

export interface ColumnIndex {
    /** Array of category column indices, ordered by level */
    categoryIndices: number[];
    /** Number of hierarchy levels */
    levelCount: number;
}

/* ═══════════════════════════════════════════════
   RenderConfig — single bridge between settings
   and all render code (R1)
   ═══════════════════════════════════════════════ */

export interface RenderConfig {
    tree: {
        indentSize: number;
        rowHeight: number;
        fontSize: number;
        fontColor: string;
        fontFamily: FontFamily;
        selectedFontWeight: FontWeight;
        showIcons: boolean;
        iconSize: number;
    };
    checkbox: {
        checkboxSize: number;
        checkedColor: string;
        uncheckedBorder: string;
        indeterminateColor: string;
        checkboxRadius: number;
    };
    search: {
        showSearchBox: boolean;
        searchPlaceholder: string;
        highlightMatches: boolean;
    };
    header: {
        showHeader: boolean;
        showSelectAll: boolean;
        showExpandCollapse: boolean;
        headerBackground: string;
        headerFontColor: string;
        headerFontSize: number;
        headerBorderColor: string;
    };
    container: {
        background: string;
        borderWidth: number;
        borderColor: string;
        borderRadius: number;
        scrollbarWidth: number;
        scrollbarThumbColor: string;
        scrollbarTrackColor: string;
    };
}

/* ── Interaction callbacks passed to render modules ── */

export interface TreeCallbacks {
    onToggleExpand: (node: HierarchyNode) => void;
    onToggleCheck: (node: HierarchyNode) => void;
}

export interface HeaderCallbacks {
    onSelectAll: () => void;
    onExpandAll: () => void;
    onCollapseAll: () => void;
}

export interface SearchCallbacks {
    onSearchChange: (term: string) => void;
}
