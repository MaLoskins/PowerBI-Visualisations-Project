/* ═══════════════════════════════════════════════
   Data Parser — categorical dataView → ParsedData
   ═══════════════════════════════════════════════ */
"use strict";

import powerbi from "powerbi-visuals-api";
import type { ColumnIndex, ParsedData, CategoryDataPoint, TooltipExtra } from "../types";
import { MAX_SERIES } from "../types";
import DataViewCategorical = powerbi.DataViewCategorical;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;

/** Parse categorical dataView into the chart domain model. */
export function parseData(
    categorical: DataViewCategorical,
    cols: ColumnIndex,
    host: IVisualHost,
): ParsedData {
    const catColumn = categorical.categories![cols.xCategoryIdx];
    const catValues = catColumn.values;
    const rowCount = catValues.length;
    const values = categorical.values;

    /* ── Determine measure names ── */
    const measureNames: string[] = [];
    let measureCount = 0;
    for (let m = 0; m < MAX_SERIES; m++) {
        const idx = cols.measureIndices[m];
        if (idx !== null && values) {
            measureNames.push(values[idx].source.displayName || `Measure ${m + 1}`);
            measureCount = m + 1;
        } else {
            measureNames.push(`Measure ${m + 1}`);
        }
    }

    /* ── Build category data points ── */
    const categories: CategoryDataPoint[] = [];

    for (let r = 0; r < rowCount; r++) {
        const label = catValues[r] != null ? String(catValues[r]) : "";

        const rowValues: (number | null)[] = [];
        for (let m = 0; m < MAX_SERIES; m++) {
            const vIdx = cols.measureIndices[m];
            if (vIdx !== null && values) {
                const raw = values[vIdx].values[r];
                rowValues.push(typeof raw === "number" ? raw : null);
            } else {
                rowValues.push(null);
            }
        }

        /* ── Tooltip extras ── */
        const tooltipExtras: TooltipExtra[] = [];
        for (const tIdx of cols.tooltipIndices) {
            if (values) {
                const tCol = values[tIdx];
                const tVal = tCol.values[r];
                tooltipExtras.push({
                    displayName: tCol.source.displayName || "Tooltip",
                    value: tVal != null ? String(tVal) : "",
                });
            }
        }

        /* ── Selection ID ── */
        const selectionId = host.createSelectionIdBuilder()
            .withCategory(catColumn, r)
            .createSelectionId();

        categories.push({
            categoryLabel: label,
            categoryIndex: r,
            values: rowValues,
            selectionId,
            tooltipExtras,
        });
    }

    return { categories, measureNames, measureCount };
}
