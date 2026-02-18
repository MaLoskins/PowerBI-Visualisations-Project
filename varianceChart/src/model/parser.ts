/* ═══════════════════════════════════════════════
   model/parser.ts - Row parsing into VarianceItem domain objects
   ═══════════════════════════════════════════════ */
"use strict";

import powerbi from "powerbi-visuals-api";
import { ColumnIndex, ParseResult, VarianceItem } from "../types";

import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataViewTable = powerbi.DataViewTable;

/**
 * Parse DataViewTable rows into typed VarianceItem objects.
 * Rows missing required numeric values are silently skipped. (V3)
 */
export function parseRows(
    table: DataViewTable,
    cols: ColumnIndex,
    host: IVisualHost,
): ParseResult {
    const rows = table.rows ?? [];
    const items: VarianceItem[] = [];

    for (let r = 0; r < rows.length; r++) {
        const row = rows[r];

        /* ── Extract required fields ── */
        const categoryRaw = row[cols.category];
        const actualRaw = row[cols.actual];
        const budgetRaw = row[cols.budget];

        /* Skip rows with missing required data */
        if (categoryRaw == null || actualRaw == null || budgetRaw == null) continue;

        const actualVal = Number(actualRaw);
        const budgetVal = Number(budgetRaw);
        if (!isFinite(actualVal) || !isFinite(budgetVal)) continue;

        const variance = actualVal - budgetVal;
        const variancePercent = budgetVal !== 0 ? (variance / Math.abs(budgetVal)) * 100 : 0;

        /* ── Tooltip extras ── */
        const tooltipExtras: { displayName: string; value: string }[] = [];
        for (const ti of cols.tooltipFields) {
            const col = table.columns[ti];
            const val = row[ti];
            if (val != null && col) {
                tooltipExtras.push({
                    displayName: col.displayName ?? `Field ${ti}`,
                    value: String(val),
                });
            }
        }

        /* ── Selection ID ── */
        const selectionId = host
            .createSelectionIdBuilder()
            .withTable(table, r)
            .createSelectionId();

        items.push({
            category: String(categoryRaw),
            actual: actualVal,
            budget: budgetVal,
            variance,
            variancePercent,
            selectionId,
            tooltipExtras,
            rowIndex: r,
        });
    }

    return { items, hasData: items.length > 0 };
}
