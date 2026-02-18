import type { GanttTask, SortField, SortDirection } from "../types";
import { DAY_MS, MAX_HIERARCHY_DEPTH } from "../constants";
import { daysBetween } from "../utils/date";

/* ─── Build hierarchy from multi-column task names ─── */
export function buildMultiColumnHierarchy(
    leafTasks: GanttTask[],
    numLevels: number,
    taskById: Map<string, GanttTask>,
    expandedSet: Set<string>,
): GanttTask[] {
    const groupMap = new Map<string, GanttTask>();
    const rootTasks: GanttTask[] = [];
    let syntheticIdx = 0;

    for (const leaf of leafTasks) {
        const path = leaf.hierarchyPath;
        const groupDepth = numLevels - 1;
        let parentGroup: GanttTask | null = null;

        for (let level = 0; level < groupDepth; level++) {
            const segmentName = path[level] || "(blank)";
            const pathKey = path.slice(0, level + 1).join("|||");

            let group = groupMap.get(pathKey);
            if (!group) {
                const groupId = "__group_" + syntheticIdx++;
                group = makeSyntheticGroup(groupId, segmentName, level, path.slice(0, level + 1));
                groupMap.set(pathKey, group);
                taskById.set(groupId, group);
                if (parentGroup) parentGroup.children.push(group);
                else rootTasks.push(group);
            }
            parentGroup = group;
        }

        leaf.depth = groupDepth;
        leaf.parentId = parentGroup ? parentGroup.id : "";
        if (parentGroup) parentGroup.children.push(leaf);
        else rootTasks.push(leaf);
    }

    rollUpGroupDates(rootTasks);
    applyExpandState(rootTasks, expandedSet);
    return rootTasks;
}

/* ─── Build hierarchy from explicit parent field ─── */
export function buildExplicitParentHierarchy(
    leafTasks: GanttTask[],
    taskById: Map<string, GanttTask>,
    expandedSet: Set<string>,
): GanttTask[] {
    for (const t of leafTasks) { t.children = []; t.depth = 0; t.isGroup = false; }
    const rootTasks: GanttTask[] = [];

    for (const t of leafTasks) {
        if (t.parentId && taskById.has(t.parentId) && t.parentId !== t.id) {
            const par = taskById.get(t.parentId)!;
            par.children.push(t);
            par.isGroup = true;
        } else {
            rootTasks.push(t);
        }
    }

    /* Detect and sever circular parent references before computing depth */
    breakCircularRefs(rootTasks, new Set<string>());

    setDepth(rootTasks, 0);
    rollUpGroupDates(rootTasks);
    applyExpandState(rootTasks, expandedSet);
    return rootTasks;
}

/* ─── Sort ─── */
export function applySortRecursive(
    tasks: GanttTask[],
    sortBy: SortField,
    sortDirection: SortDirection,
): void {
    if (sortBy === "none") return;
    const dir = sortDirection === "desc" ? -1 : 1;

    const cmp = (a: GanttTask, b: GanttTask): number => {
        let r = 0;
        switch (sortBy) {
            case "startDate": r = a.start.getTime() - b.start.getTime(); break;
            case "endDate":   r = a.end.getTime() - b.end.getTime(); break;
            case "name":      r = a.name.localeCompare(b.name); break;
            case "progress":  r = a.progress - b.progress; break;
            case "priority":  r = a.priority.localeCompare(b.priority); break;
            case "status":    r = a.status.localeCompare(b.status); break;
            case "duration":  r = a.duration - b.duration; break;
            case "resource":  r = a.resource.localeCompare(b.resource); break;
            default: r = 0;
        }
        return r * dir;
    };

    const sortRec = (t: GanttTask[]): void => {
        t.sort(cmp);
        for (const n of t) { if (n.children.length > 0) sortRec(n.children); }
    };
    sortRec(tasks);
}

/* ─── Flatten visible (respects expand + search) ─── */
export function flattenVisible(
    rootTasks: GanttTask[],
    searchTerm: string,
): GanttTask[] {
    const result: GanttTask[] = [];
    const hasSearch = searchTerm.length > 0;

    const matchesSearch = (t: GanttTask): boolean => {
        if (!hasSearch) return true;
        return (
            t.name.toLowerCase().includes(searchTerm) ||
            t.resource.toLowerCase().includes(searchTerm) ||
            t.status.toLowerCase().includes(searchTerm) ||
            t.wbs.toLowerCase().includes(searchTerm)
        );
    };

    const taskOrChildMatches = (t: GanttTask): boolean => {
        if (matchesSearch(t)) return true;
        for (const c of t.children) { if (taskOrChildMatches(c)) return true; }
        return false;
    };

    const walk = (tasks: GanttTask[]): void => {
        for (const t of tasks) {
            if (hasSearch && !taskOrChildMatches(t)) continue;
            t.isVisible = true;
            result.push(t);
            if (t.isGroup && t.isExpanded) walk(t.children);
        }
    };
    walk(rootTasks);
    return result;
}

/* ─── Expand / Collapse ─── */
export function expandAll(rootTasks: GanttTask[], expandedSet: Set<string>): void {
    walkGroups(rootTasks, t => { expandedSet.add(t.id); t.isExpanded = true; });
}

