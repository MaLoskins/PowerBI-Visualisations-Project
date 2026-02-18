/*
 *  Bullet Chart – Power BI Custom Visual
 *  src/model/parser.ts
 *
 *  Parses DataViewTable rows into BulletItem domain objects.
 */
"use strict";

import powerbi from "powerbi-visuals-api";
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import { ColumnIndex, BulletItem, ParseResult, TooltipExtra } from "../types";

/** Read a numeric value from a row cell, returning null if missing. */
function numOrNull(row: powerbi.DataViewTableRow, idx: number): number | null {
    if (idx < 0) return null;
    const v = row[idx];
    if (v === null || v === undefined) return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
}

/** Parse all table rows into bullet items. */
export function parseRows(
    table: powerbi.DataViewTable,
    cols: ColumnIndex,
    host: IVisualHost,
): ParseResult {
    const items: BulletItem[] = [];
    const hasActual = cols.actual >= 0;
    const hasTarget = cols.target >= 0;
    const hasRange1 = cols.range1 >= 0;
    const hasRange2 = cols.range2 >= 0;
    const hasRange3 = cols.range3 >= 0;

    if (!hasActual || cols.category < 0) {
        return { items: [], hasActual, hasTarget, hasRange1, hasRange2, hasRange3 };
    }

    const rows = table.rows ?? [];
    for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        const category = cols.category >= 0 ? String(row[cols.category] ?? "") : `Row ${r + 1}`;
        const actual = numOrNull(row, cols.actual);
        if (actual === null) continue; // skip rows with missing actual

        const target = numOrNull(row, cols.target);
        let range1 = numOrNull(row, cols.range1);
        let range2 = numOrNull(row, cols.range2);
        let range3 = numOrNull(row, cols.range3);
        const maxValue = numOrNull(row, cols.maxValue);

        /* ── Clamp ranges to be non-decreasing (B1) ── */
        if (range1 !== null && range2 !== null && range2 < range1) range2 = range1;
        if (range2 !== null && range3 !== null && range3 < range2) range3 = range2;
        if (range1 !== null && range3 !== null && range1 > range3) range1 = range3;

        /* ── Tooltip extras ── */
        const tooltipExtras: TooltipExtra[] = [];
        for (const ti of cols.tooltipFields) {
            const col = table.columns[ti];
            const val = row[ti];
            if (val !== null && val !== undefined) {
                tooltipExtras.push({
                    displayName: col.displayName,
                    value: String(val),
                });
            }
        }

        /* ── Resolved axis max for this item ── */
        const candidates = [actual, target, range1, range2, range3, maxValue].filter(
            (v): v is number => v !== null,
        );
        const resolvedMax = maxValue !== null && maxValue > 0 ? maxValue : Math.max(...candidates, 0);

        /* ── Selection ID ── */
        const selectionId = host
            .createSelectionIdBuilder()
            .withTable(table, r)
            .createSelectionId();

        items.push({
            category,
            actual,
            target,
            range1,
            range2,
            range3,
            maxValue,
            tooltipExtras,
            selectionId,
            resolvedMax,
        });
    }

    return { items, hasActual, hasTarget, hasRange1, hasRange2, hasRange3 };
}
