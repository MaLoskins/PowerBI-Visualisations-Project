import powerbi from "powerbi-visuals-api";
import type { ColumnIndex } from "../types";

/** Resolve data role → column index mappings from the DataViewTable. */
export function resolveColumns(table: powerbi.DataViewTable): ColumnIndex {
    const idx: ColumnIndex = {
        taskNames: [],
        startDate: -1,
        endDate: -1,
        taskId: -1,
        parent: -1,
        progress: -1,
        progressBase: -1,
        milestones: [],
        resource: -1,
        dependencies: -1,
        priority: -1,
        status: -1,
        wbs: -1,
        plannedStart: -1,
        plannedEnd: -1,
        colorField: -1,
        tooltipFields: [],
    };

    for (let i = 0; i < table.columns.length; i++) {
        const roles = table.columns[i].roles;
        if (!roles) continue;
        if (roles["taskName"]) idx.taskNames.push(i);
        if (roles["startDate"]) idx.startDate = i;
        if (roles["endDate"]) idx.endDate = i;
        if (roles["taskId"]) idx.taskId = i;
        if (roles["parent"]) idx.parent = i;
        if (roles["progress"]) idx.progress = i;
        if (roles["progressBase"]) idx.progressBase = i;
        if (roles["milestone"]) idx.milestones.push(i);
        if (roles["resource"]) idx.resource = i;
        if (roles["dependencies"]) idx.dependencies = i;
        if (roles["priority"]) idx.priority = i;
        if (roles["status"]) idx.status = i;
        if (roles["wbs"]) idx.wbs = i;
        if (roles["plannedStart"]) idx.plannedStart = i;
        if (roles["plannedEnd"]) idx.plannedEnd = i;
        if (roles["colorField"]) idx.colorField = i;
        if (roles["tooltipFields"]) idx.tooltipFields.push(i);
    }
    return idx;
}
