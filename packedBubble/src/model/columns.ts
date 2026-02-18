/* ═══════════════════════════════════════════════
   Packed Bubble Chart – Column Resolution (C1)
   ═══════════════════════════════════════════════ */

"use strict";

import { ColumnIndex } from "../types";
import powerbi from "powerbi-visuals-api";
import DataViewTable = powerbi.DataViewTable;

/** Map data-role names to column indices in the DataViewTable.
 *  Returns -1 for optional roles that are not populated. */
export function resolveColumns(table: DataViewTable): ColumnIndex {
    const cols: ColumnIndex = {
        category: -1,
        value: -1,
        group: -1,
        colorField: -1,
        tooltipStart: -1,
        tooltipCount: 0,
    };

    let firstTooltip = -1;
    let tooltipCount = 0;

    for (let i = 0; i < table.columns.length; i++) {
        const roles = table.columns[i].roles;
        if (!roles) continue;

        if (roles["category"]) cols.category = i;
        else if (roles["value"]) cols.value = i;
        else if (roles["group"]) cols.group = i;
        else if (roles["colorField"]) cols.colorField = i;
        else if (roles["tooltipFields"]) {
            if (firstTooltip < 0) firstTooltip = i;
            tooltipCount++;
        }
    }

    cols.tooltipStart = firstTooltip;
    cols.tooltipCount = tooltipCount;

    return cols;
}

/** Check whether required columns (category + value) are present */
export function hasRequiredColumns(cols: ColumnIndex): boolean {
    return cols.category >= 0 && cols.value >= 0;
}
