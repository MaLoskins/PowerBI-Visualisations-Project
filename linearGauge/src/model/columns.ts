/* ═══════════════════════════════════════════════
   Linear Gauge – Column Resolution
   Maps data-role names to table column indices
   ═══════════════════════════════════════════════ */
"use strict";

import powerbi from "powerbi-visuals-api";
import DataViewTableColumn = powerbi.DataViewMetadataColumn;
import { ColumnIndex } from "../types";

/**
 * Resolve data-role names to column indices in the DataViewTable.
 * Returns -1 for optional roles that are not bound.
 * tooltipFields collects all columns with that role.
 */
export function resolveColumns(columns: DataViewTableColumn[]): ColumnIndex {
    const idx: ColumnIndex = {
        category: -1,
        value: -1,
        target: -1,
        target2: -1,
        minValue: -1,
        maxValue: -1,
        range1Max: -1,
        range2Max: -1,
        tooltipFields: [],
    };

    for (let i = 0; i < columns.length; i++) {
        const roles = columns[i].roles;
        if (!roles) continue;
        if (roles["category"])    idx.category = i;
        if (roles["value"])       idx.value = i;
        if (roles["target"])      idx.target = i;
        if (roles["target2"])     idx.target2 = i;
        if (roles["minValue"])    idx.minValue = i;
        if (roles["maxValue"])    idx.maxValue = i;
        if (roles["range1Max"])   idx.range1Max = i;
        if (roles["range2Max"])   idx.range2Max = i;
        if (roles["tooltipFields"]) idx.tooltipFields.push(i);
    }

    return idx;
}

/** Check whether the required "value" role is bound */
export function hasRequiredColumns(cols: ColumnIndex): boolean {
    return cols.value >= 0;
}
