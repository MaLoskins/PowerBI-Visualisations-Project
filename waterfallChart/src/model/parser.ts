/* ═══════════════════════════════════════════════
   WaterfallChart - Row Parser
   Parse DataViewTable rows into WaterfallRawItem[]
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import { ColumnIndex, WaterfallRawItem, TooltipExtra } from "../types";

/**
 * Parse each table row into a typed WaterfallRawItem.
 * Rows missing required fields (category/value) are silently skipped.
 */
export function parseRows(
    table: powerbi.DataViewTable,
    colIndex: ColumnIndex,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Power BI SDK host typing workaround
    host: any,
): WaterfallRawItem[] {
    const rows = table.rows ?? [];
    const items: WaterfallRawItem[] = [];

    for (let r = 0; r < rows.length; r++) {
        const row = rows[r];

        /* ── Required fields ── */
        const catRaw = colIndex.category >= 0 ? row[colIndex.category] : null;
        const valRaw = colIndex.value >= 0 ? row[colIndex.value] : null;

        if (catRaw == null || valRaw == null) continue;

        const category = String(catRaw);
        const value = Number(valRaw);
        if (isNaN(value)) continue;

        /* ── Optional isTotal flag ── */
        let isTotal = false;
        if (colIndex.isTotal >= 0) {
            const totalRaw = row[colIndex.isTotal];
            isTotal = parseIsTotalFlag(totalRaw);
        }

        /* ── Tooltip extras ── */
        const tooltipExtras: TooltipExtra[] = [];
        for (const tIdx of colIndex.tooltipFields) {
            const col = table.columns[tIdx];
            const val = row[tIdx];
            if (val != null) {
                tooltipExtras.push({
                    displayName: col.displayName ?? `Field ${tIdx}`,
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
            category,
            value,
            isTotal,
            selectionId,
            tooltipExtras,
            rowIndex: r,
        });
    }

    return items;
}

/** Parse various isTotal representations to boolean. */
function parseIsTotalFlag(raw: unknown): boolean {
    if (raw == null) return false;
    if (typeof raw === "boolean") return raw;
    if (typeof raw === "number") return raw !== 0;
    const str = String(raw).toLowerCase().trim();
    return str === "true" || str === "yes" || str === "total" || str === "1";
}
