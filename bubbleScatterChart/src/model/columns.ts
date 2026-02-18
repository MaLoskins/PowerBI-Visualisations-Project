/* ═══════════════════════════════════════════════
   Column Resolution
   Map data-role names to table column indices
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import { ColumnIndex } from "../types";

/**
 * Resolve data-role names to column indices in the table.
 * Returns -1 for missing optional roles, and an array for tooltipFields.
 */
export function resolveColumns(
    table: powerbi.DataViewTable,
): ColumnIndex {
    const cols: ColumnIndex = {
        xValue: -1,
        yValue: -1,
        size: -1,
        category: -1,
        series: -1,
        playAxis: -1,
        tooltipFields: [],
    };

    if (!table || !table.columns) return cols;

    for (let i = 0; i < table.columns.length; i++) {
        const roles = table.columns[i].roles;
        if (!roles) continue;

        if (roles["xValue"]) cols.xValue = i;
        if (roles["yValue"]) cols.yValue = i;
        if (roles["size"]) cols.size = i;
        if (roles["category"]) cols.category = i;
        if (roles["series"]) cols.series = i;
        if (roles["playAxis"]) cols.playAxis = i;
        if (roles["tooltipFields"]) cols.tooltipFields.push(i);
    }

    return cols;
}

/** Check that the minimum required fields are present. */
export function hasRequiredColumns(cols: ColumnIndex): boolean {
    return cols.xValue >= 0 && cols.yValue >= 0 && cols.category >= 0;
}
