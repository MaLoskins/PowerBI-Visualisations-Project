/* ═══════════════════════════════════════════════
   Hierarchy Filter Slicer – Parser
   Extracts level values from categorical data (P1)
   ═══════════════════════════════════════════════ */

"use strict";

import { ColumnIndex } from "../types";

import powerbi from "powerbi-visuals-api";
import DataViewCategorical = powerbi.DataViewCategorical;

/** A single parsed row: one value per hierarchy level. */
export interface ParsedRow {
    /** The display value at each level (index = level) */
    levelValues: string[];
    /** Original row index in the data view (for filter identity) */
    rowIndex: number;
}

/**
 * Parse the categorical data view into an array of ParsedRow objects.
 * Each row contains a string value at every hierarchy level.
 * Rows with null/undefined/blank values at any level are silently skipped.
 */
export function parseRows(
    categorical: DataViewCategorical,
    cols: ColumnIndex,
): ParsedRow[] {
    const categories = categorical.categories;
    if (!categories || categories.length === 0) return [];

    const firstCat = categories[cols.categoryIndices[0]];
    if (!firstCat || !firstCat.values) return [];

    const rowCount = firstCat.values.length;
    const result: ParsedRow[] = [];

    for (let r = 0; r < rowCount; r++) {
        const levelValues: string[] = [];
        let isValid = true;

        for (let lvl = 0; lvl < cols.levelCount; lvl++) {
            const catIdx = cols.categoryIndices[lvl];
            const rawVal = categories[catIdx].values[r];

            if (rawVal === null || rawVal === undefined || String(rawVal).trim() === "") {
                isValid = false;
                break;
            }

            levelValues.push(String(rawVal));
        }

        if (isValid) {
            result.push({ levelValues, rowIndex: r });
        }
    }

    return result;
}
