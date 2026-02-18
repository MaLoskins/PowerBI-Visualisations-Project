/*
 *  Marimekko Chart – Power BI Custom Visual
 *  model/columns.ts — Data-role → column index mapping
 */
"use strict";

import powerbi from "powerbi-visuals-api";
import { ColumnIndex } from "../types";

/**
 * Resolve data-role names to column indices in a DataViewTable.
 * Returns null if required roles (xCategory, segmentCategory, value) are missing.
 */
export function resolveColumns(
    table: powerbi.DataViewTable,
): ColumnIndex | null {
    let xCategory = -1;
    let segmentCategory = -1;
    let value = -1;
    const tooltipFields: number[] = [];

    for (let i = 0; i < table.columns.length; i++) {
        const roles = table.columns[i].roles;
        if (!roles) continue;

        if (roles["xCategory"]) xCategory = i;
        if (roles["segmentCategory"]) segmentCategory = i;
        if (roles["value"]) value = i;
        if (roles["tooltipFields"]) tooltipFields.push(i);
    }

    /* All three required roles must be present */
    if (xCategory < 0 || segmentCategory < 0 || value < 0) return null;

    return { xCategory, segmentCategory, value, tooltipFields };
}
