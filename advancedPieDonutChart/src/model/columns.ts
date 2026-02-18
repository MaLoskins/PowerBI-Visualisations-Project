/*
 *  Advanced Pie / Donut Chart – Power BI Custom Visual
 *  model/columns.ts – resolveColumns() – data-role → index mapping
 */
"use strict";

import powerbi from "powerbi-visuals-api";
import { ColumnIndex } from "../types";

/** Map data-role names to column indices in the table (M1) */
export function resolveColumns(
    table: powerbi.DataViewTable,
): ColumnIndex | null {
    const cols: ColumnIndex = {
        category: -1,
        value: -1,
        outerCategory: -1,
        tooltipFields: [],
    };

    for (let i = 0; i < table.columns.length; i++) {
        const roles = table.columns[i].roles;
        if (!roles) continue;
        if (roles["category"]) cols.category = i;
        if (roles["value"]) cols.value = i;
        if (roles["outerCategory"]) cols.outerCategory = i;
        if (roles["tooltipFields"]) cols.tooltipFields.push(i);
    }

    /* Required columns must be present */
    if (cols.category < 0 || cols.value < 0) return null;
    return cols;
}
