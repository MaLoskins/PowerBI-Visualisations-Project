/* ═══════════════════════════════════════════════
   Packed Bubble Chart – Row Parser
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import DataViewTable = powerbi.DataViewTable;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;

import { BubbleNode, ColumnIndex, ParseResult, TooltipField } from "../types";
import { resolveBubbleColor } from "../utils/color";

/** Parse DataViewTable rows into BubbleNode domain objects.
 *  Rows missing category or with non-positive value are silently skipped. */
export function parseRows(
    table: DataViewTable,
    cols: ColumnIndex,
    host: IVisualHost,
    colorByGroup: boolean,
    defaultColor: string,
): ParseResult {
    const nodes: BubbleNode[] = [];
    const groupSet = new Set<string>();
    let minValue = Infinity;
    let maxValue = -Infinity;

    const hasGroupField = cols.group >= 0;
    const hasColorField = cols.colorField >= 0;
    const rows = table.rows ?? [];

    /* ── Build group list first for stable indexing ── */
    if (hasGroupField) {
        for (let r = 0; r < rows.length; r++) {
            const g = rows[r][cols.group];
            if (g != null) groupSet.add(String(g));
        }
    }
    const groups = Array.from(groupSet).sort();
    const groupIndexMap = new Map<string, number>();
    groups.forEach((g, i) => groupIndexMap.set(g, i));

    /* ── Parse rows ── */
    for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        const categoryRaw = row[cols.category];
        if (categoryRaw == null) continue;

        const valueRaw = row[cols.value];
        const value = typeof valueRaw === "number" ? valueRaw : Number(valueRaw);
        if (!isFinite(value) || value <= 0) continue;

        const category = String(categoryRaw);
        const group = hasGroupField && row[cols.group] != null ? String(row[cols.group]) : null;
        const colorHex = hasColorField && row[cols.colorField] != null ? String(row[cols.colorField]) : null;

        const groupIdx = group !== null ? (groupIndexMap.get(group) ?? -1) : -1;
        const fill = resolveBubbleColor(colorHex, group, groupIdx, colorByGroup, defaultColor);

        /* Tooltip extras */
        const tooltipFields: TooltipField[] = [];
        if (cols.tooltipStart >= 0) {
            for (let t = 0; t < cols.tooltipCount; t++) {
                const colIdx = cols.tooltipStart + t;
                const col = table.columns[colIdx];
                const val = row[colIdx];
                if (val != null) {
                    tooltipFields.push({
                        displayName: col.displayName ?? `Field ${t + 1}`,
                        value: String(val),
                    });
                }
            }
        }

        const selectionId = host.createSelectionIdBuilder()
            .withTable(table, r)
            .createSelectionId();

        if (value < minValue) minValue = value;
        if (value > maxValue) maxValue = value;

        nodes.push({
            id: r,
            category,
            value,
            group,
            colorHex,
            selectionId,
            tooltipFields,
            radius: 0,
            fill,
        });
    }

    if (minValue === Infinity) minValue = 0;
    if (maxValue === -Infinity) maxValue = 0;

    return {
        nodes,
        groups,
        hasGroupField,
        hasColorField,
        minValue,
        maxValue,
    };
}
