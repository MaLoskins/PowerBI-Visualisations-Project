/*
 *  Bullet Chart – Power BI Custom Visual
 *  src/model/columns.ts
 *
 *  Maps data-role names to column indices in the DataViewTable.
 */
"use strict";

import powerbi from "powerbi-visuals-api";
import { ColumnIndex } from "../types";

/** Resolve data-role → column index mapping. Returns -1 for missing optional roles. */
export function resolveColumns(table: powerbi.DataViewTable): ColumnIndex {
    const idx: ColumnIndex = {
        category: -1,
        actual: -1,
        target: -1,
        range1: -1,
        range2: -1,
        range3: -1,
        maxValue: -1,
        tooltipFields: [],
    };

    for (let i = 0; i < table.columns.length; i++) {
        const roles = table.columns[i].roles;
        if (!roles) continue;

        if (roles["category"]) idx.category = i;
        if (roles["actual"]) idx.actual = i;
        if (roles["target"]) idx.target = i;
        if (roles["range1"]) idx.range1 = i;
        if (roles["range2"]) idx.range2 = i;
        if (roles["range3"]) idx.range3 = i;
        if (roles["maxValue"]) idx.maxValue = i;
        if (roles["tooltipFields"]) idx.tooltipFields.push(i);
    }

    return idx;
}
