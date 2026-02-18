/* ═══════════════════════════════════════════════
   Column Resolution – categorical data roles
   ═══════════════════════════════════════════════ */

"use strict";

import powerbi from "powerbi-visuals-api";
import DataViewCategorical = powerbi.DataViewCategorical;

export interface CategoricalColumns {
    hasAxis: boolean;
    hasValue: boolean;
    hasSeries: boolean;
    categorical: DataViewCategorical;
}

/** Validate that required categorical columns are present */
export function resolveColumns(
    categorical: DataViewCategorical | undefined,
): CategoricalColumns | null {
    if (!categorical) return null;

    const hasAxis = !!(categorical.categories && categorical.categories.length > 0);
    const hasValue = !!(categorical.values && categorical.values.length > 0);

    if (!hasAxis || !hasValue) return null;

    const hasSeries = !!(
        categorical.values &&
        categorical.values.source &&
        categorical.values.source.roles &&
        categorical.values.source.roles["series"]
    );

    return { hasAxis, hasValue, hasSeries, categorical };
}
