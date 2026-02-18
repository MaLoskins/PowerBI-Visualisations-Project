/* ═══════════════════════════════════════════════
   Tag Cloud – Column Resolution
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import { ColumnIndex } from "../types";

/**
 * Map data-role names to column indices in the DataViewTable.
 * Returns null if required roles (word, size) are missing.
 */
export function resolveColumns(table: powerbi.DataViewTable): ColumnIndex | null {
    const cols = table.columns ?? [];

    let word = -1;
    let size = -1;
    let colorField = -1;
    const tooltipCols: number[] = [];

    for (let i = 0; i < cols.length; i++) {
        const roles = cols[i].roles ?? {};
        if (roles["word"]) word = i;
        if (roles["size"]) size = i;
        if (roles["colorField"]) colorField = i;
        if (roles["tooltipFields"]) tooltipCols.push(i);
    }

    /* Required fields must be present */
    if (word < 0 || size < 0) return null;

    return { word, size, colorField, tooltipCols };
}
