/* ═══════════════════════════════════════════════
   model/columns.ts – Data-Role → Index Mapping
   ═══════════════════════════════════════════════ */

"use strict";

import { ColumnIndex } from "../types";

/**
 * Resolve data-role names to column indices in the DataViewTable.
 * Returns null if required roles (actual, budget, at least one category) are missing.
 */
export function resolveColumns(
    columns: { roles?: Record<string, boolean> }[],
): ColumnIndex | null {
    const categoryIndices: number[] = [];
    let actualIndex = -1;
    let budgetIndex = -1;
    const tooltipIndices: number[] = [];

    for (let i = 0; i < columns.length; i++) {
        const roles = columns[i].roles;
        if (!roles) continue;

        if (roles["category"]) {
            categoryIndices.push(i);
        }
        if (roles["actual"]) {
            actualIndex = i;
        }
        if (roles["budget"]) {
            budgetIndex = i;
        }
        if (roles["tooltipFields"]) {
            tooltipIndices.push(i);
        }
    }

    /* ── Validate required roles ── */
    if (categoryIndices.length === 0 || actualIndex < 0 || budgetIndex < 0) {
        return null;
    }

    return { categoryIndices, actualIndex, budgetIndex, tooltipIndices };
}
