/* ═══════════════════════════════════════════════
   Advanced Gauge – Data Parser
   Reads DataViewTable row(s) into GaugeData
   ═══════════════════════════════════════════════ */
"use strict";

import type { ColumnIndex, GaugeData, TooltipField } from "../types";

/**
 * Parse result from the data pipeline.
 * For a gauge, we only use the first row.
 */
export interface ParseResult {
    data: GaugeData | null;
    hasValue: boolean;
}

/**
 * Parse the first row of a DataViewTable into GaugeData.
 *
 * @param rows       - table.rows from the DataView
 * @param columns    - table.columns metadata (for format strings & display names)
 * @param cols       - resolved ColumnIndex
 * @param createId   - callback to create a SelectionId for the row
 */
export function parseGaugeData(
    rows: unknown[][] | undefined,
    columns: { displayName?: string; format?: string }[],
    cols: ColumnIndex,
    createId: (rowIndex: number) => unknown,
): ParseResult {
    if (!rows || rows.length === 0 || cols.value < 0) {
        return { data: null, hasValue: false };
    }

    const row = rows[0];

    const rawValue = toNumber(row[cols.value]);
    if (rawValue === null) {
        return { data: null, hasValue: false };
    }

    const target = cols.target >= 0 ? toNumber(row[cols.target]) : null;
    const minValue = cols.minValue >= 0 ? toNumber(row[cols.minValue]) ?? 0 : 0;

    /* ── Determine max value ── */
    let maxValue: number;
    if (cols.maxValue >= 0 && toNumber(row[cols.maxValue]) !== null) {
        maxValue = toNumber(row[cols.maxValue])!;
    } else {
        // Auto: pick a sensible max from the data
        maxValue = autoMax(rawValue, target);
    }

    // Ensure max > min
    if (maxValue <= minValue) {
        maxValue = minValue + Math.abs(rawValue) * 1.5 + 1;
    }

    /* ── Range boundaries ── */
    const range1Max = cols.range1Max >= 0 ? toNumber(row[cols.range1Max]) : null;
    const range2Max = cols.range2Max >= 0 ? toNumber(row[cols.range2Max]) : null;
    const range3Max = cols.range3Max >= 0 ? toNumber(row[cols.range3Max]) : null;
    const hasRanges = range1Max !== null || range2Max !== null || range3Max !== null;

    /* ── Tooltip extras ── */
    const tooltipItems: TooltipField[] = [];
    for (const ti of cols.tooltipFields) {
        const displayName = columns[ti]?.displayName ?? `Column ${ti}`;
        const val = row[ti];
        tooltipItems.push({
            displayName,
            value: val == null ? "" : String(val),
        });
    }

    /* ── Value format string from column metadata ── */
    const valueFormatString = columns[cols.value]?.format ?? "";

    // Selection ID – cast through unknown since host types vary
    const selectionId = createId(0) as GaugeData["selectionId"];

    return {
        data: {
            value: rawValue,
            target,
            minValue,
            maxValue,
            range1Max,
            range2Max,
            range3Max,
            hasRanges,
            selectionId,
            tooltipItems,
            valueFormatString,
        },
        hasValue: true,
    };
}

/* ── Helpers ── */

function toNumber(val: unknown): number | null {
    if (val === null || val === undefined) return null;
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
}

/** Compute an automatic maximum when maxValue is not provided. */
function autoMax(value: number, target: number | null): number {
    const ref = target !== null ? Math.max(Math.abs(value), Math.abs(target)) : Math.abs(value);
    if (ref === 0) return 100;
    // Round up to a nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(ref)));
    return Math.ceil((ref * 1.2) / magnitude) * magnitude;
}
