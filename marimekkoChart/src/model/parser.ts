/*
 *  Marimekko Chart – Power BI Custom Visual
 *  model/parser.ts — Parse DataViewTable rows into MekkoColumns
 */
"use strict";

import powerbi from "powerbi-visuals-api";
import IVisualHost = powerbi.extensibility.visual.IVisualHost;

import { ColumnIndex, MekkoColumn, MekkoSegment, ParseResult, TooltipExtra } from "../types";

/* ═══════════════════════════════════════════════
   Intermediate row structure
   ═══════════════════════════════════════════════ */

interface RawRow {
    xCategory: string;
    segmentCategory: string;
    value: number;
    absValue: number;
    isNegative: boolean;
    selectionId: powerbi.visuals.ISelectionId | null;
    tooltipExtras: TooltipExtra[];
    rowIndex: number;
}

/* ═══════════════════════════════════════════════
   Main parse function
   ═══════════════════════════════════════════════ */

/**
 * Parse the DataViewTable into MekkoColumns with layout-ready segments.
 * This is the full data pipeline: row extraction → aggregation → column + segment building.
 */
export function parseData(
    table: powerbi.DataViewTable,
    cols: ColumnIndex,
    host: IVisualHost,
): ParseResult {
    /* ── Step 1: Extract raw rows ── */
    const rawRows: RawRow[] = [];
    const segmentCategorySet = new Set<string>();
    let hasNegatives = false;

    const rows = table.rows;
    if (!rows) return { columns: [], segmentCategories: [], grandTotal: 0, hasNegatives: false };

    for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        const xCat = String(row[cols.xCategory] ?? "");
        const segCat = String(row[cols.segmentCategory] ?? "");
        const rawVal = Number(row[cols.value]);

        if (!xCat || !segCat || isNaN(rawVal)) continue;

        const isNeg = rawVal < 0;
        if (isNeg) hasNegatives = true;

        /* Tooltip extras */
        const tooltipExtras: TooltipExtra[] = [];
        for (const ti of cols.tooltipFields) {
            const col = table.columns[ti];
            const val = row[ti];
            if (val !== null && val !== undefined) {
                tooltipExtras.push({
                    displayName: col.displayName ?? `Field ${ti}`,
                    value: String(val),
                });
            }
        }

        /* Selection ID */
        let selectionId: powerbi.visuals.ISelectionId | null = null;
        try {
            selectionId = host.createSelectionIdBuilder()
                .withTable(table, r)
                .createSelectionId();
        } catch {
            /* Selection not available — silently skip */
        }

        segmentCategorySet.add(segCat);
        rawRows.push({
            xCategory: xCat,
            segmentCategory: segCat,
            value: rawVal,
            absValue: Math.abs(rawVal),
            isNegative: isNeg,
            selectionId,
            tooltipExtras,
            rowIndex: r,
        });
    }

    /* ── Step 2: Sort segment categories for consistent ordering ── */
    const segmentCategories = Array.from(segmentCategorySet).sort();

    /* ── Step 3: Group by xCategory ── */
    const xCatOrder: string[] = [];
    const grouped = new Map<string, RawRow[]>();
    for (const row of rawRows) {
        if (!grouped.has(row.xCategory)) {
            xCatOrder.push(row.xCategory);
            grouped.set(row.xCategory, []);
        }
        grouped.get(row.xCategory)!.push(row);
    }

    /* ── Step 4: Compute grand total ── */
    let grandTotal = 0;
    const columnTotals = new Map<string, number>();
    for (const [xCat, rows] of grouped) {
        const total = rows.reduce((sum, r) => sum + r.absValue, 0);
        columnTotals.set(xCat, total);
        grandTotal += total;
    }

    if (grandTotal === 0) grandTotal = 1; /* avoid division by zero */

    /* ── Step 5: Build MekkoColumns with segments ── */
    const columns: MekkoColumn[] = [];

    for (const xCat of xCatOrder) {
        const rows = grouped.get(xCat)!;
        const colTotal = columnTotals.get(xCat) ?? 0;

        /* Sort rows by segmentCategory (consistent stacking order) */
        rows.sort((a, b) => {
            const ai = segmentCategories.indexOf(a.segmentCategory);
            const bi = segmentCategories.indexOf(b.segmentCategory);
            return ai - bi;
        });

        const segments: MekkoSegment[] = rows.map((row) => ({
            xCategory: row.xCategory,
            segmentCategory: row.segmentCategory,
            value: row.value,
            absValue: row.absValue,
            isNegative: row.isNegative,
            fractionOfColumn: colTotal > 0 ? row.absValue / colTotal : 0,
            fractionOfTotal: row.absValue / grandTotal,
            y: 0,       /* computed in layout pass */
            height: 0,  /* computed in layout pass */
            color: "",  /* assigned by render */
            selectionId: row.selectionId,
            tooltipExtras: row.tooltipExtras,
            rowIndex: row.rowIndex,
        }));

        columns.push({
            xCategory: xCat,
            columnTotal: colTotal,
            fractionOfTotal: colTotal / grandTotal,
            x: 0,      /* computed in layout pass */
            width: 0,   /* computed in layout pass */
            segments,
        });
    }

    return { columns, segmentCategories, grandTotal, hasNegatives };
}
