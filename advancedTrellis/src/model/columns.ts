/* ═══════════════════════════════════════════════
   Advanced Trellis – Column Resolution
   ═══════════════════════════════════════════════ */

"use strict";

import type { ColumnIndex } from "../types";

/**
 * Resolve data-role names to column indices in the DataViewTable.
 * Returns -1 for missing optional roles.
 */
export function resolveColumns(
    columns: { roles?: Record<string, boolean> }[],
): ColumnIndex {
    const idx: ColumnIndex = {
        trellisBy: -1,
        category: -1,
        value: -1,
        series: -1,
        tooltipFields: [],
    };

    for (let i = 0; i < columns.length; i++) {
        const roles = columns[i].roles;
        if (!roles) continue;

        if (roles["trellisBy"]) idx.trellisBy = i;
        if (roles["category"]) idx.category = i;
        if (roles["value"]) idx.value = i;
        if (roles["series"]) idx.series = i;
        if (roles["tooltipFields"]) idx.tooltipFields.push(i);
    }

    return idx;
}

/** Check whether all required columns are present */
export function hasRequiredColumns(cols: ColumnIndex): boolean {
    return cols.trellisBy >= 0 && cols.category >= 0 && cols.value >= 0;
}
