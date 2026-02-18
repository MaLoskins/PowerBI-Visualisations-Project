import powerbi from "powerbi-visuals-api";
import type { ColumnIndex, GanttTask, MilestoneMarker } from "../types";
import { RESOURCE_COLORS } from "../constants";
import { toDate, daysBetween } from "../utils/date";
import { clamp } from "../utils/dom";
import { isHexColor } from "../utils/color";

export interface ParseResult {
    tasks: GanttTask[];
    taskById: Map<string, GanttTask>;
    resourceColorMap: Map<string, string>;
    colorFieldMap: Map<string, string>;
}

/**
 * Parse every row of the DataViewTable into leaf GanttTask objects.
 * Rows that lack valid start/end dates are silently skipped.
 */
export function parseLeafRows(
    table: powerbi.DataViewTable,
    cols: ColumnIndex,
    host: powerbi.extensibility.visual.IVisualHost,
): ParseResult {
    const tasks: GanttTask[] = [];
    const taskById = new Map<string, GanttTask>();
    const resourceColorMap = new Map<string, string>();
    const colorFieldMap = new Map<string, string>();
    let resourceIdx = 0;
    let colorFieldIdx = 0;

    for (let r = 0; r < table.rows.length; r++) {
        const row = table.rows[r];

        /* Hierarchy path */
        const hierPath: string[] = [];
        for (const colIdx of cols.taskNames) {
            const v = row[colIdx];
            hierPath.push(v != null ? String(v) : "");
        }
        let displayName = "";
        for (let h = hierPath.length - 1; h >= 0; h--) {
            if (hierPath[h].length > 0) { displayName = hierPath[h]; break; }
        }
        if (displayName === "") displayName = "(unnamed)";

        /* Dates */
        const startRaw = toDate(row[cols.startDate]);
        const endRaw = toDate(row[cols.endDate]);
        if (!startRaw || !endRaw) continue;
        const start = startRaw;
        const end = endRaw < startRaw ? startRaw : endRaw;

        const plannedStart = cols.plannedStart >= 0 ? toDate(row[cols.plannedStart]) : null;
        const plannedEnd = cols.plannedEnd >= 0 ? toDate(row[cols.plannedEnd]) : null;

        /* Task ID */
        let id = "row_" + r;
        if (cols.taskId >= 0 && row[cols.taskId] != null) {
            id = String(row[cols.taskId]).trim();
        }

        /* Progress (stored 0-1 internally; F2) */
        const progress = parseProgress(row, cols);

        /* Milestones */
        const milestoneMarkers: MilestoneMarker[] = [];
        let isMilestone = false;
        for (let mi = 0; mi < cols.milestones.length; mi++) {
            const mcol = cols.milestones[mi];
            const mv = row[mcol];
            if (mv == null) continue;
            const msDate = toDate(mv);
            if (msDate) {
                milestoneMarkers.push({
                    date: msDate,
                    label: table.columns[mcol].displayName || "Milestone " + (mi + 1),
                    styleIndex: mi,
                });
            } else {
                const mvStr = String(mv).toLowerCase().trim();
                if (mv === true || mv === 1 || ["true", "yes", "1", "y", "milestone"].includes(mvStr)) {
                    isMilestone = true;
                }
            }
        }
        if (!isMilestone && milestoneMarkers.length === 0 && start.getTime() === end.getTime()) {
            isMilestone = true;
        }

        const parentId = cols.parent >= 0 && row[cols.parent] != null ? String(row[cols.parent]).trim() : "";
        const resource = cols.resource >= 0 && row[cols.resource] != null ? String(row[cols.resource]).trim() : "";

        let dependencyIds: string[] = [];
        if (cols.dependencies >= 0 && row[cols.dependencies] != null) {
            const dStr = String(row[cols.dependencies]).trim();
            if (dStr.length > 0) {
                dependencyIds = dStr.split(/[,;|]+/).map(s => s.trim()).filter(s => s.length > 0);
            }
        }

        const priority = cols.priority >= 0 && row[cols.priority] != null ? String(row[cols.priority]).trim() : "";
        const status = cols.status >= 0 && row[cols.status] != null ? String(row[cols.status]).trim() : "";
        const wbs = cols.wbs >= 0 && row[cols.wbs] != null ? String(row[cols.wbs]).trim() : "";

        /* Color field / resource colour */
        let color = "";
        if (cols.colorField >= 0 && row[cols.colorField] != null) {
            const cv = String(row[cols.colorField]).trim();
            if (isHexColor(cv)) {
                color = cv;
            } else {
                if (!colorFieldMap.has(cv)) {
                    colorFieldMap.set(cv, RESOURCE_COLORS[colorFieldIdx % RESOURCE_COLORS.length]);
                    colorFieldIdx++;
                }
                color = colorFieldMap.get(cv)!;
            }
        }
        if (!color && resource.length > 0) {
            if (!resourceColorMap.has(resource)) {
                resourceColorMap.set(resource, RESOURCE_COLORS[resourceIdx % RESOURCE_COLORS.length]);
                resourceIdx++;
            }
            color = resourceColorMap.get(resource)!;
        }

        /* Tooltip extras */
        const tooltipExtra: powerbi.extensibility.VisualTooltipDataItem[] = [];
        for (const ti of cols.tooltipFields) {
            if (row[ti] != null) {
                tooltipExtra.push({ displayName: table.columns[ti].displayName || "", value: String(row[ti]) });
            }
        }

        const selectionId = host.createSelectionIdBuilder().withTable(table, r).createSelectionId();

        tasks.push({
            index: r, id, name: displayName, start, end,
            plannedStart, plannedEnd, progress,
            isMilestone, milestoneMarkers,
            parentId, resource, dependencyIds,
            priority, status, wbs,
            depth: 0, isGroup: false, isSyntheticGroup: false,
            isExpanded: true, children: [], selectionId,
            tooltipExtra, color, hierarchyPath: hierPath,
            isCritical: false, isVisible: true,
            duration: Math.max(0, daysBetween(start, end)),
        });
        taskById.set(id, tasks[tasks.length - 1]);
    }
    return { tasks, taskById, resourceColorMap, colorFieldMap };
}

function parseProgress(
    row: powerbi.DataViewTableRow,
    cols: ColumnIndex,
): number {
    if (cols.progress < 0 || row[cols.progress] == null) return 0;
    const pv = Number(row[cols.progress]);
    if (isNaN(pv)) return 0;
    if (cols.progressBase >= 0 && row[cols.progressBase] != null) {
        const base = Number(row[cols.progressBase]);
        if (!isNaN(base) && base > 0) return clamp(pv / base, 0, 1);
    }
    let normalized = pv;
    if (normalized > 1 && normalized <= 100) normalized /= 100;
    else if (normalized > 100) normalized = 1;
    return clamp(normalized, 0, 1);
}
