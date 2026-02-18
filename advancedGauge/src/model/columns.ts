/* ═══════════════════════════════════════════════
   Advanced Gauge – Column Resolution
   Maps data-role names to column indices
   ═══════════════════════════════════════════════ */
"use strict";

import type { ColumnIndex } from "../types";

/**
 * Resolve data-role names to column indices from a DataViewTable.
 * Returns -1 for unmapped roles, empty array for tooltipFields if none found.
 */
export function resolveColumns(
    columns: { roles?: Record<string, boolean> }[],
): ColumnIndex {
    const idx: ColumnIndex = {
        value: -1,
        target: -1,
        minValue: -1,
        maxValue: -1,
        range1Max: -1,
        range2Max: -1,
        range3Max: -1,
        tooltipFields: [],
    };

    for (let i = 0; i < columns.length; i++) {
        const roles = columns[i].roles;
        if (!roles) continue;

        if (roles["value"]) idx.value = i;
        if (roles["target"]) idx.target = i;
        if (roles["minValue"]) idx.minValue = i;
        if (roles["maxValue"]) idx.maxValue = i;
        if (roles["range1Max"]) idx.range1Max = i;
        if (roles["range2Max"]) idx.range2Max = i;
        if (roles["range3Max"]) idx.range3Max = i;
        if (roles["tooltipFields"]) idx.tooltipFields.push(i);
    }

    return idx;
}
