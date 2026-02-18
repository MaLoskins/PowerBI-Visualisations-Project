/*
 *  Performance Flow — model/columns.ts
 *  resolveColumns() — data-role → column index mapping
 */
"use strict";

import { ColumnIndex } from "../types";

/** Resolve data role names to column indices from a DataViewTable */
export function resolveColumns(
    columns: { roles?: Record<string, boolean> }[],
): ColumnIndex | null {
    let source = -1;
    let destination = -1;
    let value = -1;
    let linkColor = -1;
    const tooltipFields: number[] = [];

    for (let i = 0; i < columns.length; i++) {
        const roles = columns[i].roles;
        if (!roles) continue;

        if (roles["source"]) source = i;
        if (roles["destination"]) destination = i;
        if (roles["value"]) value = i;
        if (roles["linkColor"]) linkColor = i;
        if (roles["tooltipFields"]) tooltipFields.push(i);
    }

    /* Required roles must all be present */
    if (source < 0 || destination < 0 || value < 0) return null;

    return { source, destination, value, linkColor, tooltipFields };
}
