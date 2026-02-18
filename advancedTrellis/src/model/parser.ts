/* ═══════════════════════════════════════════════
   Advanced Trellis – Data Parser
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import type {
    ColumnIndex,
    TrellisDataPoint,
    TrellisPanel,
    ParseResult,
    ColorPalette,
} from "../types";
import { getColorByIndex } from "../utils/color";

/**
 * Parse DataViewTable rows into the trellis domain model.
 * Groups data by trellis field, builds panels with series buckets.
 */
export function parseRows(
    table: powerbi.DataViewTable,
    cols: ColumnIndex,
    host: powerbi.extensibility.visual.IVisualHost,
    palette: ColorPalette,
    defaultBarColor: string,
): ParseResult {
    const panelMap = new Map<string, TrellisDataPoint[]>();
    const seriesIndexMap = new Map<string, number>();
    const allCategoriesSet = new Set<string>();
    let globalMin = Infinity;
    let globalMax = -Infinity;

    const rows = table.rows ?? [];
    const tableColumns = table.columns ?? [];

    for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        const trellisRaw = row[cols.trellisBy];
        const categoryRaw = row[cols.category];
        const valueRaw = row[cols.value];

        /* Skip rows missing required fields (T1) */
        if (trellisRaw == null || categoryRaw == null || valueRaw == null) continue;

        const trellisValue = String(trellisRaw);
        const categoryValue = String(categoryRaw);
        const value = Number(valueRaw);

        if (isNaN(value)) continue;

        const seriesValue =
            cols.series >= 0 && row[cols.series] != null
                ? String(row[cols.series])
                : null;

        /* Build tooltip extras */
        const tooltipExtras: { displayName: string; value: string }[] = [];
        for (const ti of cols.tooltipFields) {
            if (row[ti] != null) {
                tooltipExtras.push({
                    displayName: tableColumns[ti]?.displayName ?? "Field",
                    value: String(row[ti]),
                });
            }
        }

        /* Assign colour by series or default */
        let color = defaultBarColor;
        if (seriesValue !== null) {
            if (!seriesIndexMap.has(seriesValue)) {
                seriesIndexMap.set(seriesValue, seriesIndexMap.size);
            }
            color = getColorByIndex(palette, seriesIndexMap.get(seriesValue)!);
        }

        /* Selection ID */
        const selectionId = host
            .createSelectionIdBuilder()
            .withTable(table, r)
            .createSelectionId();

        const point: TrellisDataPoint = {
            trellisValue,
            categoryValue,
            value,
            seriesValue,
            selectionId,
            tooltipExtras,
            color,
        };

        /* Track global range */
        if (value < globalMin) globalMin = value;
        if (value > globalMax) globalMax = value;

        allCategoriesSet.add(categoryValue);

        /* Group by trellis value */
        if (!panelMap.has(trellisValue)) {
            panelMap.set(trellisValue, []);
        }
        panelMap.get(trellisValue)!.push(point);
    }

    /* Ensure Y domain includes zero for bar charts */
    if (globalMin > 0) globalMin = 0;
    if (globalMax < 0) globalMax = 0;
    if (globalMin === Infinity) {
        globalMin = 0;
        globalMax = 1;
    }

    const allCategories = Array.from(allCategoriesSet);
    const allSeries = Array.from(seriesIndexMap.keys());

    /* Build panels */
    const panels: TrellisPanel[] = [];
    for (const [trellisValue, points] of panelMap) {
        const catSet = new Set<string>();
        const serSet = new Set<string>();
        const seriesBuckets = new Map<string, TrellisDataPoint[]>();

        for (const pt of points) {
            catSet.add(pt.categoryValue);
            const sKey = pt.seriesValue ?? "__default__";
            serSet.add(pt.seriesValue ?? "");
            if (!seriesBuckets.has(sKey)) {
                seriesBuckets.set(sKey, []);
            }
            seriesBuckets.get(sKey)!.push(pt);
        }

        panels.push({
            trellisValue,
            dataPoints: points,
            categories: Array.from(catSet),
            seriesNames: Array.from(serSet).filter(Boolean),
            seriesBuckets,
        });
    }

    return {
        panels,
        globalMinValue: globalMin,
        globalMaxValue: globalMax,
        allCategories,
        allSeries,
        hasSeries: seriesIndexMap.size > 0,
    };
}
