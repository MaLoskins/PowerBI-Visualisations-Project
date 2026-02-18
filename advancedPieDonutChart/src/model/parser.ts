/*
 *  Advanced Pie / Donut Chart – Power BI Custom Visual
 *  model/parser.ts – parseSlices() – row → domain model
 */
"use strict";

import powerbi from "powerbi-visuals-api";
import IVisualHost = powerbi.extensibility.visual.IVisualHost;

import {
    ColumnIndex,
    PieSlice,
    OuterSlice,
    ParseResult,
    TooltipExtra,
    RenderConfig,
} from "../types";
import { resolvePalette, lightenColor } from "../utils/color";

/* ═══════════════════════════════════════════════
   Parse Rows into PieSlice[]
   ═══════════════════════════════════════════════ */

/** Parse table rows into domain slices (M2) */
export function parseSlices(
    table: powerbi.DataViewTable,
    cols: ColumnIndex,
    host: IVisualHost,
    cfg: RenderConfig,
): ParseResult {
    const hasOuter = cols.outerCategory >= 0;

    /* ── Step 1: extract raw rows ── */
    interface RawRow {
        category: string;
        value: number;
        outerCategory: string;
        tooltipExtras: TooltipExtra[];
        selectionId: powerbi.visuals.ISelectionId;
    }

    const rawRows: RawRow[] = [];
    const rows = table.rows;
    if (!rows) return { slices: [], total: 0, hasOuterCategory: hasOuter };

    for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        const catVal = row[cols.category];
        const numVal = row[cols.value];
        if (catVal == null || numVal == null) continue;

        const category = String(catVal);
        const value = Number(numVal);
        if (!isFinite(value) || value <= 0) continue;

        const outerCategory = hasOuter ? String(row[cols.outerCategory] ?? "") : "";

        const tooltipExtras: TooltipExtra[] = [];
        for (const ti of cols.tooltipFields) {
            const col = table.columns[ti];
            tooltipExtras.push({
                displayName: col.displayName || `Field ${ti}`,
                value: String(row[ti] ?? ""),
            });
        }

        const selectionId = host
            .createSelectionIdBuilder()
            .withTable(table, r)
            .createSelectionId();

        rawRows.push({ category, value, outerCategory, tooltipExtras, selectionId });
    }

    /* ── Step 2: aggregate by category ── */
    const categoryMap = new Map<string, {
        value: number;
        selectionId: powerbi.visuals.ISelectionId;
        tooltipExtras: TooltipExtra[];
        outerMap: Map<string, { value: number; selectionId: powerbi.visuals.ISelectionId; tooltipExtras: TooltipExtra[] }>;
    }>();

    for (const raw of rawRows) {
        let entry = categoryMap.get(raw.category);
        if (!entry) {
            entry = {
                value: 0,
                selectionId: raw.selectionId,
                tooltipExtras: raw.tooltipExtras,
                outerMap: new Map(),
            };
            categoryMap.set(raw.category, entry);
        }
        entry.value += raw.value;

        if (hasOuter && raw.outerCategory) {
            let outer = entry.outerMap.get(raw.outerCategory);
            if (!outer) {
                outer = { value: 0, selectionId: raw.selectionId, tooltipExtras: raw.tooltipExtras };
                entry.outerMap.set(raw.outerCategory, outer);
            }
            outer.value += raw.value;
        }
    }

    /* ── Step 3: compute total and build slices ── */
    let total = 0;
    categoryMap.forEach((entry) => (total += entry.value));
    if (total <= 0) return { slices: [], total: 0, hasOuterCategory: hasOuter };

    /* resolve palette colours */
    const colors = resolvePalette(
        cfg.color.colorPalette,
        categoryMap.size,
        cfg.color.monochromeBase,
    );

    let slices: PieSlice[] = [];
    let idx = 0;

    categoryMap.forEach((entry, category) => {
        const percent = entry.value / total;
        const color = colors[idx % colors.length];

        /* build outer slices */
        const outerSlices: OuterSlice[] = [];
        entry.outerMap.forEach((ov, outerCat) => {
            outerSlices.push({
                category,
                outerCategory: outerCat,
                value: ov.value,
                percent: ov.value / total,
                color: lightenColor(color, 15),
                selectionId: ov.selectionId,
                tooltipExtras: ov.tooltipExtras,
            });
        });

        slices.push({
            category,
            value: entry.value,
            percent,
            color,
            selectionId: entry.selectionId,
            tooltipExtras: entry.tooltipExtras,
            isOther: false,
            otherChildren: [],
            outerSlices,
        });
        idx++;
    });

    /* ── Step 4: sort ── */
    slices = sortSlices(slices, cfg.chart.sortSlices);

    /* ── Step 5: group small slices into "Other" ── */
    if (cfg.other.groupSmallSlices) {
        slices = groupOtherSlices(slices, cfg.other, total);
    }

    return { slices, total, hasOuterCategory: hasOuter };
}

/* ── Sorting ── */

function sortSlices(slices: PieSlice[], mode: string): PieSlice[] {
    switch (mode) {
        case "valueAsc":
            return [...slices].sort((a, b) => a.value - b.value);
        case "valueDesc":
            return [...slices].sort((a, b) => b.value - a.value);
        case "nameAsc":
            return [...slices].sort((a, b) => a.category.localeCompare(b.category));
        case "nameDesc":
            return [...slices].sort((a, b) => b.category.localeCompare(a.category));
        default:
            return slices;
    }
}

/* ── "Other" Grouping ── */

function groupOtherSlices(
    slices: PieSlice[],
    otherCfg: RenderConfig["other"],
    total: number,
): PieSlice[] {
    const threshold = otherCfg.otherThresholdFraction;
    const kept: PieSlice[] = [];
    const smalls: PieSlice[] = [];

    for (const s of slices) {
        if (s.percent < threshold) {
            smalls.push(s);
        } else {
            kept.push(s);
        }
    }

    if (smalls.length <= 1) return slices; /* no point grouping 0-1 slices */

    let otherValue = 0;
    for (const s of smalls) otherValue += s.value;

    const otherSlice: PieSlice = {
        category: otherCfg.otherLabel,
        value: otherValue,
        percent: otherValue / total,
        color: otherCfg.otherColor,
        selectionId: smalls[0].selectionId, /* use first child's ID */
        tooltipExtras: [],
        isOther: true,
        otherChildren: smalls,
        outerSlices: [],
    };

    kept.push(otherSlice);
    return kept;
}
