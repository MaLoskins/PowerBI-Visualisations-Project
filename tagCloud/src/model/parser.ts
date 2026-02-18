/* ═══════════════════════════════════════════════
   Tag Cloud – Row Parser
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import { ColumnIndex, WordItem } from "../types";
import { toDisplayString } from "../utils/format";

export interface ParseResult {
    words: WordItem[];
}

/**
 * Parse table rows into WordItem domain objects.
 * Silently skips rows with missing required fields.
 */
export function parseRows(
    table: powerbi.DataViewTable,
    cols: ColumnIndex,
    host: IVisualHost,
): ParseResult {
    const rows = table.rows ?? [];
    const words: WordItem[] = [];

    for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        const text = row[cols.word];
        const value = row[cols.size];

        /* Skip rows missing required fields */
        if (text == null || text === "" || value == null) continue;

        const numValue = typeof value === "number" ? value : parseFloat(String(value));
        if (isNaN(numValue) || numValue <= 0) continue;

        /* Colour field (optional) */
        const colorFieldValue = cols.colorField >= 0 && row[cols.colorField] != null
            ? String(row[cols.colorField])
            : null;

        /* Tooltip extras (optional) */
        const tooltipExtras: { displayName: string; value: string }[] = [];
        for (const ti of cols.tooltipCols) {
            const col = table.columns[ti];
            tooltipExtras.push({
                displayName: col.displayName ?? `Field ${ti}`,
                value: toDisplayString(row[ti]),
            });
        }

        /* Build selection ID */
        const selectionId = host.createSelectionIdBuilder()
            .withTable(table, r)
            .createSelectionId();

        words.push({
            text: String(text),
            value: numValue,
            colorFieldValue,
            tooltipExtras,
            selectionId,
        });
    }

    return { words };
}
