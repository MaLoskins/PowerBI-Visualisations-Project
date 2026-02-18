/* ═══════════════════════════════════════════════
   Hierarchy Filter Slicer – Filter Manager
   Builds and applies BasicFilter via the
   Advanced Filter API (F1)

   Note: We construct the filter JSON object
   manually rather than importing from
   powerbi-models, avoiding a bundler resolution
   issue with the pbiviz toolchain.
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";

import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataViewCategorical = powerbi.DataViewCategorical;

/* ── FilterAction numeric values (const enum workaround) ── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any — Power BI SDK const enum workaround (F2)
const FA_MERGE = 0 as any as powerbi.FilterAction;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FA_REMOVE = 1 as any as powerbi.FilterAction;

/* ── IBasicFilter JSON shape expected by host.applyJsonFilter ── */

interface BasicFilterJson {
    $schema: string;
    target: { table: string; column: string };
    filterType: number;
    operator: string;
    values: (string | number | boolean)[];
}

const BASIC_FILTER_SCHEMA = "http://powerbi.com/product/schema#basic";
const FILTER_TYPE_BASIC = 1;

/**
 * Extract the filter target (table + column) from the leaf-level
 * category column in the data view.
 */
export function getLeafFilterTarget(
    categorical: DataViewCategorical,
    leafCategoryIndex: number,
): { table: string; column: string } | null {
    const categories = categorical.categories;
    if (!categories || leafCategoryIndex >= categories.length) return null;

    const source = categories[leafCategoryIndex].source;
    if (!source || !source.queryName) return null;

    const dotIdx = source.queryName.indexOf(".");
    const table = dotIdx > 0 ? source.queryName.substring(0, dotIdx) : source.queryName;
    const column = source.displayName;

    return { table, column };
}

/**
 * Apply a BasicFilter on the leaf column with the given checked values.
 * If checkedValues is empty or covers all leaves, the filter is removed.
 */
export function applyFilter(
    host: IVisualHost,
    target: { table: string; column: string },
    checkedValues: string[],
    totalLeafCount: number,
): void {
    /* ── If nothing is checked or everything is checked, clear the filter ── */
    if (checkedValues.length === 0 || checkedValues.length >= totalLeafCount) {
        clearFilter(host);
        return;
    }

    const filter: BasicFilterJson = {
        $schema: BASIC_FILTER_SCHEMA,
        target,
        filterType: FILTER_TYPE_BASIC,
        operator: "In",
        values: checkedValues,
    };

    host.applyJsonFilter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any — SDK expects IFilter, JSON shape is compatible (F3)
        filter as any,
        "general",
        "filter",
        FA_MERGE,
    );
}

/** Remove any applied filter. */
export function clearFilter(host: IVisualHost): void {
    host.applyJsonFilter(
        null,
        "general",
        "filter",
        FA_REMOVE,
    );
}
