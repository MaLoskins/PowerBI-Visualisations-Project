/* ═══════════════════════════════════════════════
   model/columns.ts - Data-role --> column index mapping
   ═══════════════════════════════════════════════ */
"use strict";

import { ColumnIndex } from "../types";
import powerbi from "powerbi-visuals-api";
import DataViewTableColumn = powerbi.DataViewMetadataColumn;

/**
 * Resolve data-role names to column indices from the DataViewTable.
 * Returns null if required roles (category, actual, budget) are missing.
 */
export function resolveColumns(
    columns: DataViewTableColumn[],
): ColumnIndex | null {
    let category = -1;
    let actual = -1;
    let budget = -1;
    const tooltipFields: number[] = [];

    for (let i = 0; i < columns.length; i++) {
        const roles = columns[i].roles;
        if (!roles) continue;

        if (roles["category"]) category = i;
        if (roles["actual"]) actual = i;
        if (roles["budget"]) budget = i;
        if (roles["tooltipFields"]) tooltipFields.push(i);
    }

    /* Required fields check (V2) */
    if (category < 0 || actual < 0 || budget < 0) {
        return null;
    }

    return { category, actual, budget, tooltipFields };
}
