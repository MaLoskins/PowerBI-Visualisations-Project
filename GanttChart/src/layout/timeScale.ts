import { scaleTime } from "d3-scale";
import type { ScaleTime } from "d3-scale";
import type { GanttTask, ZoomLevel } from "../types";
import {
    DAY_MS, ZOOM_PX_PER_DAY,
    FIT_ZOOM_PADDING_PX, FIT_ZOOM_MIN_PX, FIT_ZOOM_MIN_PPD,
} from "../constants";
import { daysBetween } from "../utils/date";

export interface TimeRange {
    readonly min: Date;
    readonly max: Date;
}

/** Compute the min/max date range including planned + milestone dates. */
export function computeTimeRange(leafTasks: GanttTask[], paddingDays: number): TimeRange {
    let minT = Infinity;
    let maxT = -Infinity;
    for (const t of leafTasks) {
        const startT = t.start.getTime();
        const endT   = t.end.getTime();
        if (startT < minT) minT = startT;
        if (endT   > maxT) maxT = endT;
        if (t.plannedStart) {
            const pt = t.plannedStart.getTime();
            if (pt < minT) minT = pt;
        }
        if (t.plannedEnd) {
            const pt = t.plannedEnd.getTime();
            if (pt > maxT) maxT = pt;
        }
        for (const ms of t.milestoneMarkers) {
            const mt = ms.date.getTime();
            if (mt < minT) minT = mt;
            if (mt > maxT) maxT = mt;
        }
    }
    /* No valid dates found – return a 1-day window around today */
    if (!isFinite(minT)) {
        const now = Date.now();
        return { min: new Date(now), max: new Date(now + DAY_MS) };
    }
    /* Single-point or same-date range – expand by one padding day minimum */
    const effectivePadding = Math.max(1, paddingDays);
    return {
        min: new Date(minT - DAY_MS * effectivePadding),
        max: new Date(maxT + DAY_MS * effectivePadding),
    };
}

/** Get pxPerDay for the current zoom level. */
export function computePxPerDay(
    zoom: ZoomLevel,
    timeMin: Date,
    timeMax: Date,
    availableWidth: number,
): number {
    if (zoom === "fit") {
        const totalDays = Math.max(1, daysBetween(timeMin, timeMax));
        const available = Math.max(FIT_ZOOM_MIN_PX, availableWidth - FIT_ZOOM_PADDING_PX);
        return Math.max(FIT_ZOOM_MIN_PPD, available / totalDays);
    }
    return ZOOM_PX_PER_DAY[zoom] ?? 5;
}

/** Build a d3 scaleTime for the given range and pxPerDay. */
export function buildTimeScale(
    timeMin: Date,
    timeMax: Date,
    pxPerDay: number,
): ScaleTime<number, number> {
    const totalDays = Math.max(1, daysBetween(timeMin, timeMax));
    const totalWidth = totalDays * pxPerDay;
    return scaleTime<number>().domain([timeMin, timeMax]).range([0, totalWidth]);
}
