/* ═══════════════════════════════════════════════
   Data Parser
   Table rows → ScatterDataPoint domain objects
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import IVisualHost = powerbi.extensibility.visual.IVisualHost;

import {
    ColumnIndex,
    ParseResult,
    ScatterDataPoint,
    TooltipExtra,
} from "../types";
import { getCategoryColor, resetCategoryColors } from "../utils/color";
import { cellToString } from "../utils/format";

/**
 * Parse all table rows into typed ScatterDataPoint objects.
 * Rows missing required x/y/category values are silently skipped.
 */
export function parseRows(
    table: powerbi.DataViewTable,
    cols: ColumnIndex,
    host: IVisualHost,
    defaultColor: string,
    colorByCategory: boolean,
): ParseResult {
    resetCategoryColors();

    const points: ScatterDataPoint[] = [];
    const playAxisSet = new Set<string>();
    const seriesSet = new Set<string>();
    const categorySet = new Set<string>();

    const hasSize = cols.size >= 0;
    const hasPlayAxis = cols.playAxis >= 0;
    const hasSeries = cols.series >= 0;

    if (!table.rows) {
        return {
            points,
            hasSize,
            hasPlayAxis,
            hasSeries,
            playAxisValues: [],
            seriesValues: [],
            categoryValues: [],
        };
    }

    for (let r = 0; r < table.rows.length; r++) {
        const row = table.rows[r];

        /* ── Required fields ── */
        const xRaw = row[cols.xValue];
        const yRaw = row[cols.yValue];
        const catRaw = row[cols.category];

        if (xRaw == null || yRaw == null || catRaw == null) continue;

        const x = Number(xRaw);
        const y = Number(yRaw);
        if (isNaN(x) || isNaN(y)) continue;

        const category = String(catRaw);
        categorySet.add(category);

        /* ── Optional fields ── */
        const sizeVal = hasSize && row[cols.size] != null
            ? Number(row[cols.size])
            : null;

        const seriesVal = hasSeries && row[cols.series] != null
            ? String(row[cols.series])
            : null;

        if (seriesVal) seriesSet.add(seriesVal);

        const playVal = hasPlayAxis && row[cols.playAxis] != null
            ? String(row[cols.playAxis])
            : null;

        if (playVal) playAxisSet.add(playVal);

        /* ── Tooltip extras ── */
        const tooltipExtras: TooltipExtra[] = [];
        for (const ttIdx of cols.tooltipFields) {
            const col = table.columns[ttIdx];
            tooltipExtras.push({
                displayName: col.displayName || `Field ${ttIdx}`,
                value: cellToString(row[ttIdx]),
            });
        }

        /* ── Colour assignment ── */
        const colorKey = seriesVal ?? category;
        const color = colorByCategory
            ? getCategoryColor(colorKey)
            : defaultColor;

        /* ── Selection ID ── */
        const selectionId = host
            .createSelectionIdBuilder()
            .withTable(table, r)
            .createSelectionId();

        points.push({
            id: `pt-${r}`,
            rowIndex: r,
            x,
            y,
            size: sizeVal,
            category,
            series: seriesVal,
            playAxisValue: playVal,
            tooltipExtras,
            color,
            selectionId,
        });
    }

    /* ── Sort play-axis values ── */
    const playAxisValues = sortPlayAxisValues(Array.from(playAxisSet));

    return {
        points,
        hasSize,
        hasPlayAxis,
        hasSeries,
        playAxisValues,
        seriesValues: Array.from(seriesSet).sort(),
        categoryValues: Array.from(categorySet).sort(),
    };
}

/**
 * Sort play-axis values: chronologically if all are valid dates,
 * otherwise lexicographically ascending.
 */
function sortPlayAxisValues(values: string[]): string[] {
    if (values.length === 0) return values;

    const allDates = values.every((v) => !isNaN(Date.parse(v)));
    if (allDates) {
        return values.sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime(),
        );
    }
    return values.sort();
}
