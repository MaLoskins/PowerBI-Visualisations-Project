/* ═══════════════════════════════════════════════
   Hierarchy Filter Slicer – Column Resolution
   Maps data-role names to column indices (C1)
   ═══════════════════════════════════════════════ */

"use strict";

import { ColumnIndex } from "../types";

import powerbi from "powerbi-visuals-api";
import DataViewCategorical = powerbi.DataViewCategorical;

/**
 * Resolve the category columns from the categorical data view.
 * Returns an ordered array of category column indices representing
 * hierarchy levels (level 0 = first column, level 1 = second, etc.).
 * Returns null if no category columns are found.
 */
export function resolveColumns(
    categorical: DataViewCategorical | undefined,
): ColumnIndex | null {
    if (!categorical || !categorical.categories || categorical.categories.length === 0) {
        return null;
    }

    const categoryIndices: number[] = [];

    for (let i = 0; i < categorical.categories.length; i++) {
        const col = categorical.categories[i];
        if (col.source && col.source.roles && col.source.roles["category"]) {
            categoryIndices.push(i);
        }
    }

    if (categoryIndices.length === 0) {
        return null;
    }

    return {
        categoryIndices,
        levelCount: categoryIndices.length,
    };
}
