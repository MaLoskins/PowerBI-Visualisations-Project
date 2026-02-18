/* ═══════════════════════════════════════════════
   Data Parser – categorical DataView → RadarData
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataViewCategorical = powerbi.DataViewCategorical;
import DataViewValueColumnGroup = powerbi.DataViewValueColumnGroup;

import { RadarData, RadarSeries, RadarDataPoint, TooltipItem } from "../types";
import { formatTooltipValue } from "../utils/format";
import { getSeriesColor } from "../utils/color";

/** Parse a categorical DataView into the radar domain model */
export function parseRadarData(
    categorical: DataViewCategorical,
    host: IVisualHost,
    palette: string,
): RadarData {
    const categories = categorical.categories?.[0];
    const values = categorical.values;

    if (!categories || !values || categories.values.length === 0) {
        return { axes: [], series: [], hasData: false };
    }

    const axes: string[] = categories.values.map(
        (v) => (v != null ? String(v) : ""),
    );

    const groups: DataViewValueColumnGroup[] = values.grouped?.()
        ? values.grouped()
        : [];

    const series: RadarSeries[] = [];

    if (groups.length > 0) {
        /* ── Multiple series via grouping ── */
        for (let gi = 0; gi < groups.length; gi++) {
            const group = groups[gi];
            const seriesName = group.name != null ? String(group.name) : `Series ${gi + 1}`;
            const color = getSeriesColor(palette, gi);
            const points: RadarDataPoint[] = [];

            /* Each group has one value column per measure (we expect one) */
            const valueCol = group.values[0];
            if (!valueCol) continue;

            for (let ai = 0; ai < axes.length; ai++) {
                const rawVal = valueCol.values[ai];
                const numVal = typeof rawVal === "number" ? rawVal : 0;

                const selectionId = host
                    .createSelectionIdBuilder()
                    .withCategory(categories, ai)
                    .withSeries(values, group)
                    .createSelectionId();

                const tooltipItems = buildTooltipItems(categorical, ai, gi);

                points.push({
                    axisName: axes[ai],
                    axisIndex: ai,
                    value: numVal,
                    formattedValue: formatTooltipValue(numVal),
                    seriesName,
                    seriesIndex: gi,
                    selectionId,
                    tooltipItems,
                });
            }

            series.push({ name: seriesName, index: gi, color, points });
        }
    } else {
        /* ── Single series (no series field) ── */
        const seriesName = values[0]?.source?.displayName ?? "Value";
        const color = getSeriesColor(palette, 0);
        const points: RadarDataPoint[] = [];

        const valueCol = values[0];
        if (!valueCol) return { axes, series: [], hasData: false };

        for (let ai = 0; ai < axes.length; ai++) {
            const rawVal = valueCol.values[ai];
            const numVal = typeof rawVal === "number" ? rawVal : 0;

            const selectionId = host
                .createSelectionIdBuilder()
                .withCategory(categories, ai)
                .createSelectionId();

            const tooltipItems = buildTooltipItems(categorical, ai, -1);

            points.push({
                axisName: axes[ai],
                axisIndex: ai,
                value: numVal,
                formattedValue: formatTooltipValue(numVal),
                seriesName,
                seriesIndex: 0,
                selectionId,
                tooltipItems,
            });
        }

        series.push({ name: seriesName, index: 0, color, points });
    }

    return { axes, series, hasData: series.length > 0 && axes.length > 0 };
}

/* ── Tooltip helpers ── */

function buildTooltipItems(
    categorical: DataViewCategorical,
    categoryIndex: number,
    _groupIndex: number,
): TooltipItem[] {
    const items: TooltipItem[] = [];
    /* Append any tooltipFields role columns */
    const vals: powerbi.DataViewValueColumn[] = categorical.values ? Array.from(categorical.values) : [];
    for (let i = 0; i < vals.length; i++) {
        const col = vals[i];
        if (col.source.roles?.["tooltipFields"]) {
            const raw = col.values[categoryIndex];
            items.push({
                displayName: col.source.displayName ?? "Tooltip",
                value: raw != null ? String(raw) : "",
            });
        }
    }
    return items;
}