export function collapseAll(rootTasks: GanttTask[], expandedSet: Set<string>): void {
    walkGroups(rootTasks, t => { expandedSet.delete(t.id); t.isExpanded = false; });
}

export function toggleExpand(task: GanttTask, expandedSet: Set<string>): void {
    if (task.isExpanded) { expandedSet.delete(task.id); task.isExpanded = false; }
    else { expandedSet.add(task.id); task.isExpanded = true; }
}

/* ─── Critical path (simplified forward/backward pass) ─── */
export function computeCriticalPath(
    leafTasks: GanttTask[],
    taskById: Map<string, GanttTask>,
): Set<string> {
    const ids = new Set<string>();
    const leaves = leafTasks.filter(t => !t.isGroup && !t.isMilestone);
    if (leaves.length === 0) return ids;

    const earlyFinish = new Map<string, number>();
    for (const t of leaves) {
        let ef = t.end.getTime();
        for (const depId of t.dependencyIds) {
            const dep = taskById.get(depId);
            if (dep) {
                const depEf = earlyFinish.get(depId) ?? dep.end.getTime();
                const dur = t.end.getTime() - t.start.getTime();
                ef = Math.max(ef, depEf + dur);
            }
        }
        earlyFinish.set(t.id, ef);
    }

    let projectEnd = -Infinity;
    for (const [, ef] of earlyFinish) { if (ef > projectEnd) projectEnd = ef; }

    const lateStart = new Map<string, number>();
    for (let i = leaves.length - 1; i >= 0; i--) {
        const t = leaves[i];
        const dur = t.end.getTime() - t.start.getTime();
        let ls = projectEnd - dur;
        for (const other of leaves) {
            if (other.dependencyIds.includes(t.id)) {
                const otherLs = lateStart.get(other.id) ?? projectEnd;
                ls = Math.min(ls, otherLs - dur);
            }
        }
        lateStart.set(t.id, ls);
    }

    for (const t of leaves) {
        const ef = earlyFinish.get(t.id) ?? t.end.getTime();
        const ls = lateStart.get(t.id) ?? 0;
        const es = ef - (t.end.getTime() - t.start.getTime());
        t.isCritical = Math.abs(ls - es) < DAY_MS;
        if (t.isCritical) ids.add(t.id);
    }
    return ids;
}

/* ─── Internals ─── */
function makeSyntheticGroup(id: string, name: string, depth: number, hierPath: string[]): GanttTask {
    return {
        index: -1, id, name,
        start: new Date(8640000000000000), end: new Date(-8640000000000000),
        plannedStart: null, plannedEnd: null,
        progress: 0, isMilestone: false, milestoneMarkers: [],
        parentId: "", resource: "", dependencyIds: [],
        priority: "", status: "", wbs: "",
        depth, isGroup: true, isSyntheticGroup: true,
        isExpanded: true, children: [], selectionId: null,
        tooltipExtra: [], color: "", hierarchyPath: hierPath,
        isCritical: false, isVisible: true, duration: 0,
    };
}

function rollUpGroupDates(tasks: GanttTask[]): void {
    for (const t of tasks) {
        if (t.children.length === 0) continue;
        rollUpGroupDates(t.children);
        let minStart = Infinity, maxEnd = -Infinity;
        let progressSum = 0, leafCount = 0;
        collectLeafStats(t, s => {
            if (s.start.getTime() < minStart) minStart = s.start.getTime();
            if (s.end.getTime() > maxEnd) maxEnd = s.end.getTime();
            progressSum += s.progress;
            leafCount++;
        });
        if (leafCount > 0) {
            t.start = new Date(minStart);
            t.end = new Date(maxEnd);
            t.progress = progressSum / leafCount;
            t.duration = daysBetween(t.start, t.end);
        }
        t.isGroup = true;
    }
}

function collectLeafStats(node: GanttTask, cb: (leaf: GanttTask) => void): void {
    for (const c of node.children) {
        if (c.children.length === 0) cb(c);
        else collectLeafStats(c, cb);
    }
}

function applyExpandState(tasks: GanttTask[], expandedSet: Set<string>): void {
    const isFirstRun = !expandedSet.has("__initialized");
    if (isFirstRun) expandedSet.add("__initialized");
    walkGroups(tasks, t => {
        if (isFirstRun) { expandedSet.add(t.id); t.isExpanded = true; }
        else { t.isExpanded = expandedSet.has(t.id); }
    });
}

function setDepth(tasks: GanttTask[], d: number): void {
    if (d > MAX_HIERARCHY_DEPTH) return;
    for (const t of tasks) { t.depth = d; setDepth(t.children, d + 1); }
}

/**
 * Walk the tree and sever child links where a node has already been visited
 * (which indicates a circular reference). Operates in-place.
 */
function breakCircularRefs(tasks: GanttTask[], visited: Set<string>): void {
    for (const t of tasks) {
        if (visited.has(t.id)) {
            /* This node is already an ancestor — remove all its children to break the cycle */
            t.children = [];
            continue;
        }
        visited.add(t.id);
        if (t.children.length > 0) breakCircularRefs(t.children, new Set(visited));
        visited.delete(t.id);
    }
}

function walkGroups(tasks: GanttTask[], fn: (t: GanttTask) => void): void {
    for (const t of tasks) {
        if (t.isGroup) fn(t);
        if (t.children.length > 0) walkGroups(t.children, fn);
    }
}
