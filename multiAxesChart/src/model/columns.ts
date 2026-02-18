/* ═══════════════════════════════════════════════
   Column Resolution — map data roles to value
   column indices in the categorical dataView
   ═══════════════════════════════════════════════ */
"use strict";

import type { ColumnIndex } from "../types";
import { MAX_SERIES } from "../types";
import powerbi from "powerbi-visuals-api";
import DataViewCategorical = powerbi.DataViewCategorical;
import DataViewValueColumn = powerbi.DataViewValueColumn;

const MEASURE_ROLES = ["measure1", "measure2", "measure3", "measure4", "measure5", "measure6"];

/** Resolve column indices from the categorical data view. */
export function resolveColumns(categorical: DataViewCategorical): ColumnIndex | null {
    if (!categorical || !categorical.categories || categorical.categories.length === 0) {
        return null;
    }

    const xCategoryIdx = 0; // categories always at index 0

    const measureIndices: (number | null)[] = new Array(MAX_SERIES).fill(null);
    const tooltipIndices: number[] = [];

    const values = categorical.values;
    if (values) {
        for (let v = 0; v < values.length; v++) {
            const col = values[v] as DataViewValueColumn;
            const roles = col.source.roles;
            if (!roles) continue;

            for (let m = 0; m < MEASURE_ROLES.length; m++) {
                if (roles[MEASURE_ROLES[m]]) {
                    measureIndices[m] = v;
                }
            }
            if (roles["tooltipFields"]) {
                tooltipIndices.push(v);
            }
        }
    }

    // At least measure1 must be present
    if (measureIndices[0] === null) return null;

    return { xCategoryIdx, measureIndices, tooltipIndices };
}
