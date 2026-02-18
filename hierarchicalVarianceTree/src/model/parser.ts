/* ═══════════════════════════════════════════════
   model/parser.ts – Row → Domain Model
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataViewTable = powerbi.DataViewTable;
import ISelectionId = powerbi.visuals.ISelectionId;

import { ColumnIndex, TooltipExtra } from "../types";
import { safeNumber } from "../utils/format";

/** Raw parsed leaf row before hierarchy assembly (P1) */
export interface LeafRow {
    categoryValues: string[];
    actual: number;
    budget: number;
    selectionId: ISelectionId;
    tooltipExtras: TooltipExtra[];
}

/**
 * Parse every row from the DataViewTable into typed LeafRow objects.
 * Rows with missing required numeric fields are silently skipped.
 */
export function parseLeafRows(
    table: DataViewTable,
    cols: ColumnIndex,
    host: IVisualHost,
): LeafRow[] {
    const rows: LeafRow[] = [];
    const rowCount = table.rows?.length ?? 0;
    const columnMeta = table.columns;

    for (let r = 0; r < rowCount; r++) {
        const row = table.rows![r];

        /* ── Extract category values ── */
        const categoryValues: string[] = [];
        for (const ci of cols.categoryIndices) {
            const raw = row[ci];
            categoryValues.push(raw != null ? String(raw) : "");
        }

        /* ── Extract measures ── */
        const actual = safeNumber(row[cols.actualIndex], NaN);
        const budget = safeNumber(row[cols.budgetIndex], NaN);

        /* Skip rows with missing numerics */
        if (!isFinite(actual) || !isFinite(budget)) continue;

        /* ── Tooltip extras ── */
        const tooltipExtras: TooltipExtra[] = [];
        for (const ti of cols.tooltipIndices) {
            const val = row[ti];
            tooltipExtras.push({
                displayName: columnMeta[ti]?.displayName ?? "",
                value: val != null ? String(val) : "",
            });
        }

        /* ── Selection ID ── */
        const selectionId = host
            .createSelectionIdBuilder()
            .withTable(table, r)
            .createSelectionId();

        rows.push({ categoryValues, actual, budget, selectionId, tooltipExtras });
    }

    return rows;
}
