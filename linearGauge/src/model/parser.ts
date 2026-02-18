/* ═══════════════════════════════════════════════
   Linear Gauge – Data Parser
   Transforms DataViewTable rows into GaugeItems
   ═══════════════════════════════════════════════ */
"use strict";

import powerbi from "powerbi-visuals-api";
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataViewTable = powerbi.DataViewTable;

import { ColumnIndex, GaugeItem, ParseResult, TooltipExtra } from "../types";

/**
 * Parse all rows from the DataViewTable into typed GaugeItem objects.
 * Rows missing a value are silently skipped.
 */
export function parseRows(
    table: DataViewTable,
    cols: ColumnIndex,
    host: IVisualHost,
): ParseResult {
    const items: GaugeItem[] = [];
    const rows = table.rows;
    if (!rows) return { items };

    for (let r = 0; r < rows.length; r++) {
        const row = rows[r];

        /* ── Required: value ── */
        const rawValue = cols.value >= 0 ? row[cols.value] : null;
        if (rawValue == null || typeof rawValue !== "number") continue;

        /* ── Optional fields ── */
        const category = cols.category >= 0 && row[cols.category] != null
            ? String(row[cols.category])
            : `Row ${r + 1}`;

        const target = safeNumber(row, cols.target);
        const target2 = safeNumber(row, cols.target2);
        const minValue = safeNumber(row, cols.minValue) ?? 0;
        const range1Max = safeNumber(row, cols.range1Max);
        const range2Max = safeNumber(row, cols.range2Max);

        /* ── Max value: explicit or auto ── */
        let maxValue = safeNumber(row, cols.maxValue);
        if (maxValue == null) {
            // Auto: largest of value, target, target2, range ends
            maxValue = rawValue;
            if (target != null && target > maxValue) maxValue = target;
            if (target2 != null && target2 > maxValue) maxValue = target2;
            if (range1Max != null && range1Max > maxValue) maxValue = range1Max;
            if (range2Max != null && range2Max > maxValue) maxValue = range2Max;
            // Add 10% headroom
            maxValue = maxValue * 1.1;
        }

        /* ── Tooltip extras ── */
        const tooltipExtras: TooltipExtra[] = [];
        for (const ti of cols.tooltipFields) {
            const col = table.columns[ti];
            const val = row[ti];
            if (val != null) {
                tooltipExtras.push({
                    displayName: col.displayName || `Field ${ti}`,
                    value: String(val),
                });
            }
        }

        /* ── Selection ID ── */
        const selectionId = host.createSelectionIdBuilder()
            .withTable(table, r)
            .createSelectionId();

        items.push({
            category,
            value: rawValue,
            target,
            target2,
            minValue,
            maxValue,
            range1Max,
            range2Max,
            tooltipExtras,
            selectionId,
            rowIndex: r,
        });
    }

    return { items };
}

/* ── Helpers ── */

function safeNumber(
    row: powerbi.DataViewTableRow,
    colIdx: number,
): number | null {
    if (colIdx < 0) return null;
    const v = row[colIdx];
    return typeof v === "number" ? v : null;
}
