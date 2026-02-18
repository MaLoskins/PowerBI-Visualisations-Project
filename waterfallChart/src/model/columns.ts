/* ═══════════════════════════════════════════════
   WaterfallChart - Column Resolution
   Map data-role names to column indices (W6)
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import { ColumnIndex } from "../types";

/**
 * Scan table columns and map each data-role to its column index.
 * Returns -1 for optional roles not present in the data view.
 */
export function resolveColumns(table: powerbi.DataViewTable): ColumnIndex {
    const cols = table.columns ?? [];
    const result: ColumnIndex = {
        category: -1,
        value: -1,
        isTotal: -1,
        tooltipFields: [],
    };

    for (let i = 0; i < cols.length; i++) {
        const roles = cols[i].roles ?? {};
        if (roles["category"]) result.category = i;
        if (roles["value"]) result.value = i;
        if (roles["isTotal"]) result.isTotal = i;
        if (roles["tooltipFields"]) result.tooltipFields.push(i);
    }

    return result;
}

/** Check that the minimum required data roles are present. */
export function hasRequiredColumns(colIndex: ColumnIndex): boolean {
    return colIndex.category >= 0 && colIndex.value >= 0;
}
