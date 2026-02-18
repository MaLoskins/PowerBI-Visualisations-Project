/*
 *  Performance Flow — model/parser.ts
 *  parseFlowRows() — row → FlowRow domain objects
 */
"use strict";

import powerbi from "powerbi-visuals-api";
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataViewTable = powerbi.DataViewTable;

import { ColumnIndex, FlowRow } from "../types";
import { isValidHex } from "../utils/color";

export interface ParseResult {
    rows: FlowRow[];
}

/** Parse DataViewTable rows into typed FlowRow objects */
export function parseFlowRows(
    table: DataViewTable,
    cols: ColumnIndex,
    host: IVisualHost,
): ParseResult {
    const rows: FlowRow[] = [];
    const tableRows = table.rows;
    if (!tableRows) return { rows };

    for (let r = 0; r < tableRows.length; r++) {
        const row = tableRows[r];

        const sourceName = row[cols.source];
        const destName = row[cols.destination];
        const rawValue = row[cols.value];

        /* Skip rows missing required fields (P1: never throw) */
        if (sourceName == null || destName == null || rawValue == null) continue;

        const sourceStr = String(sourceName).trim();
        const destStr = String(destName).trim();
        if (!sourceStr || !destStr) continue;

        const numVal = Number(rawValue);
        if (isNaN(numVal) || numVal <= 0) continue;

        /* Colour override */
        let linkColorValue: string | null = null;
        if (cols.linkColor >= 0) {
            const raw = row[cols.linkColor];
            if (raw != null) {
                const hex = String(raw).trim();
                if (isValidHex(hex)) linkColorValue = hex;
            }
        }

        /* Tooltip extras */
        const tooltipExtras: powerbi.extensibility.VisualTooltipDataItem[] = [];
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

        /* Selection ID */
        const selectionId = host
            .createSelectionIdBuilder()
            .withTable(table, r)
            .createSelectionId();

        rows.push({
            source: sourceStr,
            destination: destStr,
            value: numVal,
            linkColorValue,
            selectionId,
            tooltipExtras,
        });
    }

    return { rows };
}
